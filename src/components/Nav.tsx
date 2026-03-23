import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

const Nav = () => {
  const navigate = useNavigate();
  const handleLogOut = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <nav className="flex justify-content-center overflow-auto border-bottom bg-[#080808] ">
      <div className="flex justify-between items-center my-2">
        <a href="/" id="title">
          <h1 className="sm:text-2xl">POCKET PT</h1>
        </a>
        <ul className="flex">
          <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]">
            PLAN
          </li>
          <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]">
            <Link to={"/Dashboard"}>Dashboard</Link>
          </li>
          <a>
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]">
              <button onClick={handleLogOut}>Logout</button>
            </li>
          </a>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
