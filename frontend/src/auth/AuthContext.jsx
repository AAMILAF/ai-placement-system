import { createContext, useContext, useMemo, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const login = (token, role, username = "") => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setToken(token);
    setRole(role);
    setUsername(username);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const value = useMemo(
    () => ({
      token,
      role,
      username,
      user: token ? { username, role } : null,
      login,
      logout,
    }),
    [token, role, username]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
