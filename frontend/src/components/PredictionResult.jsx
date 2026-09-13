export default function PredictionResult({ data }) {
  return (
    <div className="mt-4 bg-green-100 p-4 rounded">
      <p>Placement Probability: <b>{data.placement_probability}%</b></p>
      <p>Recommended Companies:</p>
      <ul className="list-disc ml-5">
        {data.recommended_companies.map(c => <li key={c}>{c}</li>)}
      </ul>
    </div>
  );
}
