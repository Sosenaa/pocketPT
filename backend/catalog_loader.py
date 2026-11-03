import json
from pathlib import Path
from nutrition import calculate_portion
import math
from itertools import product
CATALOGUE_DIR = Path(__file__).resolve().parent / "catalogue"


def load_catalogue():
    with (CATALOGUE_DIR / "foods.json").open(encoding="utf-8") as file:
        foods = json.load(file)["foods"]

    with (CATALOGUE_DIR / "meals.json").open(encoding="utf-8") as file:
        meals = json.load(file)["meals"]

    return foods, meals

def validate_portion(ingredient, grams):
    minimum = ingredient.get("min_grams")
    maximum = ingredient.get("max_grams")
    step = ingredient.get("step_grams")

    values = (grams, minimum, maximum, step)

    if any(
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or value <= 0
        for value in values
    ):
        raise ValueError("Quantity and portion limits must be positive numbers")

    if maximum < minimum:
        raise ValueError("Maximum grams cannot be below minimum grams")

    if not minimum <= grams <= maximum:
        raise ValueError(
            f"{ingredient['food_key']} must be between "
            f"{minimum}g and {maximum}g"
        )

    steps = (grams - minimum) / step

    if not math.isclose(steps, round(steps), rel_tol=0, abs_tol=1e-8):
        raise ValueError(
            f"{ingredient['food_key']} must change in "
            f"{step}g steps starting from {minimum}g"
        )

    return grams

def calculate_catalogue_meal(catalogue_id, portion_overrides=None):
    foods, meals = load_catalogue()
    foods_by_key = {food["food_key"]: food for food in foods}

    meal = next(
        (meal for meal in meals if meal["catalogue_id"] == catalogue_id),
        None,            
    )

    if meal is None:
        raise ValueError(f"Meal not found: {catalogue_id}")

    if portion_overrides is None:
        portion_overrides = {}

    ingredient_keys = {
        ingredient["food_key"] for ingredient in meal["ingredients"]
    }

    unknown_keys = set(portion_overrides) - ingredient_keys

    if unknown_keys:
        raise ValueError(f"Ingredients not in this meal: {sorted(unknown_keys)}")
    

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

        food_key = ingredient["food_key"]
        grams = ingredient["base_grams"]

        if food_key in portion_overrides:
            grams = validate_portion(
                ingredient,
                portion_overrides[food_key],
            )

        portion = calculate_portion(nutrition, grams)

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

def build_catalogue_day(breakfast_id, lunch_id, dinner_id, portion_overrides=None,):
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

    if portion_overrides is None:
        portion_overrides = {}

    unknown_meal_types = set(portion_overrides) - set(selections)

    if unknown_meal_types:
        raise ValueError(
            f"Unknown meal types: {sorted(unknown_meal_types)}"
        )

    for meal_type, catalogue_id in selections.items():
        meal = calculate_catalogue_meal(
            catalogue_id,
            portion_overrides=portion_overrides.get(meal_type),
        )

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

def compare_day_to_targets(day, targets):
    comparison = {}

    for nutrient, planned in day["totals"].items():
        target = targets[nutrient]

        comparison[nutrient] = {
            "target": target,
            "planned": planned,
            "difference": planned - target,
        }

    return comparison

def score_day(day, targets):
    score = 0

    for nutrient, planned in day["totals"].items():
        target = targets[nutrient]

        if (
            isinstance(target, bool)
            or not isinstance(target, (int, float))
            or not math.isfinite(target)
            or target <= 0
        ):
            raise ValueError(f"Target must be positive: {nutrient}")

        relative_difference = (planned - target) / target
        score += relative_difference ** 2

    return score

def get_portion_options(ingredient):
    minimum = validate_portion(
        ingredient,
        ingredient.get("min_grams"),
    )

    maximum = ingredient["max_grams"]
    step = ingredient["step_grams"]

    number_of_steps = math.floor((maximum - minimum) / step)

    return [
        minimum + index * step
        for index in range(number_of_steps + 1)
    ]


def optimise_lunch_portions(breakfast_id, lunch_id, dinner_id, targets):
    base_day = build_catalogue_day(breakfast_id, lunch_id, dinner_id)

    # Validate targets before searching.
    score_day(base_day, targets)

    _, templates = load_catalogue()
    template = next(
        meal for meal in templates
        if meal["catalogue_id"] == lunch_id
    )

    lunch = next(
        meal for meal in base_day["meals"]
        if meal["meal_type"] == "lunch"
    )

    foods = {
        ingredient["food_key"]: ingredient
        for ingredient in lunch["ingredients"]
    }

    # Breakfast and dinner stay unchanged.
    fixed_totals = {
        nutrient: sum(
            meal["totals"][nutrient]
            for meal in base_day["meals"]
            if meal["meal_type"] != "lunch"
        )
        for nutrient in base_day["totals"]
    }

    keys = []
    options = []

    for ingredient in template["ingredients"]:
        key = ingredient["food_key"]
        keys.append(key)

        options.append([
            (grams, calculate_portion(foods[key]["nutrition"], grams))
            for grams in get_portion_options(ingredient)
        ])

    if math.prod(len(choices) for choices in options) > 100_000:
        raise ValueError("Too many combinations for this prototype search")

    best_score = math.inf
    best_overrides = None

    for combination in product(*options):
        totals = {
            nutrient: fixed_totals[nutrient] + sum(
                portion[nutrient] for _, portion in combination
            )
            for nutrient in fixed_totals
        }

        score = score_day({"totals": totals}, targets)

        if score < best_score:
            best_score = score
            best_overrides = dict(zip(
                keys,
                (grams for grams, _ in combination),
            ))

    return best_overrides

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
            "portion_overrides": {
                "lunch": {
                    "chicken": 200,
                },
            },
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

        # Example values for testing, not personal recommendations.
    targets = {
        "protein_g": 130,
        "fat_g": 70,
        "carbohydrates_g": 210,
        "energy_kcal": 2000,
    }

    comparison = compare_day_to_targets(week["days"][0], targets)

    print("\nMonday compared with test targets:")
    print(json.dumps(comparison, indent=2))    


    _, meals = load_catalogue()

    lunch = next(
        meal for meal in meals
        if meal["catalogue_id"] == "lunch-001"
    )

    chicken = next(
        ingredient for ingredient in lunch["ingredients"]
        if ingredient["food_key"] == "chicken"
    )

    print("\nValid chicken quantity:", validate_portion(chicken, 200))

    try:
        validate_portion(chicken, 205)
    except ValueError as error:
        print("Rejected correctly:", error)

    adjusted_meal = calculate_catalogue_meal(
        "lunch-001",
        portion_overrides={"chicken": 200},
    )

    print("\nLunch with 200g chicken:")
    print(json.dumps(adjusted_meal["totals"], indent=2))


    base_day = build_catalogue_day(
        "breakfast-021",
        "lunch-001",
        "dinner-021",
    )

    adjusted_day = build_catalogue_day(
        "breakfast-021",
        "lunch-001",
        "dinner-021",
        portion_overrides={
            "lunch": {"chicken": 200},
        },
    )

    print("\nBase day score:", round(score_day(base_day, targets), 4))
    print("Adjusted day score:", round(score_day(adjusted_day, targets), 4))

    print("\nAvailable lunch portions:")

    for ingredient in lunch["ingredients"]:
        options = get_portion_options(ingredient)

        print(
            f"{ingredient['food_key']}: "
            f"{len(options)} options, "
            f"{options[0]}g to {options[-1]}g"
        )

        best_portions = optimise_lunch_portions(
        "breakfast-021",
        "lunch-001",
        "dinner-021",
        targets,
    )

    optimised_day = build_catalogue_day(
        "breakfast-021",
        "lunch-001",
        "dinner-021",
        portion_overrides={"lunch": best_portions},
    )

    print("\nBest lunch portions:")
    print(json.dumps(best_portions, indent=2))

    print("\nOptimised daily totals:")
    print(json.dumps(optimised_day["totals"], indent=2))

    print("Score:", round(score_day(optimised_day, targets), 4))