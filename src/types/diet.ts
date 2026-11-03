export type Nutrition = {
  protein_g: number;
  fat_g: number;
  carbohydrates_g: number;
  energy_kcal: number;
};

export type DietIngredient = {
  food_key: string;
  name: string;
  measurement_state: string;
  portion: Nutrition & { portion_grams: number };
};

export type DietMeal = {
  catalogue_id: string;
  meal_name: string;
  meal_type: string;
  ingredients: DietIngredient[];
  totals: Nutrition;
};

export type DietDay = {
  day_name: string;
  meals: DietMeal[];
  totals: Nutrition;
  within_target_tolerance: boolean;
};

export type WeeklyDiet = {
  plan_name: string;
  status: string;
  notice: string;
  targets: Nutrition;
  target_calculation?: { mode: "automatic" | "manual" };
  days: DietDay[];
  totals: Nutrition;
  shopping_list: {
    food_key: string;
    name: string;
    measurement_state: string;
    grams: number;
  }[];
};

export type AutomaticNutritionTargets = {
  mode: "automatic";
  method: string;
  targets: Nutrition;
  maintenance_kcal: number;
  goal_adjustment_percent: number;
  profile: { age: number; weight: number; height: number; goal: string; activity: string; sex: string };
  notice: string;
};
