import { useState } from "react";
import API from "../api/api";
import PredictionResult from "./PredictionResult";

export default function StudentProfileForm() {
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    cgpa: "",
    skills: "",
    internships: "",
    projects: "",
    job_role: "",
    locations: ""
  });

  const submit = async () => {
    const payload = {
      cgpa: parseFloat(form.cgpa),
      skills: form.skills.split(","),
      internships: form.internships.split(","),
      projects: form.projects.split(","),
      job_role: form.job_role,
      locations: form.locations.split(",")
    };

    const res = await API.post("/predict", payload);
    setResult(res.data);
  };

  return (
    <div>
      <h2 className="font-semibold">Placement Profile</h2>
      {Object.keys(form).map((k) => (
        <input key={k} className="input mt-2" placeholder={k}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
      ))}
      <button onClick={submit} className="btn mt-4">Predict</button>
      {result && <PredictionResult data={result} />}
    </div>
  );
}
