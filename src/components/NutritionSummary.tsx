import type { Nutrition } from "../types/diet";

export default function NutritionSummary({ totals }: { totals: Nutrition }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
      <span>Energy: {totals.energy_kcal.toFixed(1)} kcal</span>
      <span>Protein: {totals.protein_g.toFixed(1)} g</span>
      <span>Carbs: {totals.carbohydrates_g.toFixed(1)} g</span>
      <span>Fat: {totals.fat_g.toFixed(1)} g</span>
    </div>
  );
}
