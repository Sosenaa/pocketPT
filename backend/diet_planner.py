from usda import search_usda_foods, get_usda_food
from nutrition import extract_nutrition, calculate_portion
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import math




SEARCH_FOODS_TOOL = {
    "type": "function",
    "name": "search_foods",
    "description": (
        "Search USDA FoodData Central for foods. "
        "Use precise descriptions, including raw or cooked state. "
        "Returns matching food IDs and descriptions."
    ),
    "strict": True,
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Food to search for, e.g. chicken breast raw",
            },
            "page": {
                "type": "integer",
                "minimum": 1,
                "description": "Results page, starting at 1",
            },
            "ingredients_only": {
                "type": "boolean",
                "description": (
                    "Use true for Foundation and SR Legacy foods only. "
                    "Use false to search all food types."
                ),
            },
        },
        "required": ["query", "page", "ingredients_only"],
        "additionalProperties": False,
    },
}

MEAL_PROPOSAL_SCHEMA = {
    "type": "object",
    "properties": {
        "meal_name": {"type": "string"},
        "ingredients": {
            "type": "array",
            "minItems": 1,
            "maxItems": 6,
            "items": {
                "type": "object",
                "properties": {
                    "food_request": {"type": "string"},
                    "grams": {
                        "type": "number",
                        "exclusiveMinimum": 0,
                    },
                },
                "required": ["food_request", "grams"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["meal_name", "ingredients"],
    "additionalProperties": False,
}

DAY_PROPOSAL_SCHEMA = {
    "type": "object",
    "properties": {
        "plan_name": {"type": "string"},
        "breakfast": MEAL_PROPOSAL_SCHEMA,
        "lunch": MEAL_PROPOSAL_SCHEMA,
        "dinner": MEAL_PROPOSAL_SCHEMA,
    },
    "required": ["plan_name", "breakfast", "lunch", "dinner"],
    "additionalProperties": False,
}

def execute_tool(name, arguments, api_key):
    if name != "search_foods":
        raise ValueError(f"Unknown tool: {name}")

    query = arguments["query"]
    page = arguments["page"]
    ingredients_only = arguments["ingredients_only"]

    if not isinstance(query, str) or not 2 <= len(query.strip()) <= 200:
        raise ValueError("Search query must contain 2–200 characters")

    if type(page) is not int or page < 1:
        raise ValueError("Page must be a positive integer")

    if not isinstance(ingredients_only, bool):
        raise ValueError("ingredients_only must be true or false")

    data = search_usda_foods(
        query=query.strip(),
        api_key=api_key,
        page=page,
        ingredients_only=ingredients_only,
    )

    return {
        "foods": [
            {
                "id": food["fdcId"],
                "description": food["description"],
                "dataType": food["dataType"],
                "brand": food.get("brandOwner"),
            }
            for food in data.get("foods", [])
        ],
        "page": page,
        "total_pages": data.get("totalPages", 0),
        "total_results": data.get("totalHits", 0),
    }

def select_food_page(food_request, grams,page, exclude_ids):
    if not isinstance(food_request, str) or not food_request.strip():
        raise ValueError("A food description is required")

    if isinstance(grams, bool) or not isinstance(grams, (int, float)):
        raise ValueError("Grams must be a number")

    if not math.isfinite(grams) or grams <= 0:
        raise ValueError("Grams must be positive, finite number")

    food_request = food_request.strip()

    api_key = os.getenv("USDA_API_KEY")

    if not api_key:
        raise ValueError("USDA_API_KEY is missing")

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        input=(
            f"Find this food in USDA: {food_request}. "
            "Search using the basic food identity and nutrition-relevant state. "
            "Omit kitchen preparation details such as chopped or diced. "
            "Preserve raw versus cooked, dry versus hydrated, "
            "and distinctions such as whole grains versus flour. "
            f"Search page {page} using the ingredient filter."
        ),
        tools=[SEARCH_FOODS_TOOL],
        tool_choice={"type": "function", "name": "search_foods"},
        parallel_tool_calls=False,
    )

    for item in response.output:
        if item.type == "function_call":
            arguments = json.loads(item.arguments)

            print("AI requested:", item.name)
            

            arguments["page"] = page
            arguments["ingredients_only"] = True

            print("Arguments:", arguments)

            result = execute_tool(item.name, arguments, api_key)

            result["foods"] = [
                food
                for food in result["foods"]
                if food["id"] not in exclude_ids
            ]

            follow_up = client.responses.create(
                model="gpt-4o-mini",
                previous_response_id=response.id,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "food_selection",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "food_id": {
                                    "type": ["integer", "null"],
                                },
                                "reason": {
                                    "type": "string",
                                },
                            },
                            "required": ["food_id", "reason"],
                            "additionalProperties": False,
                        },
                    },
                },
                input=[
                    {
                        "type": "function_call_output",
                        "call_id": item.call_id,
                        "output": json.dumps(result),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Choose one returned record matching: {food_request}. "
                            "Match the actual food, its physical form and "
                            "its requested preparation state. "
                            "Do not substitute flour for whole grains, "
                            "a different meat cut, or cooked food for raw food. "
                            "Prefer Foundation only when the food matches; "
                            "a matching SR Legacy record is better than "
                            "a different food from Foundation. "
                            "Return food_id and a brief reason. "
                            "Use null if no suitable match exists. "
                            "Do not select an unsuitable closest alternative."
                        ),
                    },
                ],
            )

            selection = json.loads(follow_up.output_text)
            food_id = selection["food_id"]

            if food_id is None:
                return {"selection": None, "reason": selection["reason"]}

            selected_food = next(
                (
                    food
                    for food in result["foods"]
                    if food["id"] == food_id
                ),
                None,
            )

            if selected_food is None:
                raise ValueError("AI selected an ID outside the search results")

            food_details = get_usda_food(food_id, api_key)
            nutrition = extract_nutrition(food_details)
            portion = calculate_portion(nutrition, grams)

            return {
                "selected_food": selected_food,
                "reason": selection["reason"],
                "nutrition": nutrition,
                "portion": portion,
            }

    raise RuntimeError("The AI did not request a search")

def select_food(food_request, grams):
    page = 1
    excluded_ids = set()

    required_nutrients = (
        "protein_g",
        "fat_g",
        "carbohydrates_g",
        "energy_kcal",
    )

    for attempt in range(5):
        print(f"Lookup attempt {attempt + 1}, page {page}")

        selected = select_food_page(
            food_request,
            grams,
            page,
            excluded_ids,
        )

        if selected.get("selected_food") is None:
            page += 1
            continue

        missing = [
            nutrient
            for nutrient in required_nutrients
            if selected["nutrition"].get(nutrient) is None
        ]

        if missing:
            food_id = selected["selected_food"]["id"]
            excluded_ids.add(food_id)
            print(f"Skipping food {food_id}: missing {missing}")
            continue

        return selected

    return {
        "selected_food": None,
        "reason": "No suitable food with complete macros found within 5 attempts",
    }

def build_meal(meal_name, ingredients):
    resolved_ingredients = []

    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for ingredient in ingredients:
        selected = select_food(
            ingredient["food_request"],
            ingredient["grams"],
        )

        if selected.get("selected_food") is None:
            raise ValueError(
                f"No matching food found: {ingredient['food_request']}"
            )

        resolved_ingredients.append(selected)

        for nutrient in totals:
            value = selected["portion"][nutrient]

            if value is None or totals[nutrient] is None:
                totals[nutrient] = None
            else:
                totals[nutrient] += value

    return {
        "meal_name": meal_name,
        "ingredients": resolved_ingredients,
        "totals": totals,
    }

def propose_meal(request_text):
    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=(
            "Propose one practical meal as individual grocery ingredients. "
            "Return ingredient descriptions and quantities in grams. "
            "Specify raw edible weights for meat and vegetables, "
            "and dry weights for rice, pasta and oats. "
            "Include any cooking oil or sauces needed, also in grams. "
            "Do not return whole dishes as ingredients. "
            "Do not invent USDA IDs or nutrition values."
            "Each food_request must be a standalone, precise food description. "
            "Include the preparation state in the description itself. "
            "For example: 'Chicken breast, boneless, skinless, raw', "
            "'Brown rice, uncooked', and 'Broccoli, raw'. "
        ),
        input=request_text,
        text={
            "format": {
                "type": "json_schema",
                "name": "meal_proposal",
                "strict": True,
                "schema": MEAL_PROPOSAL_SCHEMA,
            },
        },
    )

    if response.status != "completed" or not response.output_text:
        raise RuntimeError("AI did not return a complete meal proposal")

    return json.loads(response.output_text)

def propose_day(request_text):
    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=(
            "Propose one day of meals for one person: "
            "breakfast, lunch and dinner. "
            "Use practical grocery ingredients and reuse ingredients "
            "where sensible to reduce shopping complexity. "
            "Each meal must contain individual ingredients, not whole "
            "prepared dishes listed as ingredients. "
            "Give all quantities in grams, including oils and sauces. "
            "Use raw edible weights for meat and vegetables, "
            "and dry weights for rice, pasta and oats. "
            "Each food_request must identify the food precisely, "
            "including its raw, cooked or dry state where relevant. "
            "Do not invent USDA IDs or nutrition values."
            "Each food_request must identify one specific grocery ingredient. "
            "Avoid unspecified mixtures such as mixed salad leaves, "
            "mixed vegetables, mixed berries or salad mix. "
            "List their individual ingredients separately with gram amounts. "
            "For example, use 'Romaine lettuce, raw' and 'Spinach, raw' "
            "instead of 'mixed salad leaves'. "
        ),
        input=request_text,
        text={
            "format": {
                "type": "json_schema",
                "name": "day_proposal",
                "strict": True,
                "schema": DAY_PROPOSAL_SCHEMA,
            },
        },
    )

    if response.status != "completed" or not response.output_text:
        raise RuntimeError("AI did not return a complete daily proposal")

    return json.loads(response.output_text)

def build_day(proposal):
    meals = []

    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for meal_type in ("breakfast", "lunch", "dinner"):
        print(f"Building {meal_type}...")

        proposed_meal = proposal[meal_type]

        meal = build_meal(
            proposed_meal["meal_name"],
            proposed_meal["ingredients"],
        )

        meal["meal_type"] = meal_type
        meals.append(meal)

        for nutrient in totals:
            value = meal["totals"][nutrient]

            if value is None or totals[nutrient] is None:
                totals[nutrient] = None
            else:
                totals[nutrient] += value

    return {
        "plan_name": proposal["plan_name"],
        "meals": meals,
        "totals": totals,
    }

if __name__ == "__main__":
    load_dotenv()

    proposal = propose_day(
        "Create a simple day of meals using everyday UK supermarket foods. "
        "Include oats at breakfast and chicken with rice for lunch. "
        "Keep meals straightforward to prepare."
    )

    day = build_day(proposal)
    print(json.dumps(day, indent=2))