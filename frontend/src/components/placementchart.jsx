import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function PlacementChart({ data }) {
  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h3 className="font-semibold mb-3">Placement Probability Distribution</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="probability" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
