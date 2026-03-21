import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");

  const submitUserDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://pocketpt.onrender.com/api/userDetails",
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            age,
            weight,
            height,
            gender,
            goal,
            activity,
          }),
        },
      );
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        navigate("/trainingPlan");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="min-h-screen px-4 py-10 bg-[#080808]">
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

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
                  onChange={(e) => setAge(Number(e.target.value))}
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
                  onChange={(e) => setWeight(Number(e.target.value))}
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
                  onChange={(e) => setHeight(Number(e.target.value))}
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
