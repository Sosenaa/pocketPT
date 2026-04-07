import { Fragment, useState } from "react";
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

const TodayWorkout = ({ workout }: todayWorkout) => {
  const navigate = useNavigate();
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [reps, setReps] = useState<number | null>(null);
  const showExerciseCard = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };

  const createLog = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/createLog`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseIndex,
          weight,
          reps,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        navigate("/Login");
        return null;
      }
      if (response.ok) {
        console.log(data);
        alert("New log created");
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };
  return (
    <div className="min-h-screen bg-[#080808] sm:px-4 sm:py-10 ">
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
                          onSubmit={createLog}
                        >
                          <div className="flex flex-col">
                            <h5 className="text-xs text-slate-400 mb-1">
                              Last week weight
                            </h5>
                            <p className="text-lg text-slate-400 mb-1">0kg</p>
                            <h5 className="text-xs text-slate-400 mb-1">
                              Last week reps
                            </h5>
                            <p className="text-lg text-slate-400 mb-1">0</p>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-lg text-slate-100 mb-1">
                              This week weight
                            </label>
                            <input
                              type="number"
                              className="px-2 py-1 bg-[#0E0E0E] border border-[#2a2a2a] rounded text-slate-100 focus:outline-none focus:border-[#C8FF00] max-w-[50%] "
                              value={Number(weight)}
                              onChange={(e) =>
                                setWeight(Number(e.target.value))
                              }
                            />

                            <label className="text-lg text-slate-100 mb-1">
                              This week reps
                            </label>
                            <input
                              type="number"
                              className="px-2 py-1 bg-[#0E0E0E] border border-[#2a2a2a] rounded text-slate-100 focus:outline-none focus:border-[#C8FF00] max-w-[50%] "
                              value={Number(reps)}
                              onChange={(e) => setReps(Number(e.target.value))}
                            />
                          </div>
                          <div className="flex flex-col justify-center items-end">
                            <button
                              type="submit"
                              className="inline-flex w-fit rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-medium text-[#080808]"
                              onClick={() =>
                                setExerciseIndex(exercise.exercise_id)
                              }
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
        </div>
      </div>

      {/* Add toggle card at each exercise. User should be able to add weight 
      ifted at the current workout at current exercise. 
      ****optional add algorithm to calculate next weeks target weight to be lifted for progression   */}

      <div className="mx-auto max-w-4xl mt-4">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-2 shadow-xl pt-2">
          <div className="flex border-[#2a2a2a] bg-[#111] px-4 py-1 items-center justify-between"></div>
          <div className="text-[#c8ff00]">
            <h2 className="text-xl font-semibold text-left">Today's Macros</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayWorkout;
