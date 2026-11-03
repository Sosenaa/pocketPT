import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { useWeeklyDiet } from "../hooks/useWeeklyDiet";
import type { AutomaticNutritionTargets, Nutrition, WeeklyDiet } from "../types/diet";
import NutritionSummary from "./NutritionSummary";
import NutritionTargetFields from "./NutritionTargetFields";

export default function DietPlan() {
  const navigate = useNavigate();
  const { diet, setDiet, loading, error, setError } = useWeeklyDiet();
  const [targets, setTargets] = useState<Nutrition>({ energy_kcal: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });
  const [useManualTargets, setUseManualTargets] = useState(false);
  const [calculation, setCalculation] = useState<AutomaticNutritionTargets | null>(null);
  const [targetError, setTargetError] = useState("");
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const generation = useRef<AbortController | null>(null);
  useEffect(() => () => generation.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTargets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/nutritionTargets`, {
          credentials: "include", signal: controller.signal,
        });
        if (response.status === 401) { navigate("/Login"); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not calculate nutrition targets");
        if (!controller.signal.aborted) setCalculation(data);
      } catch (err) {
        if (!controller.signal.aborted) setTargetError(err instanceof Error ? err.message : "Could not calculate targets");
      } finally {
        if (!controller.signal.aborted) setTargetsLoading(false);
      }
    }
    void loadTargets();
    return () => controller.abort();
  }, [navigate]);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (generating) return;
    const controller = new AbortController();
    generation.current = controller;
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/weeklyDietPlan`, {
        method: "POST", credentials: "include", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useManualTargets
          ? { target_mode: "manual", targets }
          : { target_mode: "automatic" }),
      });
      if (response.status === 401) { navigate("/Login"); return; }
      const data: { plan: WeeklyDiet; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create your meal plan");
      if (!controller.signal.aborted) setDiet(data.plan);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not create your plan");
    } finally {
      if (!controller.signal.aborted) setGenerating(false);
    }
  }

  const day = diet?.days.find((entry) => entry.day_name === selectedDay) ?? diet?.days[0];
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-[#c8ff00]">Weekly Meal Plan</h1>
        {loading ? <p role="status">Loading your meal plan…</p> : <>
          <form onSubmit={generate} className="mb-6 rounded-sm border border-[#2a2a2e] bg-[#111] p-5">
            <h2 className="text-xl">Your daily nutrition targets</h2>
            {!useManualTargets && <>
              {targetsLoading ? <p role="status">Calculating from your saved body details…</p> : calculation ? <>
                <NutritionSummary totals={calculation.targets} />
                <p className="mt-3 text-sm text-slate-300">
                  Based on {calculation.profile.age} years, {calculation.profile.weight} kg, {calculation.profile.height} cm,
                  {" "}{calculation.profile.activity.replaceAll("_", " ")} and goal: {calculation.profile.goal.replaceAll("_", " ")}.
                  Estimated maintenance: {calculation.maintenance_kcal.toFixed(0)} kcal/day.
                  Goal adjustment: {calculation.goal_adjustment_percent > 0 ? "+" : ""}{calculation.goal_adjustment_percent}%.
                </p>
                <p className="text-sm text-slate-400">{calculation.notice}</p>
              </> : <p role="alert" className="text-amber-300">{targetError}</p>}
              <Link to="/UserForm" className="mb-4 inline-block !text-[#c8ff00]">Update body details or goal</Link>
            </>}
            <label className="mb-4 flex items-center gap-2">
              <input type="checkbox" checked={useManualTargets} disabled={generating}
                onChange={(event) => {
                  setUseManualTargets(event.target.checked);
                  if (event.target.checked && calculation) setTargets({ ...calculation.targets });
                }} />
              Override with my own targets
            </label>
            {useManualTargets && <NutritionTargetFields values={targets} onChange={setTargets} disabled={generating} />}
            {diet && <button type="button" disabled={generating} className="mr-4 mb-3 underline"
              onClick={() => { setTargets({ ...diet.targets }); setUseManualTargets(true); }}>Use saved plan targets manually</button>}
            <button type="submit" disabled={generating || (!useManualTargets && (targetsLoading || !calculation))} className="rounded-sm bg-[#c8ff00] px-4 py-3 font-semibold text-black disabled:opacity-50">
              {generating ? "Building your week…" : diet ? "Generate new week" : "Generate weekly plan"}
            </button>
            {generating && <p role="status" className="mt-3">Adjusting portions and combining your shopping list…</p>}
          </form>
          {error && <p role="alert" className="mb-4 text-red-300">{error}</p>}
          {!diet && <p>No weekly plan yet. Generate a week using your calculated daily targets.</p>}
          {diet && day && <>
            <p className="mb-4 text-sm text-slate-300">{diet.notice}</p>
            <section className="mb-6 rounded-sm border border-[#2a2a2e] bg-[#111] p-5">
              <h2 className="text-xl">Daily targets used for this plan</h2>
              <p className="text-sm text-slate-400">{diet.target_calculation?.mode === "automatic" ? "Calculated from body details and goal when this plan was created." : "Manually supplied targets."} Generate a new week to apply changed body details.</p>
              <NutritionSummary totals={diet.targets} />
              <h2 className="mt-4 text-xl">Weekly totals</h2>
              <NutritionSummary totals={diet.totals} />
              <Link to="/ShoppingList" className="mt-4 inline-block !text-[#c8ff00]">View weekly shopping list →</Link>
            </section>
            <div role="group" aria-label="Choose a day" className="mb-5 flex flex-wrap gap-2">
              {diet.days.map((entry) => <button key={entry.day_name} type="button" aria-pressed={day.day_name === entry.day_name}
                onClick={() => setSelectedDay(entry.day_name)}
                className={`rounded-sm border px-3 py-2 ${day.day_name === entry.day_name ? "border-[#c8ff00] bg-[#c8ff00] text-black" : "border-[#555] bg-[#111] text-white"}`}>
                {entry.day_name}
              </button>)}
            </div>
            <section className="mb-5" aria-label="Daily totals">
              <h2 className="text-2xl">{day.day_name}</h2>
              <NutritionSummary totals={day.totals} />
              {!day.within_target_tolerance && <p className="mt-2 text-amber-300">At least one daily total is more than 10% from your target. These meals and portion limits may not fit your targets.</p>}
            </section>
            {day.meals.map((meal) => <section key={meal.meal_type} className="mb-4 rounded-sm border border-[#2a2a2e] bg-[#111] p-5">
              <p className="mb-1 text-sm uppercase text-[#c8ff00]">{meal.meal_type}</p>
              <h3 className="text-xl">{meal.meal_name}</h3>
              <NutritionSummary totals={meal.totals} />
              <details className="mt-4" open>
                <summary className="cursor-pointer text-[#c8ff00]">Ingredients and quantities</summary>
                <ul className="m-0 mt-3 list-none divide-y divide-[#2a2a2e] p-0">
                  {meal.ingredients.map((ingredient) => <li key={ingredient.food_key} className="flex justify-between gap-4 py-3">
                    <span>{ingredient.name}<small className="ml-2 text-slate-400">({ingredient.measurement_state.replaceAll("_", " ")})</small></span>
                    <span className="shrink-0">{ingredient.portion.portion_grams.toFixed(0)} g</span>
                  </li>)}
                </ul>
              </details>
            </section>)}
          </>}
        </>}
      </div>
    </main>
  );
}
