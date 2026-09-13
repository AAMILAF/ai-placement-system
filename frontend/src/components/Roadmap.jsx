export default function Roadmap() {
  const plan = [
    { week: 1, focus: "Strengthen fundamentals & weak skills" },
    { week: 2, focus: "Practice DSA / core skills daily" },
    { week: 3, focus: "Build 1 solid project + GitHub" },
    { week: 4, focus: "Mock interviews + resume optimization" }
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-semibold mb-4">
        AI-Generated Improvement Roadmap
      </h3>

      <ul className="space-y-3">
        {plan.map(p => (
          <li key={p.week} className="flex gap-3">
            <span className="font-bold text-blue-600">
              Week {p.week}
            </span>
            <span>{p.focus}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
