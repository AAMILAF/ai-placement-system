import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const { token, role: userRole } = useAuth();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && userRole !== role) return <Navigate to={`/${userRole || "login"}`} replace />;

  return children;
}
