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
    <div>
      <h1>{workout?.day_name}</h1>
      <h1>{workout?.exercise_duration}</h1>
      <h1>{workout?.focus}</h1>

      {workout?.exercises.map((exercise, index) => (
        <div key={index}>
          <h1>{exercise.name}</h1>
          <h1>{exercise.sets}</h1>
          <h1>{exercise.reps}</h1>
        </div>
      ))}
    </div>
  );
};

export default TodayWorkout;
