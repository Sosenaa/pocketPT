import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import math
from nutrition import calculate_portion
from food_candidate import collect_food_candidates


def propose_meal_from_candidates(request_text, candidates):
    if not candidates:
        raise ValueError("No food candidates are available")

    allowed_ids = [food["id"] for food in candidates]

    schema = {
        "type": "object",
        "properties": {
            "can_fulfil": {"type": "boolean"},
            "reason": {"type": "string"},
            "meal_name": {"type": "string"},
            "ingredients": {
                "type": "array",
                "maxItems": 6,
                "items": {
                    "type": "object",
                    "properties": {
                        "food_id": {
                            "type": "integer",
                            "enum": allowed_ids,
                        },
                        "grams": {
                            "type": "number",
                            "exclusiveMinimum": 0,
                        },
                    },
                    "required": ["food_id", "grams"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["can_fulfil", "reason", "meal_name", "ingredients"],
        "additionalProperties": False,
    }

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=(
            "Propose one meal using only the supplied food records. "
            "Respect the requested food identity and preparation state. "
            "Return food IDs and quantities in grams. "
            "Do not invent foods, IDs or nutrition values. "
            "If the available foods cannot fulfil the request, "
            "set can_fulfil to false, return an empty ingredients list "
            "and explain why."
        ),
        input=json.dumps({
            "request": request_text,
            "available_foods": candidates,
        }),
        text={
            "format": {
                "type": "json_schema",
                "name": "candidate_meal",
                "strict": True,
                "schema": schema,
            },
        },
    )

    if response.status != "completed" or not response.output_text:
        raise RuntimeError("AI did not return a complete proposal")

    return json.loads(response.output_text)


def calculate_candidate_meal(proposal, candidates):
    if proposal["can_fulfil"] is not True:
        raise ValueError(proposal["reason"] or "Cannot fulfil meal request")

    if not proposal["ingredients"]:
        raise ValueError("The meal has no ingredients")

    foods_by_id = {food["id"]: food for food in candidates}
    ingredients = []

    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for item in proposal["ingredients"]:
        food_id = item["food_id"]
        grams = item["grams"]

        if type(food_id) is not int or food_id not in foods_by_id:
            raise ValueError("Food ID is not in the supplied candidates")

        if isinstance(grams, bool) or not isinstance(grams, (int, float)):
            raise ValueError("Grams must be a number")

        if not math.isfinite(grams) or grams <= 0:
            raise ValueError("Grams must be positive and finite")

        food = foods_by_id[food_id]
        portion = calculate_portion(food["nutrition"], grams)

        ingredients.append({
            "selected_food": {
                "id": food["id"],
                "description": food["description"],
                "dataType": food["dataType"],
            },
            "nutrition": food["nutrition"],
            "portion": portion,
        })

        for nutrient in totals:
            value = portion[nutrient]

            if value is None:
                raise ValueError(f"Missing nutrient: {nutrient}")

            totals[nutrient] += value

    return {
        "meal_name": proposal["meal_name"],
        "ingredients": ingredients,
        "totals": totals,
    }


def build_candidate_day(request_text, candidates):
    meals = []

    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for meal_type in ("breakfast", "lunch", "dinner"):
        print(f"Planning {meal_type}...")

        previous_meals = [
            {
                "meal_type": meal["meal_type"],
                "meal_name": meal["meal_name"],
            }
            for meal in meals
        ]

        meal_request = json.dumps({
            "day_request": request_text,
            "meal_to_create": meal_type,
            "previous_meals": previous_meals,
            "instruction": (
                "Create only this meal for one person as part of the day. "
                "Choose foods appropriate for this meal and vary meals "
                "where the available ingredients allow."
            ),
        })

        proposal = propose_meal_from_candidates(
            meal_request,
            candidates,
        )

        meal = calculate_candidate_meal(proposal, candidates)
        meal["meal_type"] = meal_type
        meals.append(meal)

        for nutrient in totals:
            totals[nutrient] += meal["totals"][nutrient]

    return {
        "plan_name": "Daily Meal Plan",
        "meals": meals,
        "totals": totals,
    }

def choose_food_queries(request_text):
    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=(
            "Choose 6 to 10 USDA food search queries to support "
            "breakfast, lunch and dinner for the supplied request. "
            "Include suitable protein, carbohydrate, fat, fruit "
            "and vegetable sources. "
            "Respect stated food preferences and exclusions. "
            "Use specific, common grocery foods rather than dishes "
            "or unspecified mixtures. "
            "Include raw, dry or cooked state where relevant. "
            "Use concise search terms and avoid duplicate queries."
        ),
        input=request_text,
        text={
            "format": {
                "type": "json_schema",
                "name": "food_queries",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "queries": {
                            "type": "array",
                            "minItems": 6,
                            "maxItems": 10,
                            "items": {
                                "type": "string",
                                "minLength": 2,
                                "maxLength": 200,
                            },
                        },
                    },
                    "required": ["queries"],
                    "additionalProperties": False,
                },
            },
        },
    )

    if response.status != "completed" or not response.output_text:
        raise RuntimeError("AI did not return complete food queries")

    return json.loads(response.output_text)["queries"]

def generate_candidate_day(request_text):
    api_key = os.getenv("USDA_API_KEY")

    if not api_key:
        raise ValueError("USDA_API_KEY is missing")

    queries = choose_food_queries(request_text)
    candidates = collect_food_candidates(queries, api_key)

    if not candidates:
        raise ValueError("No usable USDA foods were found")

    return build_candidate_day(request_text, candidates)

if __name__ == "__main__":
    load_dotenv()

    api_key = os.getenv("USDA_API_KEY")

    if not api_key:
        raise ValueError("USDA_API_KEY is missing")

    candidates = collect_food_candidates(
        [
            "rolled oats dry",
            "bananas raw",
            "milk nonfat",
            "chicken breast raw",
            "brown rice raw",
            "broccoli raw",
            "tomatoes raw",
            "olive oil",
        ],
        api_key,
    )

    day = build_candidate_day(
        "Create a simple day of meals for one person. "
        "Use oats and banana at breakfast, and include chicken "
        "and rice in one of the main meals.",
        candidates,
    )

    print(json.dumps(day, indent=2))