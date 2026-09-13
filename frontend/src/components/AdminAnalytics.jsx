import { useEffect, useState } from "react";
import API from "../api/api";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/admin/analytics").then(res => setStats(res.data));
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-white p-4 rounded shadow">
      <p>Total Candidates: {stats.total_candidates}</p>
      <p>Eligible Candidates: {stats.eligible_candidates}</p>
    </div>
  );
}
