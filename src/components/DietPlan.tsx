import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";

type Ingredients = {
  name: string;
  amount: string;
};

type Meals = {
  meal_name: string;
  ingredients: Ingredients[];
};

type DietDay = {
  diet_day: string;
  total_meals: string;
  meal: Meals[];
};

type Diet = {
  diet_name: string;
  diet_days: DietDay[];
};

const DietPlan = () => {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [cardIndex, setCardIndex] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getDietPlan`, {
          credentials: "include",
          method: "GET",
        });
        if (response.status === 401) {
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch diet plan");
        }
        const data = await response.json();
        console.log(data);
        setDiet(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchDiet();
  }, []);

  const showMeal = (dayIndex: number, mealIndex: number) => {
    const key = `${dayIndex}-${mealIndex}`;
    setCardIndex((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-[#080808] sm:px-4 sm:py-10 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
          <div className="mb-8 text-center text-slate-100">
            {diet ? (
              <>
                <h1 className="text-3xl font-bold">{diet.diet_name}</h1>
                {diet.diet_days.map((day, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E] my-4"
                  >
                    <div className="flex border-b-2 border-[#2a2a2a] bg-[#111] px-5 py-4 justify-between">
                      <div>
                        <div className="text-[#c8ff00]">
                          <h2 className="text-xl font-semibold text-left">
                            {day.diet_day}
                          </h2>
                        </div>
                      </div>
                    </div>
                    {day.meal.map((meal, mealIndex) => (
                      <div key={mealIndex} className="">
                        <div className="flex justify-between my-4">
                          <p className="text-lg text-left px-5 m-0 font-semibold">
                            {meal.meal_name}
                          </p>
                          <button
                            onClick={() => showMeal(index, mealIndex)}
                            className="px-5 text-right font-light"
                          >
                            {cardIndex === `${index}-${mealIndex}`
                              ? `Hide ${meal.meal_name} ▲`
                              : `Show ${meal.meal_name} ▼`}
                          </button>
                        </div>
                        {cardIndex === `${index}-${mealIndex}` &&
                          meal.ingredients.map((ing, ingIndex) => (
                            <div
                              key={ingIndex}
                              className="grid grid-cols-2 border-b border-[#2a2a2e] font-light"
                            >
                              <p className="pl-5 pt-4 text-md font-light text-slate-100">
                                {ing.name}
                              </p>
                              <p className="pl-5 pt-4 text-md font-light text-slate-100">
                                {ing.amount}
                              </p>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <h1>No diet</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
