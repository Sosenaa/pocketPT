import { Link } from "react-router-dom";
import { useWeeklyDiet } from "../hooks/useWeeklyDiet";
import NutritionSummary from "./NutritionSummary";

export default function TodayDiet() {
  const { diet, loading, error } = useWeeklyDiet();
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date());
  const day = diet?.days.find((entry) => entry.day_name === weekday);
  return (
    <section className="mx-auto my-6 max-w-4xl rounded-sm border border-[#2a2a2e] bg-[#111] p-5 text-slate-100">
      <h2 className="text-xl text-[#c8ff00]">Today's Diet · {weekday}</h2>
      {loading ? <p role="status">Loading meals…</p> : error ? <p role="alert">{error}</p> : !day ? <p>No weekly meal plan yet.</p> : <>
        <NutritionSummary totals={day.totals} />
        <ul className="my-4 list-none p-0">
          {day.meals.map((meal) => <li key={meal.meal_type} className="border-b border-[#2a2a2e] py-3">
            <span className="mr-3 capitalize text-[#c8ff00]">{meal.meal_type}</span>{meal.meal_name}
          </li>)}
        </ul>
      </>}
      <Link to="/DietPlan" className="!text-[#c8ff00]">{day ? "View weekly meal plan" : "Create a weekly meal plan"}</Link>
    </section>
  );
}
