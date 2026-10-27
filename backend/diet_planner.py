from usda import search_usda_foods, get_usda_food
from nutrition import extract_nutrition, calculate_portion
import json
import os
from dotenv import load_dotenv
from openai import OpenAI



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

def run_search_demo():
    api_key = os.getenv("USDA_API_KEY")

    if not api_key:
        raise ValueError("USDA_API_KEY is missing")

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        input=(
            "Find raw, boneless, skinless chicken breast in USDA. "
            "Search page 1 using the ingredient filter."
        ),
        tools=[SEARCH_FOODS_TOOL],
        tool_choice={"type": "function", "name": "search_foods"},
        parallel_tool_calls=False,
    )

    for item in response.output:
        if item.type == "function_call":
            arguments = json.loads(item.arguments)

            print("AI requested:", item.name)
            print("Arguments:", arguments)

            result = execute_tool(item.name, arguments, api_key)

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
                            "Choose one returned record for raw, boneless, "
                            "skinless chicken breast without added solution. "
                            "Prefer Foundation when it matches. "
                            "Return food_id and a brief reason. "
                            "Use null for food_id if none match."
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
            portion = calculate_portion(nutrition, 200)

            return {
                "selected_food": selected_food,
                "reason": selection["reason"],
                "nutrition": nutrition,
                "portion": portion,
            }

    raise RuntimeError("The AI did not request a search")


if __name__ == "__main__":
    load_dotenv()
    result = run_search_demo()
    print(json.dumps(result, indent=2))