import TodayWorkout from "./TodayWorkout";
import { API_BASE_URL } from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [workoutsThisMonth, setWorkoutsThisMonth] = useState("");
  const [weeklyVolume, setWeeklyVolume] = useState("");

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
        if (res.status === 404) {
          navigate("/UserForm");
          alert("Complete the form to create training plan");
        }
        return res.json();
      })
      .then((data) => {
        setPlan(data);
      })
      .catch(console.error);
  }, [navigate]);

  /* Keep useEffect fetch separate for now. Later refactor into single function */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/getCompletedThisMonth`,
          {
            credentials: "include",
            method: "POST",
          },
        );
        if (response.status === 401) {
          navigate("/Login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch This Months completed workouts");
        }
        const data = await response.json();
        setWorkoutsThisMonth(data.result);

        console.log(data.result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [navigate]);

  const weekday = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "New",
  ];
  const dayIndex = new Date();
  const day = weekday[dayIndex.getDay() + workoutSelection];

  if (day === "New") {
    setWorkoutSelection(0);
  }
  const todayWorkout: Workout | undefined = plan?.workouts.find(
    (w) => w.day_name === day,
  );

  useState(() => {
    const fetchWeeklyVolume = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getWeeklyVolume`, {
          credentials: "include",
          method: "GET",
        });
        if (response.status === 401) {
          navigate("/Login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch Weekly volume");
        }
        const data = await response.json();
        console.log(data.result);
        setWeeklyVolume(data.result);
      } catch (err) {
        console.log(err);
      }
    };
    fetchWeeklyVolume();
  });

  console.log(`This is workout selection ${workoutSelection}`);
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
              <h1>{workoutsThisMonth}</h1>
            </div>
          </div>

          <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] sm:p-6 shadow-xl pt-6">
            <div className="mb-8 text-center">
              <p>Weekly Volume (Reps)</p>
              <h2>{weeklyVolume}</h2>
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
