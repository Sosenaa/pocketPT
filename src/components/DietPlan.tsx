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

  return (
    <div className="min-h-screen bg-[#080808] sm:px-4 sm:py-10 text-white">
      <h1>Diet plan</h1>

      {diet ? (
        <>
          <h1>{diet.diet_name}</h1>
          {diet.diet_days.map((day, index) => (
            <div key={index}>
              <div className="flex justify-center">
                <h1>{day.diet_day}</h1>
              </div>
              {day.meal.map((meal, mealIndex) => (
                <div key={mealIndex} className="my-4">
                  <h3 className="text-left ">{meal.meal_name}</h3>
                  {meal.ingredients.map((ing, ingIndex) => (
                    <div key={ingIndex} className="grid grid-cols-2 border-b-2">
                      <h6>{ing.name}</h6>
                      <h6>{ing.amount}</h6>
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
  );
};

export default DietPlan;
