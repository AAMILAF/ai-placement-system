import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function PredictionChart({ data }) {
  return (
    <div className="mt-12 bg-slate-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-6">Prediction History</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="date" hide />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#4f46e5"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
