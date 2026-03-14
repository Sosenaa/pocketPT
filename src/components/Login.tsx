import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert(`Welcome ${username}`);
        navigate("/UserForm");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-[#080808]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-sm border-2 border-[#2a2a2e] bg-[#111] p-4 shadow-xl md:p-8">
          <div className="flex w-full justify-content-end">
            <button
              onClick={() => navigate("/Register")}
              className="text-center rounded-sm bg-[#C8FF00] px-3 py-2 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800"
            >
              Register
            </button>
          </div>
          <div className="flex w-full justify-content-center">
            <form
              className="space-y-6 w-full max-w-2xl"
              method="POST"
              onSubmit={handleLogin}
            >
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
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#555]"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border-[#2a2a2a] border-2 bg-[#0E0E0E] px-4 py-3 text-[#EFEFEF] outline-none transition-colors focus:ring-2 focus:ring-[#c8ff00]"
                />
              </div>

              <div className="flex w-full justify-content-center">
                <button
                  type="submit"
                  className="w-full max-w-xl rounded-sm bg-[#C8FF00] px-5 py-3 text-md font-medium text-[#080808] shadow-md transition hover:bg-slate-800 my-4"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
