import { Fragment, useEffect, useState } from "react";
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

const TodayDiet = () => {
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

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayIndex = new Date();
  const day = weekday[dayIndex.getDay()];

  const todayDiet = diet?.diet_days.find((d) => d.diet_day === day);
  console.log(todayDiet);

  console.log(day);

  return (
    <div className="bg-[#080808] sm:px-4 sm:py-10 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-2 shadow-xl pt-2">
          <div className="flex border-b-2 border-[#2a2a2a] bg-[#111] px-4 py-1 items-center justify-between">
            <div>
              <div className="text-[#c8ff00]">
                <h2 className="text-xl font-semibold text-left">
                  Today's Diet
                </h2>
              </div>
              <p className="text-sm text-slate-200">{todayDiet?.diet_day}</p>
            </div>

            <div className="w-fit text-right rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]"></div>
          </div>

          <table className="min-w-full">
            <thead className="bg-[#161616]">
              <tr>
                <th className="pl-5 py-4 text-left text-sm font-semibold text-slate-100">
                  Meal name
                </th>
                <th className="pl-5 py-4 text-left text-sm font-semibold text-slate-100">
                  Ingredients
                </th>
                <th className="px-2 py-4 text-center text-sm font-semibold text-slate-100">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] bg-[#0E0E0E]">
              {todayDiet?.meal.map((meal, index) => (
                <Fragment key={index}>
                  {meal.ingredients.map((ing, ingIndex) => (
                    <tr key={ingIndex} className="">
                      <td className="pl-5 py-3 text-sm font-medium text-slate-100">
                        {ingIndex === 0 ? meal.meal_name : ""}
                      </td>
                      <td className="pl-5 py-3 text-sm font-medium text-slate-100">
                        {ing.name}
                      </td>

                      <td className="pl-5 py-3 text-sm font-medium text-slate-100 text-left">
                        {ing.amount}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TodayDiet;
