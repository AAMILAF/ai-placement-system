import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { getAnalytics } from "../api/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const data = await getAnalytics(token);
        setAnalytics(data);
      } catch (err) {
        alert("Failed to load analytics");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const calculateSuccessRate = () => {
    if (!analytics || analytics.total_candidates === 0) return 0;
    return Math.round(
      (analytics.eligible_candidates / analytics.total_candidates) * 100
    );
  };

  return (
    <DashboardLayout role="admin">

      <h1 className="text-3xl font-bold mb-10">
        🛠 Admin Analytics Dashboard
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading analytics...</p>
      ) : analytics ? (
        <>
          {/* STAT CARDS */}
          <div className="grid md:grid-cols-3 gap-8 mb-10">

            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 hover:scale-105 transition">
              <h2 className="text-gray-400 mb-3">
                Total Candidates
              </h2>
              <p className="text-4xl font-bold text-blue-400">
                {analytics.total_candidates}
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 hover:scale-105 transition">
              <h2 className="text-gray-400 mb-3">
                Eligible Candidates
              </h2>
              <p className="text-4xl font-bold text-green-400">
                {analytics.eligible_candidates}
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 hover:scale-105 transition">
              <h2 className="text-gray-400 mb-3">
                Success Rate
              </h2>
              <p className="text-4xl font-bold text-indigo-400">
                {calculateSuccessRate()}%
              </p>
            </div>

          </div>

          {/* SUCCESS PROGRESS BAR */}
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 mb-10">
            <h2 className="text-lg font-semibold mb-6">
              Platform Performance
            </h2>

            <div className="w-full bg-slate-700 rounded-full h-6">
              <div
                className="h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-1000"
                style={{ width: `${calculateSuccessRate()}%` }}
              ></div>
            </div>

            <p className="mt-4 text-gray-400">
              Overall recruitment readiness across platform.
            </p>
          </div>

          {/* SUMMARY */}
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">
              Platform Overview
            </h2>

            <p className="text-gray-300 leading-relaxed">
              This dashboard provides real-time AI-based placement
              prediction insights, candidate eligibility tracking,
              and recruitment analytics for decision-making.
            </p>
          </div>
        </>
      ) : (
        <p className="text-red-400">No analytics available</p>
      )}

    </DashboardLayout>
  );
}
