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

type todayWorkout = {
  workout: Workout | undefined;
};

const TodayWorkout = ({ workout }: todayWorkout) => {
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
              <p className="text-sm text-[#555]">{workout?.focus}</p>
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
                <tr className={"hover:bg-[#181818] border-2"} key={index}>
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
                    ▼
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TodayWorkout;
