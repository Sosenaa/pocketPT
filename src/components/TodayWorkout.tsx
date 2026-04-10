import { Fragment, useState, useEffect } from "react";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";

type Exercise = {
  exercise_id: number;
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

type todayWorkout = {
  workout: Workout | undefined;
};

type LatestLogs = {
  weight: number;
  reps: number;
  created_at: string;
};

const TodayWorkout = ({ workout }: todayWorkout) => {
  const navigate = useNavigate();
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [latestLogs, setLatestLogs] = useState<Record<number, LatestLogs>>({});
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const showExerciseCard = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };
  useEffect(() => {
    const fetchLatestLogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getLatestLogs`, {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch latest logs");
        }

        const data = await response.json();
        setLatestLogs(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLatestLogs();
  }, [navigate]);

  const createLog = async (
    e: React.FormEvent<HTMLElement>,
    exerciseId: number,
  ) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/createLog`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId,
          weight,
          reps,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        navigate("/Login");
        return;
      }
      if (!response.ok) {
        alert(data.message || "Failed to create log");
        return;
      }
      console.log(data);
      alert("New log created");

      setWeight("");
      setReps("");
    } catch (error) {
      console.error(error);
    }
  };

  const submitWorkoutComplete = async (day_name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workoutComplete`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day_name }),
      });
      const data = await response.json();
      if (response.status === 401) {
        navigate("/Login");
        return;
      }
      if (!response.ok) {
        alert(data.message || "Failed");
        return;
      }
      alert("Workout completed submitted");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-[#080808] sm:px-4 sm:py-10 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-2 shadow-xl pt-2">
          <div className="flex border-b-2 border-[#2a2a2a] bg-[#111] px-4 py-1 items-center justify-between">
            <div>
              <div className="text-[#c8ff00]">
                <h2 className="text-xl font-semibold text-left">
                  Today's workout
                </h2>
              </div>
              <p className="text-sm text-slate-200">
                {workout?.focus || "Rest day"}
              </p>
            </div>
            <div className="inline-flex w-fit rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]">
              {workout?.exercise_duration}
            </div>
          </div>

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
              {workout?.exercises.map((exercise, index) => (
                <Fragment key={index}>
                  <tr className={"hover:bg-[#181818]"}>
                    <td className="pl-5 py-3 text-sm font-medium text-slate-100">
                      {exercise.name}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-slate-300">
                      {exercise.reps}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-slate-300">
                      {exercise.sets}
                    </td>

                    <td className="px-2 py-3 text-center text-sm text-slate-300">
                      <button onClick={() => showExerciseCard(index)}>▼</button>
                    </td>
                  </tr>

                  {cardIndex === index && (
                    <tr className={"hover:bg-[#181818] border-2  "}>
                      <td
                        colSpan={4}
                        className="pl-5 py-3 text-sm font-medium text-slate-100 px-4"
                      >
                        <form
                          className="grid grid-cols-3 gap-4"
                          onSubmit={(e) => createLog(e, exercise.exercise_id)}
                        >
                          <div className="flex flex-col ">
                            <h5 className="!text-lg !text-slate-300 mb-1 ">
                              Last week weight
                            </h5>
                            <p className="text-lg text-slate-400 mb-1">
                              {latestLogs[exercise.exercise_id]?.weight ?? 0}kg
                            </p>
                            <h5 className="mt-2 !text-lg !text-slate-300 mb-1 font-light">
                              Last week reps
                            </h5>
                            <p className="text-lg text-slate-400 mb-1">
                              {latestLogs[exercise.exercise_id]?.reps ?? 0}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-lg text-slate-300 mb-1">
                              This week weight
                            </label>
                            <input
                              type="number"
                              className="px-2 py-1 bg-[#0E0E0E] border border-[#2a2a2a] rounded text-slate-100 focus:outline-none focus:border-[#C8FF00] max-w-[50%] "
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />

                            <label className="mt-2 text-lg text-slate-300 mb-1">
                              This week reps
                            </label>
                            <input
                              type="number"
                              className="px-2 py-1 bg-[#0E0E0E] border border-[#2a2a2a] rounded text-slate-100 focus:outline-none focus:border-[#C8FF00] max-w-[50%] "
                              value={reps}
                              onChange={(e) => setReps(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col justify-center items-end">
                            <button
                              type="submit"
                              className="inline-flex w-fit rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="inline-flex w-full justify-end my-2 px-2">
            <div className="w-fit text-right rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]">
              <button onClick={() => submitWorkoutComplete(workout!.day_name)}>
                Workout complete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add toggle card at each exercise. User should be able to add weight 
      ifted at the current workout at current exercise. 
      ****optional add algorithm to calculate next weeks target weight to be lifted for progression   */}
    </div>
  );
};

export default TodayWorkout;
