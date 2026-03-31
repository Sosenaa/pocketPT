import TodayWorkout from "./TodayWorkout";
import { API_BASE_URL } from "../api";
import { useEffect, useState } from "react";

/* Type file to be created in the future */
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

const Dashboard = () => {
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);

  const today = new Date().getDay();

  useEffect(() => {
    /* Fetching training plan from database*/
    fetch(`${API_BASE_URL}/api/getTrainingPlan`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPlan(data))
      .catch(console.error);
  }, []);

  const todayWorkout: Workout | undefined = plan?.workouts.find(
    (w) => w.day_name === `Day ${today}`,
  );

  return (
    <div>
      {/* Nav */}
      {/* already exists */}

      {/* Today's / Next Workout */}
      {/* Fetch lates workout -> today's workout */}
      <TodayWorkout workout={todayWorkout} />
      {/* Quick stats */}
      {/* Derived from db */}

      {/* Progression tracking */}
      {/* User can input after each workout */}

      {/* Workout history */}
      {/* previous sessions */}

      {/*  */}

      {}
    </div>
  );
};

export default Dashboard;
