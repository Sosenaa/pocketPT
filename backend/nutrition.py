

def calculate_portion(nutrition, grams):
    multiplier = grams / nutrition["basic_grams"]

    result = {"portion_grams": grams}

    for nutrient in (
        "protein_g",
        "fat_g",
        "carbohydrates_g",
        "energy_kcal",
    ):
        value = nutrition.get(nutrient)

        if value is None:
            result[nutrient] = None
        else:
            result[nutrient] = value * multiplier
    return result


def extract_nutrition(food):
    nutrients_by_id = {
        entry["nutrient"]["id"]: entry.get("amount")
        for entry in food.get("foodNutrients", [])
    }

    energy_id = None

    for nutrient_id in (2048, 2047, 1008):
        if nutrients_by_id.get(nutrient_id) is not None:
            energy_id = nutrient_id
            break

    return {
        "basic_grams": 100,
        "protein_g": nutrients_by_id.get(1003),
        "fat_g": nutrients_by_id.get(1004),
        "carbohydrates_g": nutrients_by_id.get(1005),
        "energy_kcal": nutrients_by_id.get(energy_id),
        "energy_nutrient_id": energy_id,
    }