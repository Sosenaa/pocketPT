import { useLocation } from "react-router-dom";

const TrainingPlanGen = () => {
  const location = useLocation();
  const userData = location.state;
  return (
    <>
      <div>
        <h1>Hi {userData.name}</h1>
        <p>
          We are working on a training plan that is perfectly suited for you!
        </p>
      </div>
    </>
  );
};

export default TrainingPlanGen;
