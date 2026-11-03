import type { Nutrition } from "../types/diet";

export default function NutritionTargetFields({ values, onChange, disabled, required = true }: {
  values: Nutrition;
  onChange: (values: Nutrition) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const fields: [keyof Nutrition, string][] = [
    ["energy_kcal", "Calories (kcal)"], ["protein_g", "Protein (g)"],
    ["carbohydrates_g", "Carbs (g)"], ["fat_g", "Fat (g)"],
  ];
  return (
    <fieldset disabled={disabled} className="mb-4">
      <legend className="text-xl text-slate-100">Manual daily nutrition targets</legend>
      <p className="text-sm text-slate-300">These values override the calculated targets for this plan.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fields.map(([key, label]) => (
          <label key={key} className="block text-sm text-slate-100">{label}
            <input type="number" min="0.1" step="any" required={required} value={values[key] || ""}
              onChange={(event) => onChange({ ...values, [key]: Number(event.target.value) })}
              className="mt-2 w-full rounded-sm border border-[#555] bg-[#0e0e0e] px-3 py-2 text-slate-100" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
