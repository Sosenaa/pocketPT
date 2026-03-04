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

  const handlePlan = (e: React.SubmitEvent) => {
    e.preventDefault();

    navigate("/TrainingPlanGen", {
      state: { name, age, weight, height, gender, goal, activity },
    });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow p-4">
            <h1 className="text-center">User details</h1>
            <form className="col g-3" onSubmit={handlePlan}>
              {/* Name */}
              <div className="col-auto">
                <label htmlFor="name" className="form-label">
                  First Name
                </label>
                <div className="col-auto">
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              {/* Age */}
              <div className="col-auto">
                <label htmlFor="age" className="form-label">
                  Age
                </label>
              </div>
              <div className="col-auto">
                <input
                  type="text"
                  id="age"
                  className="form-control"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>
              {/* Gender */}
              <br />
              <div className="col-auto">
                <select
                  className="form-select form-control"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option selected>Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {/* Weight */}
              <div className="col-auto">
                <label htmlFor="weight" className="col-form-label">
                  Weight
                </label>
              </div>
              <div className="col-auto">
                <input
                  type="text"
                  id="weight"
                  className="form-control"
                  placeholder="Your Weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              {/* Height */}
              <div className="col-auto">
                <label htmlFor="height" className="col-form-label">
                  Height
                </label>
              </div>
              <div className="col-auto">
                <input
                  type="text"
                  id="height"
                  className="form-control"
                  placeholder="Your Height"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>

              {/* Goal */}
              <br />
              <div className="col-auto">
                <select
                  className="form-select form-control"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option selected>Select your goal</option>
                  <option value="loose_weight">Loose Weight</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                </select>
              </div>

              {/* Gender */}
              <br />
              <div className="col-auto">
                <select
                  className="form-select form-control"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option selected>Activity Level</option>
                  <option value="low_activity">Sedentary (Low Activity)</option>
                  <option value="medium_activity">
                    Moderately Active (Medium Activity)
                  </option>
                  <option value="high_activity">
                    Highly Active (High Activity)
                  </option>
                </select>
              </div>

              <div className="col-12 d-grid mt-4">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
