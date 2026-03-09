import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import "../App.css";

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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-6 shadow-xl md:p-8">
          <div className="mb-8 text-center">
            {!plan && (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-[#C8FF00]">
                  Generating Plan
                </h1>
                <p className="mt-2 text-md text-[#555]">
                  We are building your personalised training plan
                </p>
              </>
            )}

            {plan && (
              <>
                <div className="text-[#EFEFEF]">
                  <h1 className="text-3xl font-bold">Your Training Plan</h1>
                </div>
                <p className="mt-2 text-md text-[#555]">
                  Here is your personalised weekly training structure
                </p>
              </>
            )}
          </div>

          {!plan ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-sm text-slate-300">
                I am currently working on a plan that is perfectly suited to you
              </p>
              <div className="spinner-border text-[#C8FF00]" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {plan.days.map((d, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E]"
                >
                  <div className="flex flex-col gap-3 border-b-2 border-[#2a2a2a] bg-[#111] px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-[#c8ff00]">
                        <h2 className="text-xl font-semibold ">{d.day}</h2>
                      </div>
                      <p className="text-sm text-[#555]">{d.focus}</p>
                    </div>

                    <div className="inline-flex w-fit rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]">
                      {d.training_duration}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-[#161616]">
                        <tr>
                          <th className="px-5 py-4 text-left text-sm font-semibold text-slate-100">
                            Exercise
                          </th>
                          <th className="px-5 py-4 text-center text-sm font-semibold text-slate-100">
                            Reps
                          </th>
                          <th className="px-5 py-4 text-center text-sm font-semibold text-slate-100">
                            Sets
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#2a2a2a] bg-[#0E0E0E]">
                        {d.exercises.map((n, index) => (
                          <tr
                            key={index}
                            className="hover:bg-[#151515] transition"
                          >
                            <td className="px-5 py-4 text-sm font-medium text-slate-100">
                              {n.name ?? "Unknown exercise"}
                            </td>
                            <td className="px-5 py-4 text-center text-sm text-slate-300">
                              {Array.isArray(n.reps)
                                ? n.reps.join(" / ")
                                : String(n.reps ?? "N/A")}
                            </td>
                            <td className="px-5 py-4 text-center text-sm text-slate-300">
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
