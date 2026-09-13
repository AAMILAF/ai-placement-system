import { Link } from "react-router-dom";

export default function NotFound() {
  const role = localStorage.getItem("role") || "login";
  const target = role === "login" ? "/login" : `/${role}`;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">404</p>
        <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-slate-400">
          This route is not part of the recruitment platform.
        </p>
        <Link
          to={target}
          className="mt-8 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Go back
        </Link>
      </div>
    </main>
  );
}
