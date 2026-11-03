import { Link } from "react-router-dom";
import { useWeeklyDiet } from "../hooks/useWeeklyDiet";

export default function ShoppingListPage() {
  const { diet, loading, error } = useWeeklyDiet();
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl text-[#c8ff00]">Weekly Shopping List</h1>
        <Link to="/DietPlan" className="!text-[#c8ff00]">Back to meal plan</Link>
        {loading ? <p role="status">Loading shopping list…</p> : error ? <p role="alert">{error}</p> : !diet ? <p className="mt-4">Create a weekly meal plan first.</p> : <>
          <p className="mt-4 text-slate-300">Required ingredient weights for all seven days. Pack sizes and prices are not included yet.</p>
          <p className="text-sm text-slate-400">Egg weights exclude shells; fruit and other ingredients use the edible portion. Liquids are weighed in grams.</p>
          <ul className="mt-4 list-none divide-y divide-[#2a2a2e] rounded-sm border border-[#2a2a2e] bg-[#111] px-5">
            {diet.shopping_list.map((item) => <li key={item.food_key} className="flex justify-between gap-4 py-4">
              <span>{item.name}<small className="ml-2 text-slate-400">({item.measurement_state.replaceAll("_", " ")})</small></span>
              <span className="shrink-0">{item.grams.toFixed(0)} g</span>
            </li>)}
          </ul>
        </>}
      </div>
    </main>
  );
}
