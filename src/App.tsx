import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm";
import TrainingPlanGen from "./components/TrainingPlan";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import Nav from "./components/Nav";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  return (
    <div>
      <Nav />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/UserForm" element={<UserForm />} />
          <Route path="/TrainingPlanGen" element={<TrainingPlanGen />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
