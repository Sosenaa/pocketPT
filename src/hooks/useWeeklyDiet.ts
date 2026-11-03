import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import type { WeeklyDiet } from "../types/diet";

export function useWeeklyDiet() {
  const navigate = useNavigate();
  const [diet, setDiet] = useState<WeeklyDiet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/weeklyDietPlan`, {
          credentials: "include", signal: controller.signal,
        });
        if (response.status === 401) { navigate("/Login"); return; }
        if (response.status === 404) return;
        if (!response.ok) throw new Error("Could not load your weekly meal plan");
        const data: { plan: WeeklyDiet } = await response.json();
        if (!controller.signal.aborted) setDiet(data.plan);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load your plan");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [navigate]);
  return { diet, setDiet, loading, error, setError };
}
