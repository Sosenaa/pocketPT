import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";

type Meal = {
  meal_name: string;
  ingrediants: string;
};

type Meals = {
  day_name: string;
  macros: string;
  total_meals: string;
  meal: Meal[];
};

type Diet = {
  diet_name: string;
  meals: Meals[];
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
    <div className="text-black">
      <h1>Diet plan</h1>
      <p>{diet?.diet_name}</p>
    </div>
  );
};

export default DietPlan;
