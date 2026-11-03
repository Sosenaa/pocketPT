"""Versioned starting estimates for general adult fitness planning.

Equation: Mifflin et al. 1990, https://doi.org/10.1093/ajcn/51.2.241
Protein context: https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/
Activity factors, goal percentages and macro allocation are application policy,
not values prescribed by the Mifflin paper. See catalogue/TARGETS.md.
"""
import math

ACTIVITY_FACTORS = {"low_activity": 1.2, "medium_activity": 1.55, "high_activity": 1.725}
GOAL_FACTORS = {
    "lose_weight": 0.85, "maintain_weight": 1.0, "gain_muscle": 1.10,
    "increase_strength": 1.0, "improve_endurance": 1.0,
}


def calculate_nutrition_targets(profile):
    if not isinstance(profile, dict):
        raise ValueError("Complete your body details in the personal details form first.")

    def number(key, minimum, maximum):
        raw = profile.get(key)
        if isinstance(raw, bool):
            raise ValueError(f"Check your {key} in personal details.")
        try:
            value = float(raw)
        except (TypeError, ValueError):
            raise ValueError(f"Enter your {key} in personal details.") from None
        if not math.isfinite(value) or not minimum <= value <= maximum:
            raise ValueError(f"Check your {key}: supported range is {minimum}–{maximum}.")
        return value

    age = number("age", 18, 120)
    weight = number("weight", 20, 400)  # kg
    height = number("height", 100, 250)  # cm
    sex = profile.get("gender")  # Existing form field; used as equation input.
    activity = profile.get("activity")
    goal = profile.get("goal")
    if sex not in ("male", "female"):
        raise ValueError("Select the sex input for the calorie equation in personal details.")
    if not isinstance(activity, str) or activity not in ACTIVITY_FACTORS:
        raise ValueError("Select your activity level in personal details.")
    if not isinstance(goal, str) or goal not in GOAL_FACTORS:
        raise ValueError("Select your goal in personal details.")

    resting = 10 * weight + 6.25 * height - 5 * age + (5 if sex == "male" else -161)
    maintenance = resting * ACTIVITY_FACTORS[activity]
    calories = round(maintenance * GOAL_FACTORS[goal])
    floor = 1500 if sex == "male" else 1200
    if resting <= 0 or calories < floor:
        raise ValueError("This profile produces a calorie target below the automatic planner's supported range. Check your body details or use professionally set manual targets.")
    if goal == "lose_weight" and weight / (height / 100) ** 2 < 18.5:
        raise ValueError("Automatic weight-loss targets are not supported at this height and weight. Review your goal with a qualified professional.")

    # Fitness starting point; cap protein allocation to leave room for other macros.
    protein = round(min(weight * 1.6, calories * 0.35 / 4), 1)
    fat = round(calories * 0.30 / 9, 1)
    carbs = round((calories - protein * 4 - fat * 9) / 4, 1)
    return {
        "mode": "automatic",
        "method": "Mifflin–St Jeor",
        "policy_version": "adult-fitness-v1",
        "resting_kcal": round(resting, 1),
        "maintenance_kcal": round(maintenance, 1),
        "activity_factor": ACTIVITY_FACTORS[activity],
        "goal_adjustment_percent": round((GOAL_FACTORS[goal] - 1) * 100),
        "profile": {"age": age, "weight": weight, "height": height,
                    "sex": sex, "activity": activity, "goal": goal},
        "targets": {"energy_kcal": calories, "protein_g": protein,
                    "fat_g": fat, "carbohydrates_g": carbs},
        "notice": "Starting estimates for adults, not medical prescriptions. Not intended for pregnancy or breastfeeding. Review targets as your weight and activity change.",
    }
