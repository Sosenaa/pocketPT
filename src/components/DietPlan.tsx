import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

type Nutrition = {
  protein_g: number | null;
  fat_g: number | null;
  carbohydrates_g: number | null;
  energy_kcal: number | null;
};

type Ingredient = {
  selected_food: {
    id: number;
    description: string;
  };
  portion: {
    portion_grams: number;
  };
};

type Meal = {
  meal_name: string;
  meal_type: string;
  ingredients: Ingredient[];
  totals: Nutrition;
};

type DailyPlan = {
  plan_name: string;
  meals: Meal[];
  totals: Nutrition;
};

function formatValue(value: number | null) {
  return value === null ? "—" : value.toFixed(1);
}

function NutritionSummary({ totals }: { totals: Nutrition }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
      <span>Energy: {formatValue(totals.energy_kcal)} kcal</span>
      <span>Protein: {formatValue(totals.protein_g)} g</span>
      <span>Carbs: {formatValue(totals.carbohydrates_g)} g</span>
      <span>Fat: {formatValue(totals.fat_g)} g</span>
    </div>
  );
}

const DietPlan = () => {
  const navigate = useNavigate();
  const [diet, setDiet] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchDiet = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dailyDietPlan`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          navigate("/Login");
          return;
        }

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load your daily meal plan");
        }

        const data: { plan: DailyPlan } = await response.json();

        if (!controller.signal.aborted) {
          setDiet(data.plan);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Could not load your plan",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchDiet();

    return () => controller.abort();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        {loading ? (
          <p role="status">Loading your meal plan…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : !diet ? (
          <div>
            <h1 className="text-3xl text-[#c8ff00]">Daily Meal Plan</h1>
            <p>You haven’t created a daily meal plan yet.</p>
            <Link to="/UserForm" className="!text-[#c8ff00]">
              Create a plan
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-6 text-3xl font-bold text-[#c8ff00]">
              {diet.plan_name}
            </h1>

            <section className="mb-6 rounded-sm border border-[#2a2a2e] bg-[#111] p-5">
              <h2 className="text-xl">Daily totals</h2>
              <NutritionSummary totals={diet.totals} />
            </section>

            {diet.meals.map((meal) => (
              <section
                key={meal.meal_type}
                className="mb-4 rounded-sm border border-[#2a2a2e] bg-[#111] p-5"
              >
                <p className="mb-1 text-sm uppercase text-[#c8ff00]">
                  {meal.meal_type}
                </p>

                <h2 className="text-xl">{meal.meal_name}</h2>
                <NutritionSummary totals={meal.totals} />

                <details className="mt-4">
                  <summary className="cursor-pointer text-[#c8ff00]">
                    Ingredients and quantities
                  </summary>

                  <ul className="m-0 mt-3 list-none divide-y divide-[#2a2a2e] p-0">
                    {meal.ingredients.map((ingredient, index) => (
                      <li
                        key={`${ingredient.selected_food.id}-${index}`}
                        className="flex justify-between gap-4 py-3"
                      >
                        <span>{ingredient.selected_food.description}</span>
                        <span className="shrink-0">
                          {ingredient.portion.portion_grams} g
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  );
};

export default DietPlan;