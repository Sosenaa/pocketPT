import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "../api";

const Nav = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogOut = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/Login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="relative flex items-center border-b bg-[#080808] py-2">
      <div className="flex w-full items-center justify-between  px-4 my-2 ">
        <div className="">
          <a href="/" id="title">
            <h1 className="m-0 text-xl sm:text-2xl">POCKET PT</h1>
          </a>
        </div>

        <div>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] text-slate-400 lg:hidden"
          >
            |||
          </button>

          <ul className="hidden lg:flex m-0 p-0 ">
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] text-slate-400">
              <Link to={"/Plan"} className="!no-underline !text-inherit">
                PLAN
              </Link>
            </li>
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] text-slate-400">
              <Link to={"/Dashboard"} className="!no-underline !text-inherit">
                DASHBOARD
              </Link>
            </li>
            <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] text-slate-400">
              <Link to={"/UserForm"} className="!no-underline !text-inherit">
                CREATE PLAN
              </Link>
            </li>
            <a>
              <li className="mx-4 p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] text-slate-400">
                <button onClick={handleLogOut}>Logout</button>
              </li>
            </a>
          </ul>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden flex flex-col w-full absolute top-full bg-[#080808] border-b">
          <ul className="p-4 m-4">
            <li className="m-4  text-slate-400">
              <Link
                to={"/Plan"}
                className="block !no-underline !text-inherit p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]"
                onClick={closeMenu}
              >
                PLAN
              </Link>
            </li>

            <li className="m-4  text-slate-400">
              <Link
                to={"/Dashboard"}
                className="block !no-underline !text-inherit p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]"
                onClick={closeMenu}
              >
                DASHBOARD
              </Link>
            </li>
            <li className="m-4  text-slate-400">
              <Link
                to={"/UserForm"}
                className="block !no-underline !text-inherit p-2 px-4 border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00]"
                onClick={closeMenu}
              >
                CREATE PLAN
              </Link>
            </li>

            <li className="m-4  text-slate-400">
              <button
                className="p-2 px-4 text-left border-2 rounded-sm hover:border-[#C8FF00] hover:text-[#C8FF00] w-full"
                onClick={handleLogOut}
              >
                LOGOUT
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;
