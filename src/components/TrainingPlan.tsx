import { useEffect, useState, Fragment } from "react";
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

  const [cardIndex, setCardIndex] = useState<number | null>(null);

  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [eVideoId, setEvideoId] = useState<Record<string, string>>({});
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const cardCollapse = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };

  const toggleExercise = (workoutIndex: number, exerciseIndex: number) => {
    const key = `${workoutIndex}-${exerciseIndex}`;
    setOpenExercise((prev) => (prev === key ? null : key));
    console.log(key);
  };

  async function getVideo(name: string, rowKey: string) {
    console.log(name);
    try {
      /* Getting video data from youtube max result set to 1. */
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(name)}form&key=${apiKey}`;

      console.log();
      const response = await fetch(url);
      const data = await response.json();

      console.log(data.items[0].id.videoId);

      /* Getting videoID of the first video*/
      const videoId = data.items[0].id.videoId;
      /* Setting state based on the exercise card open*/
      setEvideoId((prev) => ({
        ...prev,
        [rowKey]: `https://www.youtube.com/embed/${videoId}`,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    /* Fetching training plan from database*/
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
        console.log(data);
        const names: string[] = [];

        /* Getting all exercise names. ====NOT USED AT THE MOMENT=== */
        for (let i = 0; i < data.workouts.length; i++) {
          for (let j = 0; j < data.workouts[i].exercises.length; j++) {
            names.push(data.workouts[i].exercises[j].name);
          }
        }
        console.log(names);
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
            <div className="space-y-4">
              {plan.workouts.map((d, workoutIndex) => (
                <div
                  key={workoutIndex}
                  className="overflow-hidden rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E] "
                >
                  <button
                    className="w-full"
                    onClick={() => cardCollapse(workoutIndex)}
                  >
                    <div className="flex border-b-2 border-[#2a2a2a] bg-[#111] px-5 py-4 items-center justify-between">
                      <div>
                        <div className="text-[#c8ff00]">
                          <h2 className="text-xl font-semibold text-left">
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

                  {cardIndex === workoutIndex && (
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
                            <th></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#2a2a2a] bg-[#0E0E0E]">
                          {d.exercises.map((n, exerciseIndex) => {
                            const rowKey = `${workoutIndex}-${exerciseIndex}`;
                            const isOpen = openExercise === rowKey;

                            return (
                              <Fragment key={rowKey}>
                                <tr
                                  onClick={() => {
                                    toggleExercise(workoutIndex, exerciseIndex);
                                    getVideo(n.name, rowKey);
                                  }}
                                  className={"hover:bg-[#181818]"}
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
                                  <td className="px-2 py-4 text-center text-sm text-slate-300">
                                    |||
                                  </td>
                                </tr>

                                {isOpen && (
                                  <tr>
                                    <td className="px-2 py-4 " colSpan={4}>
                                      {eVideoId[rowKey] ? (
                                        <iframe
                                          className={
                                            "w-full max-w-xl aspect-video"
                                          }
                                          src={`${eVideoId[rowKey]}`}
                                          title="YouTube video player"
                                          allow="accelerometer; 
                                      autoplay; clipboard-write; 
                                      encrypted-media; gyroscope; 
                                      picture-in-picture; web-share"
                                        ></iframe>
                                      ) : (
                                        <div
                                          className="spinner-border text-[#C8FF00]"
                                          role="status"
                                        >
                                          <span className="visually-hidden">
                                            Loading...
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
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
