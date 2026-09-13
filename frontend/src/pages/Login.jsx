import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(form);

      login(res.access_token, res.role, res.username);

      if (res.role === "admin") {
        navigate("/admin");
      } else if (res.role === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/student");
      }
    } catch (err) {
      alert(err.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800 p-8 rounded-xl w-96 shadow-xl">
        <h2 className="text-2xl text-white mb-6 text-center">
          AI Placement Platform
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <input
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full p-3 rounded bg-slate-700 text-white outline-none pr-10"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          className="text-blue-400 mt-4 text-center cursor-pointer"
          onClick={() => navigate("/register")}
        >
          New user? Register
        </p>
      </div>
    </div>
  );
}
