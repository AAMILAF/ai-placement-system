import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { predictPlacement, getHistory } from "../api/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  const resultRef = useRef(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    cgpa: "",
    skills: "",
    job_role: "",
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const data = await getHistory(token);
      setHistory(data.reverse());
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    if (!form.cgpa || !form.skills || !form.job_role) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await predictPlacement(
        {
          cgpa: parseFloat(form.cgpa),
          skills: form.skills.split(",").map((s) => s.trim()),
          job_role: form.job_role,
        },
        token
      );

      setResult(response);
      fetchHistory();

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (err) {
      alert("Prediction failed");
    }

    setLoading(false);
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(resultRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.text("AI Placement Prediction Report", 10, 10);
    pdf.addImage(imgData, "PNG", 10, 20, 180, 100);
    pdf.save("placement_report.pdf");
  };

  return (
    <DashboardLayout role="student">

      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      {/* FORM */}
      <div className="bg-slate-800 p-6 rounded-xl mb-10">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            name="cgpa"
            placeholder="CGPA"
            onChange={handleChange}
            className="p-3 bg-slate-700 rounded-lg"
          />

          <input
            name="skills"
            placeholder="Skills (comma separated)"
            onChange={handleChange}
            className="p-3 bg-slate-700 rounded-lg"
          />
        </div>

        <input
          name="job_role"
          placeholder="Interested Job Role"
          onChange={handleChange}
          className="mt-4 w-full p-3 bg-slate-700 rounded-lg"
        />

        <button
          onClick={handlePredict}
          className="mt-6 bg-blue-600 px-6 py-2 rounded-lg"
        >
          {loading ? "Analyzing..." : "Predict"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div ref={resultRef} className="bg-slate-800 p-8 rounded-xl mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Placement Probability: {result.placement_probability}%
          </h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Recommended Companies:</h3>
            {result.recommended_companies.map((c, i) => (
              <span
                key={i}
                className="inline-block bg-indigo-600 px-4 py-2 rounded-lg mr-3 mb-2"
              >
                {c}
              </span>
            ))}
          </div>

          {result.skill_gap?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-red-400 font-semibold mb-2">
                Missing Skills:
              </h3>
              {result.skill_gap.map((s, i) => (
                <span
                  key={i}
                  className="inline-block bg-red-600/30 border border-red-500 px-4 py-2 rounded-lg mr-3 mb-2"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={exportPDF}
            className="bg-green-600 px-6 py-2 rounded-lg"
          >
            Download PDF
          </button>

        </div>
      )}

      {/* HISTORY CHART */}
      {history.length > 0 && (
        <div className="bg-slate-800 p-8 rounded-xl">
          <h2 className="text-xl font-bold mb-6">Prediction History</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </DashboardLayout>
  );
}
