import json
import os
from dotenv import load_dotenv
from usda import search_usda_foods, get_usda_food
from nutrition import extract_nutrition


def get_food_candidates(query, api_key, page=1, limit=5):
    results = search_usda_foods(
        query=query,
        api_key=api_key,
        page=page,
        ingredients_only=True,
    )

    candidates = []

    required_nutrients = (
        "protein_g",
        "fat_g",
        "carbohydrates_g",
        "energy_kcal",
    )

    for match in results.get("foods", []):
        details = get_usda_food(match["fdcId"], api_key)
        nutrition = extract_nutrition(details)

        if any(nutrition[key] is None for key in required_nutrients):
            continue

        candidates.append({
            "id": details["fdcId"],
            "description": details["description"],
            "dataType": details["dataType"],
            "nutrition": nutrition,
        })

        if len(candidates) >= limit:
            break

    return candidates

def collect_food_candidates(queries, api_key):
    foods_by_id = {}

    for query in queries:
        print(f"Retrieving candidates: {query}")

        candidates = get_food_candidates(query, api_key)

        for food in candidates:
            foods_by_id[food["id"]] = food

    return list(foods_by_id.values())


if __name__ == "__main__":
    load_dotenv()

    api_key = os.getenv("USDA_API_KEY")

    if not api_key:
        raise ValueError("USDA_API_KEY is missing")

    candidates = collect_food_candidates(
        [
            "chicken breast raw",
            "brown rice raw",
            "broccoli raw",
            "tomatoes raw",
        ],
        api_key,
    )

    print(f"Found {len(candidates)} unique food candidates")

    for food in candidates:
        print(food["id"], food["description"])

    