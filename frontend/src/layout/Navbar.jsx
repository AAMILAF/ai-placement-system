import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold tracking-wide">
        AI Placement Platform
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm opacity-80">
          {user.role.toUpperCase()}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
