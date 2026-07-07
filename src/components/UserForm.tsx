import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "../App.css";

const UserForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");
  const [trainingEnvironment, setTrainingEnvironment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = ["Basics", "Goal", "Lifestyle"];
  const progress = ((step + 1) / steps.length) * 100;

  const clearError = () => setError("");

  const validateStep = () => {
    if (step === 0 && (!age || !weight || !height || !gender)) {
      setError("Please fill in all basic details.");
      return false;
    }

    if (step === 1 && (!goal || !trainingEnvironment)) {
      setError("Please choose your goal and training environment.");
      return false;
    }

    if (step === 2 && !activity) {
      setError("Please choose your activity level.");
      return false;
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitUserDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep()) return;

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

      if (response.status === 401) {
        navigate("/Login");
        return;
      }

      if (response.ok) {
        navigate("/trainingPlan");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C8FF00]">
            PocketPT setup
          </p>

          <h1 className="mt-2 text-3xl font-bold">Build your plan</h1>

          <p className="mt-2 text-sm text-slate-400">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1d1d1d]">
            <div
              className="h-full rounded-full bg-[#C8FF00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={submitUserDetails}
          className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-5 shadow-xl"
        >
          {error && (
            <div className="mb-5 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <NumberInput
                label="Age"
                value={age}
                onChange={(value) => {
                  setAge(value);
                  clearError();
                }}
                placeholder="30"
                min="12"
                max="100"
              />

              <NumberInput
                label="Weight"
                value={weight}
                onChange={(value) => {
                  setWeight(value);
                  clearError();
                }}
                placeholder="88"
                unit="kg"
                min="30"
                max="250"
              />

              <NumberInput
                label="Height"
                value={height}
                onChange={(value) => {
                  setHeight(value);
                  clearError();
                }}
                placeholder="172"
                unit="cm"
                min="100"
                max="230"
              />

              <SelectInput
                label="Gender"
                value={gender}
                onChange={(value) => {
                  setGender(value);
                  clearError();
                }}
                options={[
                  ["", "Select your gender"],
                  ["male", "Male"],
                  ["female", "Female"],
                ]}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <SelectInput
                label="Goal"
                value={goal}
                onChange={(value) => {
                  setGoal(value);
                  clearError();
                }}
                options={[
                  ["", "Select your goal"],
                  ["lose_weight", "Lose weight"],
                  ["maintain_weight", "Maintain weight"],
                  ["gain_muscle", "Gain muscle"],
                  ["increase_strength", "Increase strength"],
                  ["improve_endurance", "Improve endurance"],
                ]}
              />

              <SelectInput
                label="Training Environment"
                value={trainingEnvironment}
                onChange={(value) => {
                  setTrainingEnvironment(value);
                  clearError();
                }}
                options={[
                  ["", "Select your environment"],
                  ["full_gym", "Full gym"],
                  ["basic_gym", "Basic gym"],
                  ["home_gym", "Home gym"],
                  ["home_bodyweight", "Home bodyweight"],
                  ["mixed", "Mixed"],
                ]}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <SelectInput
                label="Activity Level"
                value={activity}
                onChange={(value) => {
                  setActivity(value);
                  clearError();
                }}
                options={[
                  ["", "Select activity level"],
                  ["low_activity", "Sedentary"],
                  ["medium_activity", "Moderately active"],
                  ["high_activity", "Highly active"],
                ]}
              />

              <div className="rounded-sm bg-[#0E0E0E] p-4 text-sm text-slate-400">
                Your AI plan will be created using your goal, body details, gym
                access, and activity level.
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={previousStep}
                disabled={loading}
                className="min-h-12 flex-1 rounded-sm border-2 border-[#2a2a2a] px-5 py-3 font-medium text-slate-200 disabled:opacity-50"
              >
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="min-h-12 flex-1 rounded-sm bg-[#C8FF00] px-5 py-3 font-semibold text-[#080808]"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 flex-1 rounded-sm bg-[#C8FF00] px-5 py-3 font-semibold text-[#080808] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating plan..." : "Generate Training Plan"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

type NumberInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit?: string;
  min?: string;
  max?: string;
};

const NumberInput = ({
  label,
  value,
  onChange,
  placeholder,
  unit,
  min,
  max,
}: NumberInputProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-400">
      {label}
    </span>

    <div className="relative">
      <input
        required
        type="number"
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E] px-4 py-3 pr-14 text-base text-slate-100 outline-none transition focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]/30"
      />

      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {unit}
        </span>
      )}
    </div>
  </label>
);

type SelectInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
};

const SelectInput = ({ label, value, onChange, options }: SelectInputProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-400">
      {label}
    </span>

    <select
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-12 w-full rounded-sm border-2 border-[#2a2a2a] bg-[#0E0E0E] px-4 py-3 text-base text-slate-100 outline-none transition focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]/30"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  </label>
);

export default UserForm;
