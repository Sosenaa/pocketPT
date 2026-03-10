import React from "react";

const Nav = () => {
  return (
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
  );
};

export default Nav;
