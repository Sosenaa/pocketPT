import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "../App.css";
const UserForm = () => {
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");
  const [trainingEnvironment, setTrainingEnvironment] = useState("");
  const [loading, setLoading] = useState(false);

  useState(() => {
    const CheckAuth = async () => {
      const response = await fetch(`${API_BASE_URL}/api/checkAuth`, {
        credentials: "include",
        method: "GET",
      });
      if (response.status === 200) {
        return;
        console.log(response.status);
      } else {
        navigate("/Login");
      }
    };
    CheckAuth();
  });

  const submitUserDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/userDetails`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age,
          weight,
          height,
          gender,
          goal,
          trainingEnvironment,
          activity,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (response.status === 401) {
        navigate("/Login");
        return;
      }
      if (response.ok) {
        navigate("/trainingPlan");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10 bg-[#080808]">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-sm text-slate-300">
            I am currently working on a plan that is perfectly suited to you
          </p>
          <div className="spinner-border text-[#C8FF00]" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-1 py-10 bg-[#080808]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-6 shadow-xl md:p-8">
          <div className="mb-8 text-center text-[#C8FF00]">
            <h1 className="text-3xl font-bold tracking-tight ">User Details</h1>
            <p className="mt-2 text-md text-[#555] ">
              Fill in your information to generate your personalised training
              plan
            </p>
          </div>

          <form onSubmit={submitUserDetails} className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2"></div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label
                  htmlFor="weight"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Weight
                </label>
                <input
                  type="number"
                  id="weight"
                  placeholder="Your weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              {/* Height */}
              <div>
                <label
                  htmlFor="height"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Height
                </label>
                <input
                  type="number"
                  id="height"
                  placeholder="Your height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              {/* Goal */}
              <div className="md:col-span-2">
                <label
                  htmlFor="goal"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Goal
                </label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                >
                  <option value="">Select your goal</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                  <option value="increase_strength">Increase Strength</option>
                  <option value="improve_endurance">Improve Endurance</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="training_enviroment"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Training Environment
                </label>
                <select
                  id="training_enviroment"
                  value={trainingEnvironment}
                  onChange={(e) => setTrainingEnvironment(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                >
                  <option value="">Select your environment</option>
                  <option value="full_gym">Full gym</option>
                  <option value="basic_gym">Basic gym</option>
                  <option value="home_gym">Home gym</option>
                  <option value="home_bodyweight">Home bodyweight</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Activity */}
              <div className="md:col-span-2">
                <label
                  htmlFor="activity"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Activity Level
                </label>
                <select
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-slate-100 outline-none transition focus:ring-2 focus:ring-[#c8ff00]"
                >
                  <option value="">Select activity level</option>
                  <option value="low_activity">Sedentary (Low Activity)</option>
                  <option value="medium_activity">
                    Moderately Active (Medium Activity)
                  </option>
                  <option value="high_activity">
                    Highly Active (High Activity)
                  </option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-sm bg-[#C8FF00] px-5 py-3 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Generate Training Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
