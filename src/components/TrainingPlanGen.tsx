import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import { useEffect, useState } from "react";

type Exercise = {
  name: string;
  sets: number;
  reps: number[];
};

type TrainingPlan = {
  day: string;
  focus: string;
  training_duration: string;
  exercises: Exercise[];
};

type TrainingWeek = {
  days: TrainingPlan[];
};

const TrainingPlanGen = () => {
  const location = useLocation();
  const userData = location.state;
  const [plan, setPlan] = useState<TrainingWeek | null>(null);

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  useEffect(() => {
    const handlePlan = async () => {
      const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: `
      Generate training 7 day plan for client 
      name:${userData.name} 
      age:${userData.age} 
      goal:${userData.goal}
      weight:${userData.weight}
      height:${userData.height}
      gender:${userData.gender}
      activity:${userData.activity}

      Return ONLY valid JSON.
      Do not use markdown. Do not wrap in triple backticks.
      No explanations. No extra text.

      Return only valid JSON.
      No explanations.
      No extra text
      
      Forma Example: 
      {
        "days": [
        {  
            "day": "Day 1",
            "focus": "Upper body",
            "training_duration": "70 min",
            "exercises": [
              {
                "name": "Bench press",
                "sets": 4,
                "reps": [12,15,15,12]
              }
            ]
        }
        ]
      }`,
      });

      let parsedPlan: TrainingWeek;

      try {
        parsedPlan = JSON.parse(response.output_text) as TrainingWeek;
      } catch (err) {
        console.error("Invalid JSON:", response.output_text);
        return;
      }

      setPlan(parsedPlan);
    };
    handlePlan();
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="p-6 md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight capitalize text-slate-800">
              Welcome back {userData.name}
            </h1>
          </div>

          {!plan ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-4 text-sm">
                I am currently working on a plan that is perfectly suited to you
              </p>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {plan.days.map((d, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-black ">
                        {d.day}
                      </h2>
                      <p className="text-sm text-slate-500">{d.focus}</p>
                    </div>

                    <div className="inline-flex w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                      {d.training_duration}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                            Exercise
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                            Reps
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                            Sets
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {d.exercises.map((n, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {n.name ?? "Unknown exercise"}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                              {Array.isArray(n.reps)
                                ? n.reps.join(" / ")
                                : String(n.reps ?? "N/A")}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                              {typeof n.sets === "number" ? n.sets : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanGen;
