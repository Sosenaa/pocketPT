import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm";
import TrainingPlanGen from "./components/TrainingPlanGen";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  });

  return (
    <div>
      <nav className="flex justify-center border-bottom bg-[#080808]">
        <div className="flex justify-between items-center w-full max-w-6xl my-2">
          <a href="/" id="title">
            <h1>POCKET PT</h1>
          </a>
          <ul className="flex">
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]">
              PLAN
            </li>
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]">
              PROFILE
            </li>
          </ul>
        </div>
      </nav>

      <div>
        <h1>{message}</h1>
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/UserForm" element={<UserForm />} />
          <Route path="/TrainingPlanGen" element={<TrainingPlanGen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
