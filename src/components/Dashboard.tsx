import TodayWorkout from "./TodayWorkout";
import { API_BASE_URL } from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Type file to be created in the future */
type Exercise = {
  exercise_id: number;
  name: string;
  sets: string;
  reps: string;
};

type Workout = {
  id: number;
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
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);
  const [workoutSelection, setWorkoutSelection] = useState(0);

  const today = new Date().getDay() + workoutSelection;

  useEffect(() => {
    /* Fetching training plan from database*/
    fetch(`${API_BASE_URL}/api/getTrainingPlan`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/Login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setPlan(data);
      })
      .catch(console.error);
  }, []);

  const todayWorkout: Workout | undefined = plan?.workouts.find(
    (w) => w.day_name === `Day ${today}`,
  );

  if (workoutSelection >= 6) {
    setWorkoutSelection(0);
  }

  console.log(workoutSelection);
  return (
    <div>
      {/* Nav */}
      {/* already exists */}

      {/* Today's / Next Workout */}
      {/* Fetch lates workout -> today's workout */}
      {/* TodayWorkout - potentially create new button in nav Today Workout + today Plan and keep them separate */}
      <TodayWorkout
        workout={todayWorkout}
        setWorkoutSelection={setWorkoutSelection}
      />
      {/* Quick stats */}
      {/* Derived from db */}

      {/* Progression tracking */}
      <div className="min-h-screen bg-[#080808] sm:px-4 sm:py-10 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-4 gap-4 mx-auto max-w-4xl text-slate-200">
          <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6 ">
            <div className="mb-8 text-center">
              <p>Workouts this month</p>
            </div>
          </div>
          <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
            <div className="mb-8 text-center">
              <p>Current Streak</p>
            </div>
          </div>

          <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
            <div className="mb-8 text-center">
              <p>Weekly Volume (Reps)</p>
            </div>
          </div>

          <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
            <div className="mb-8 text-center">
              <p>Latest PR</p>
            </div>
          </div>
        </div>
      </div>
      {/* User can input after each workout */}

      {/* Workout history */}
      {/* previous sessions */}

      {/*  */}

      {}
    </div>
  );
};

export default Dashboard;
