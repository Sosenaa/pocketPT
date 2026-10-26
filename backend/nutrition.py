

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