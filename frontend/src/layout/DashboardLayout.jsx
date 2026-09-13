import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = {
  student: [{ label: "Dashboard", path: "/student" }],
  admin: [{ label: "Analytics", path: "/admin" }],
  recruiter: [{ label: "Pipeline", path: "/recruiter" }],
};

export default function DashboardLayout({ children, role, title = "Dashboard" }) {
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const initials = useMemo(
    () => (username || role || "U").slice(0, 2).toUpperCase(),
    [username, role]
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const surface =
    theme === "dark"
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-950";
  const panel =
    theme === "dark"
      ? "border-slate-800 bg-slate-900/95"
      : "border-slate-200 bg-white";

  return (
    <div className={`min-h-screen ${surface}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r ${panel} transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                AI Recruitment
              </p>
              <h1 className="text-lg font-bold">Intelligence</h1>
            </div>
          )}
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-9 w-9 rounded-md border border-slate-300 text-sm md:block dark:border-slate-700"
            title="Collapse sidebar"
          >
            {collapsed ? ">" : "<"}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-9 w-9 rounded-md border border-slate-300 text-sm md:hidden"
            title="Close menu"
          >
            x
          </button>
        </div>

        <nav className="space-y-2 px-3 py-6">
          {(navItems[role] || []).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-md px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={`${collapsed ? "md:pl-20" : "md:pl-72"} transition-all duration-300`}>
        <header className={`sticky top-0 z-30 border-b ${panel}`}>
          <div className="flex h-16 items-center gap-4 px-4 md:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 rounded-md border border-slate-300 md:hidden"
              title="Open menu"
            >
              =
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
              <h2 className="truncate text-xl font-bold">{title}</h2>
            </div>
            <div className="hidden w-full max-w-sm items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-950">
              Search candidates, skills, roles
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              className="relative rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              title="Notifications"
            >
              Alerts
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-rose-500">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
