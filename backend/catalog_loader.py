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

    ingredients = []

    for ingredient in meal["ingredients"]:
        food = foods_by_key[ingredient["food_key"]]
        nutrition = food.get("nutrition")

        if(food.get ("nutrition_review_status") != "reference_checked" or nutrition is None):
            raise ValueError(f"Nutrition needs review: {food["name"]}")

        portion = calculate_portion(nutrition, ingredient["base_grams"])

        ingredients.append({
            "food_key":food["food_key"],
            "name": food["name"],
            "measurement_state": food["measurement_state"],
            "nutrition": nutrition,
            "portion": portion
        })

        for nutrients in totals:
            if portion[nutrients] is None:
                raise ValueError(f"Missing {nutrients}: {food["name"]}")

            totals[nutrients] += portion[nutrients]

    return {
        "catalogue_id": meal["catalogue_id"],
        "meal_name": meal["name"],
        "status": meal["status"],
        "ingredients": ingredients,
        "category": meal["category"],
        "totals": totals
    }

def build_catalogue_day(breakfast_id, lunch_id, dinner_id):
    meals = []
    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    selections = {
        "breakfast": breakfast_id,
        "lunch": lunch_id,
        "dinner": dinner_id,
    }

    for meal_type, catalogue_id in selections.items():
        meal = calculate_catalogue_meal(catalogue_id)

        if meal["category"] != meal_type:
            raise ValueError(f"{catalogue_id} is not a {meal_type} meal")

        meal["meal_type"] = meal_type
        meals.append(meal)

        for nutrient in totals:
            totals[nutrient] += meal["totals"][nutrient]

    return {
        "status": "draft",
        "meals": meals,
        "totals": totals,
    }

def build_catalogue_week(selections):
    weekdays = (
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
    )

    if set(selections) != set(weekdays):
        raise ValueError("Provide meal selections for all seven days")

    days = []
    totals = {
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrates_g": 0,
        "energy_kcal": 0,
    }

    for weekday in weekdays:
        day = build_catalogue_day(**selections[weekday])
        day["day_name"] = weekday
        days.append(day)

        for nutrient in totals:
            totals[nutrient] += day["totals"][nutrient]

    return {
        "status": "draft",
        "days": days,
        "totals": totals,
    }

def build_shopping_list(week):
    combined = {}

    for day in week["days"]:
        for meal in day["meals"]:
            for ingredient in meal["ingredients"]:
                food_key = ingredient["food_key"]

                if food_key not in combined:
                    combined[food_key] = {
                        "food_key": food_key,
                        "name": ingredient["name"],
                        "measurement_state": ingredient["measurement_state"],
                        "grams": 0,
                    }

                combined[food_key]["grams"] += (
                    ingredient["portion"]["portion_grams"]
                )

    return sorted(
        combined.values(),
        key=lambda ingredient: ingredient["name"].lower(),
    )

if __name__ == "__main__":
    weekdays = (
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
    )

    selections = {
        weekday: {
            "breakfast_id": "breakfast-021",
            "lunch_id": "lunch-001",
            "dinner_id": "dinner-021",
        }
        for weekday in weekdays
    }

    week = build_catalogue_week(selections)

    # Print a compact summary.
    for day in week["days"]:
        print(f"{day['day_name']}: {day['totals']['energy_kcal']:.1f} kcal")

    print("\nWeekly totals:")
    print(json.dumps(week["totals"], indent=2))

    shopping_list = build_shopping_list(week)

    print("\nWeekly shopping list:")

    for ingredient in shopping_list:
        print(
            f"{ingredient['name']}: "
            f"{ingredient['grams']:.0f}g "
            f"({ingredient['measurement_state']})"
        )