import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(form);

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800 p-8 rounded-xl w-96 shadow-xl">
        <h2 className="text-2xl text-white mb-6 text-center">
          Register
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
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

          {/* Role */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white outline-none"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="recruiter">Recruiter</option>
          </select>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p
          className="text-blue-400 mt-4 text-center cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}