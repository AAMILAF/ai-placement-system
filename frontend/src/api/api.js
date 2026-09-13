const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/* ================= CORE REQUEST ================= */

async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null,
  isFormData = false
) {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : null,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/* ================= AUTH ================= */

export const registerUser = (data) =>
  apiRequest("/register", "POST", data);

export const loginUser = (data) =>
  apiRequest("/login", "POST", data);

/* ================= STUDENT ================= */

export const predictPlacement = (data, token) =>
  apiRequest("/predict", "POST", data, token);

export const getHistory = (token) =>
  apiRequest("/history", "GET", null, token);

export const uploadResume = (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(
    "/upload_resume",
    "POST",
    formData,
    token,
    true
  );
};

/* ================= ADMIN ================= */

export const getAnalytics = (token) =>
  apiRequest("/admin/analytics", "GET", null, token);

export const getMonthlyTrend = (token) =>
  apiRequest("/admin/monthly-trend", "GET", null, token);

export const getEligibleCandidates = (token) =>
  apiRequest("/admin/eligible-candidates", "GET", null, token);

export const sendToRecruiter = (candidates, token) =>
  apiRequest(
    "/admin/send-to-recruiter",
    "POST",
    candidates,
    token
  );

/* ================= RECRUITER ================= */

export const getRecruiterCandidates = (token) =>
  apiRequest("/recruiter/candidates", "GET", null, token);

export const getRecruiterPipeline = (token) =>
  apiRequest("/recruiter/pipeline", "GET", null, token);

export const updateCandidateStatus = (
  candidateId,
  status,
  token
) =>
  apiRequest(
    `/recruiter/candidates/${candidateId}/status`,
    "PATCH",
    { status },
    token
  );

export const updateCandidateNotes = (
  candidateId,
  notes,
  token
) =>
  apiRequest(
    `/recruiter/candidates/${candidateId}/notes`,
    "PATCH",
    { notes },
    token
  );

export const sendInterviewCall = (
  candidateId,
  token
) =>
  apiRequest(
    `/recruiter/candidates/${candidateId}/interview-call`,
    "POST",
    null,
    token
  );