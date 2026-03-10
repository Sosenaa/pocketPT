import React, { useState } from "react";

const Register = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen px-4 py-10 bg-[#080808]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-6 shadow-xl md:p-8">
          <div className="mb-8 text-center text-[#C8FF00]">
            <h1 className="text-3xl font-bold tracking-tight ">Register</h1>
            <p className="mt-2 text-md text-[#555] ">
              Fill in your information.
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Your Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="You email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Your Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Confirm your password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>
            </div>
            <div className="flex w-full justify-content-center">
              <button
                type="submit"
                className="w-full max-w-xl rounded-sm bg-[#C8FF00] px-5 py-3 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800 "
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
