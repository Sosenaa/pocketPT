const UserForm = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow p-4">
            <h1 className="text-center">User details</h1>
            <form className="col g-3">
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
                />
              </div>
              {/* Gender */}
              <br />
              <div className="col-auto">
                <select className="form-select form-control">
                  <option selected>Select your gender</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
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
                />
              </div>

              {/* Goal */}
              <br />
              <div className="col-auto">
                <select className="form-select form-control">
                  <option selected>Select your goal</option>
                  <option value="1">Loose Weight</option>
                  <option value="2">Maintain Weight</option>
                  <option value="3">Gain Muscle</option>
                </select>
              </div>

              {/* Gender */}
              <br />
              <div className="col-auto">
                <select className="form-select form-control">
                  <option selected>Activity Level</option>
                  <option value="1">Sedentary (Low Activity)</option>
                  <option value="2">Moderately Active (Medium Activity)</option>
                  <option value="3">Highly Active (High Activity)</option>
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
