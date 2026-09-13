import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
  getRecruiterCandidates,
  getRecruiterPipeline,
  sendInterviewCall,
  updateCandidateNotes,
  updateCandidateStatus,
} from "../api/api";

const statusOptions = ["shortlisted", "interview", "hired", "rejected"];

export default function RecruiterDashboard() {
  const token = localStorage.getItem("token");
  const [candidates, setCandidates] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const pipelineMap = useMemo(
    () => Object.fromEntries(pipeline.map((item) => [item.status, item.count])),
    [pipeline]
  );

  const loadRecruiterData = async () => {
    if (!token) return;
    setError("");
    try {
      const [candidateData, pipelineData] = await Promise.all([
        getRecruiterCandidates(token),
        getRecruiterPipeline(token),
      ]);
      setCandidates(candidateData);
      setPipeline(pipelineData);
    } catch (err) {
      setError(err.message || "Failed to load recruiter data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const handleStatusChange = async (candidateId, status) => {
    setSavingId(candidateId);
    try {
      await updateCandidateStatus(candidateId, status, token);
      await loadRecruiterData();
    } catch (err) {
      alert(err.message || "Unable to update status");
    } finally {
      setSavingId(null);
    }
  };

  const handleNotesBlur = async (candidateId, notes) => {
    setSavingId(candidateId);
    try {
      await updateCandidateNotes(candidateId, notes, token);
      await loadRecruiterData();
    } catch (err) {
      alert(err.message || "Unable to save notes");
    } finally {
      setSavingId(null);
    }
  };

  const handleInterviewCall = async (candidateId) => {
    setSavingId(candidateId);
    try {
      await sendInterviewCall(candidateId, token);
      await loadRecruiterData();
    } catch (err) {
      alert(err.message || "Unable to send interview call");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout role="recruiter" title="Recruiter Pipeline">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
          <p className="mt-2 text-sm text-slate-400">
            Review eligible candidates, move them through hiring stages, and record notes.
          </p>
        </div>
        <button
          onClick={loadRecruiterData}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {statusOptions.map((status) => (
          <div key={status} className="rounded-lg border border-slate-700 bg-slate-800 p-5">
            <p className="text-sm capitalize text-slate-400">{status}</p>
            <p className="mt-2 text-3xl font-bold">{pipelineMap[status] || 0}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-slate-400">Loading candidates...</p>}
      {error && <p className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-300">{error}</p>}

      {!loading && !error && candidates.length === 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-300">
          No candidates have been dispatched yet.
        </div>
      )}

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="rounded-lg border border-slate-700 bg-slate-800 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{candidate.student_username}</h2>
                  <span className="rounded-md bg-blue-600/20 px-3 py-1 text-sm text-blue-200">
                    {candidate.job_role}
                  </span>
                  {candidate.interview_sent && (
                    <span className="rounded-md bg-emerald-600/20 px-3 py-1 text-sm text-emerald-200">
                      Interview sent
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-slate-700 px-3 py-1 text-sm text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-slate-900 p-3">
                  <p className="text-slate-400">Placement</p>
                  <p className="text-2xl font-bold text-emerald-300">{candidate.probability}%</p>
                </div>
                <div className="rounded-md bg-slate-900 p-3">
                  <p className="text-slate-400">ATS</p>
                  <p className="text-2xl font-bold text-indigo-300">{candidate.ats_score}%</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <select
                value={candidate.status}
                onChange={(event) => handleStatusChange(candidate.id, event.target.value)}
                className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                disabled={savingId === candidate.id}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                defaultValue={candidate.notes}
                onBlur={(event) => handleNotesBlur(candidate.id, event.target.value)}
                placeholder="Add recruiter notes"
                className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                disabled={savingId === candidate.id}
              />

              <button
                onClick={() => handleInterviewCall(candidate.id)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingId === candidate.id}
              >
                Send Interview
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
