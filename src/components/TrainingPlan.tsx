import { useEffect, useState } from "react";
import "../App.css";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
type Exercise = {
  name: string;
  sets: string;
  reps: string;
};

type Workout = {
  day_name: string;
  focus: string;
  exercise_duration: string;
  exercises: Exercise[];
};

type TrainingPlanData = {
  plan_name: string;
  workouts: Workout[];
};

const TrainingPlan = () => {
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);
  const navigate = useNavigate();
  const [exercisesComplete, setExercisesComplete] = useState<number[]>([]);

  const [cardIndex, setCardIndex] = useState<number | null>(null);

  const cardCollapse = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };

  const toggleCompleted = (index: number) => {
    setExercisesComplete((prev) =>
      prev.includes(index)
        ? prev.filter((row) => row !== index)
        : [...prev, index],
    );
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/getTrainingPlan`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login");
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch training plan");
        }
        return res.json();
      })
      .then((data) => {
        setPlan(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] sm:px-4 sm:py-10 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
          <div className="mb-8 text-center">
            {plan ? (
              <>
                <div className="text-[#EFEFEF]">
                  <h1 className="text-3xl font-bold">{plan.plan_name}</h1>
                </div>
                <p className="mt-2 text-md text-[#555]">
                  Here is your personalised weekly training structure
                </p>
              </>
            ) : (
              <h1 className="text-3xl font-bold text-red-500">
                No training plan found
              </h1>
            )}
          </div>

          {plan ? (
            <div className="space-y-6">
              {plan.workouts.map((d, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E]"
                >
                  <button
                    className="w-full"
                    onClick={() => cardCollapse(index)}
                  >
                    <div className="flex flex-col gap-3 border-b-2 border-[#2a2a2a] bg-[#111] px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-[#c8ff00]">
                          <h2 className="text-xl font-semibold ">
                            {d.day_name}
                          </h2>
                        </div>
                        <p className="text-sm text-[#555]">{d.focus}</p>
                      </div>

                      <div className="inline-flex w-fit rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]">
                        {d.exercise_duration}
                      </div>
                    </div>
                  </button>

                  {cardIndex === index && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-[#161616]">
                          <tr>
                            <th className="pl-5 py-4 text-left text-sm font-semibold text-slate-100">
                              Exercise
                            </th>
                            <th className="px-2 py-4 text-center text-sm font-semibold text-slate-100">
                              Reps
                            </th>
                            <th className="px-2 py-4 text-center text-sm font-semibold text-slate-100">
                              Sets
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#2a2a2a] bg-[#0E0E0E]">
                          {d.exercises.map((n, index) => (
                            <tr
                              key={index}
                              onClick={() => toggleCompleted(index)}
                              className={`${exercisesComplete.includes(index) ? "bg-green-900" : null}`}
                            >
                              <td className="pl-5 py-4 text-sm font-medium text-slate-100">
                                {n.name}
                              </td>
                              <td className="px-2 py-4 text-center text-sm text-slate-300">
                                {n.reps}
                              </td>
                              <td className="px-2 py-4 text-center text-sm text-slate-300">
                                {n.sets}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-slate-300">
                Could not load training plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TrainingPlan;
