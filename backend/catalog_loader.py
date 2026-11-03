import json
from pathlib import Path
from nutrition import calculate_portion

CATALOGUE_DIR = Path(__file__).resolve().parent / "catalogue"


def load_catalogue():
    with (CATALOGUE_DIR / "foods.json").open(encoding="utf-8") as file:
        foods = json.load(file)["foods"]

    with (CATALOGUE_DIR / "meals.json").open(encoding="utf-8") as file:
        meals = json.load(file)["meals"]

    return foods, meals


def calculate_catalogue_meal(catalogue_id):
    foods, meals = load_catalogue()
    foods_by_key = {food["food_key"]: food for food in foods}

    meal = next(
        (meal for meal in meals if meal["catalogue_id"] == catalogue_id),
        None,            
    )

    if meal is None:
        raise ValueError(f"Meal not found: {catalogue_id}")

    totals = {
        "protein_g": 0, 
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for ingredient in meal["ingredients"]:
        food = foods_by_key[ingredient["food_key"]]
        nutrition = food.get("nutrition")

        if(food.get ("nutrition_review_status") != "reference_checked" or nutrition is None):
            raise ValueError(f"Nutrition needs review: {food["name"]}")

        portion = calculate_portion(nutrition, ingredient["base_grams"])

        for nutrients in totals:
            if portion[nutrients] is None:
                raise ValueError(f"Missing {nutrients}: {food["name"]}")

            totals[nutrients] += portion[nutrients]

    return {
        "catalogue_id": meal["catalogue_id"],
        "meal_name": meal["name"],
        "status": meal["status"],
        "totals": totals
    }

if __name__ == "__main__":

    meal = calculate_catalogue_meal("lunch-001")
    print(json.dumps(meal, indent=2))