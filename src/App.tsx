import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm";
import TrainingPlanGen from "./components/TrainingPlanGen";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import Nav from "./components/Nav";
import Register from "./components/Register";

function App() {
  return (
    <div>
      <Nav />

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
