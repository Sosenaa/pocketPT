import { useEffect, useState } from "react";
import "../App.css";

const TrainingPlan = () => {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    fetch("/api/getTrainingPlan", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPlan(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <p>{plan}</p>
    /* 
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
*/
  );
};

export default TrainingPlan;
