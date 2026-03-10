import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm";
import TrainingPlanGen from "./components/TrainingPlanGen";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import Nav from "./components/Nav";
import Register from "./components/Register";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  });

  return (
    <div>
      <Nav />
      <div>
        <h1>{message}</h1>
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/UserForm" element={<UserForm />} />
          <Route path="/TrainingPlanGen" element={<TrainingPlanGen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
