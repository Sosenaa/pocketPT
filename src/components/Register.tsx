import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [backendLive, setBackendLive] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password == confirmPassword) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            name,
            lastName,
            email,
            password,
            confirmPassword,
          }),
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          alert("Registered successfully");
          navigate("/Login");
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Incorrect password");
    }
  };

  useEffect(() => {
    const wakeBackend = async () => {
      for (let i = 0; i < 10; i++) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/health`);
          if (response.ok) {
            setBackendLive(true);
          }
        } catch (error) {
          console.error(error);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };
    wakeBackend();
  }, []);

  if (!backendLive) {
    return (
      <div className="min-h-screen px-1 sm:px-4 py-10 bg-[#080808]">
        <div className="spinner-border text-[#C8FF00] m-8" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="m-8 ">Please wait... Setting up the server.</p>
        <p className="m-8 ">This might take up to 1 min</p>
        <p className="m-8 ">
          Website will refresh automaticly every 10 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-1 sm:px-4 py-10 bg-[#080808]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-4 shadow-xl md:p-8">
          <div className="flex w-full justify-content-end">
            <button
              onClick={() => navigate("/Login")}
              className="text-center rounded-sm bg-[#C8FF00] px-3 py-2 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800"
            >
              Login
            </button>
          </div>
          <div className="mb-8 text-center text-[#C8FF00]">
            <h1 className="text-3xl font-bold tracking-tight ">Register</h1>
            <p className="mt-2 text-md text-[#555] ">
              Fill in your information.
            </p>
          </div>

          <form className="space-y-6" method="POST" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

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
                  name="name"
                  required
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
                  name="lastName"
                  required
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
                  name="email"
                  required
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
                  name="password"
                  required
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
                  name="confirmPassword"
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>
            </div>
            <div className="flex w-full justify-content-center">
              <button
                type="submit"
                className="w-full max-w-xl rounded-sm bg-[#C8FF00] px-5 py-3 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800 my-4"
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
