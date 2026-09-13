from datetime import datetime, timedelta
import hashlib
import os
import sqlite3
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field


SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_CHANGE_THIS")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DB_NAME = os.getenv("DB_NAME", "placement.db")
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

app = FastAPI(title="AI Recruitment Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def column_exists(cur, table: str, column: str) -> bool:
    cur.execute(f"PRAGMA table_info({table})")
    return any(row["name"] == column for row in cur.fetchall())


def add_column_if_missing(cur, table: str, column: str, ddl: str):
    if not column_exists(cur, table, column):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


def init_db():
    conn = get_db()
    cur = conn.cursor()

    # Users table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # If using an old database, automatically add the column
    try:
        add_column_if_missing(cur, "users", "created_at", "TEXT DEFAULT CURRENT_TIMESTAMP")
    except:
        pass

    # Predictions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS predictions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        cgpa REAL NOT NULL,
        skills TEXT NOT NULL,
        probability INTEGER NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    add_column_if_missing(cur, "predictions", "job_role", "TEXT DEFAULT 'Software Engineer'")
    add_column_if_missing(cur, "predictions", "ats_score", "INTEGER DEFAULT 0")
    add_column_if_missing(cur, "predictions", "resume_name", "TEXT")

    # Recruiter table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS recruiter_candidates(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_id INTEGER,
        recruiter_username TEXT,
        student_username TEXT NOT NULL,
        job_role TEXT NOT NULL,
        skills TEXT NOT NULL,
        probability INTEGER NOT NULL,
        ats_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'shortlisted',
        notes TEXT DEFAULT '',
        interview_sent INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

init_db()


class RegisterModel(BaseModel):
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    role: str


class LoginModel(BaseModel):
    username: str
    password: str


class PredictModel(BaseModel):
    cgpa: float = Field(ge=0, le=10)
    skills: List[str]
    job_role: str = Field(min_length=2, max_length=80)


class DispatchModel(BaseModel):
    candidate_ids: List[int] = []
    recruiter_username: Optional[str] = None


class StatusModel(BaseModel):
    status: str


class NotesModel(BaseModel):
    notes: str = Field(max_length=800)


def hash_password(password: str):
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def verify_password(password: str, hashed: str):
    if hashed.startswith("pbkdf2_sha256$"):
        _, salt, digest = hashed.split("$", 2)
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000).hex()
        return check == digest
    return hashlib.sha256(password.encode()).hexdigest() == hashed


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub") or not payload.get("role"):
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(role: str):
    def checker(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Access denied")
        return user

    return checker


def score_resume_text(text: str, skills: List[str]) -> int:
    lower = text.lower()
    keywords = [
        "project",
        "internship",
        "certification",
        "github",
        "leadership",
        "api",
        "database",
        "cloud",
        "machine learning",
        "analytics",
    ]
    keyword_score = sum(1 for word in keywords if word in lower) * 5
    skill_score = min(35, len([s for s in skills if s.strip()]) * 5)
    return min(100, 30 + keyword_score + skill_score)


def candidate_from_row(row):
    return {
        "id": row["id"],
        "prediction_id": row["prediction_id"],
        "student_username": row["student_username"],
        "job_role": row["job_role"],
        "skills": [s.strip() for s in row["skills"].split(",") if s.strip()],
        "probability": row["probability"],
        "ats_score": row["ats_score"],
        "status": row["status"],
        "notes": row["notes"] or "",
        "interview_sent": bool(row["interview_sent"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "recruitment-intelligence"}

@app.post("/register")
def register(data: RegisterModel):
    role = data.role.lower()

    if role not in {"student", "admin", "recruiter"}:
        raise HTTPException(
            status_code=400,
            detail="Role must be student, admin, or recruiter"
        )

    conn = get_db()
    cur = conn.cursor()

    # Check existing user
    cur.execute(
        "SELECT username FROM users WHERE username=?",
        (data.username,)
    )

    if cur.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Insert new user
    cur.execute(
        """
        INSERT INTO users(username, password, role, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            data.username.strip(),
            hash_password(data.password),
            role,
            datetime.utcnow().isoformat()
        ),
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Registration successful",
        "username": data.username,
        "role": role,
    }

@app.post("/login")
def login(data: LoginModel):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT password, role FROM users WHERE username=?", (data.username,))
    row = cur.fetchone()
    conn.close()

    if not row or not verify_password(data.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": data.username, "role": row["role"]})
    return {"access_token": token, "role": row["role"], "username": data.username}


@app.post("/predict")
def predict(data: PredictModel, user=Depends(require_role("student"))):
    clean_skills = [skill.strip() for skill in data.skills if skill.strip()]
    role_bonus = 8 if any(word in data.job_role.lower() for word in ["engineer", "developer", "analyst"]) else 2
    probability = min(100, int(data.cgpa * 8 + len(clean_skills) * 4 + role_bonus))
    ats_score = min(100, int(probability * 0.7 + len(clean_skills) * 3))

    required_skills = {
        "software": {"python", "react", "sql", "api"},
        "data": {"python", "sql", "machine learning", "excel"},
        "frontend": {"react", "javascript", "css", "html"},
        "backend": {"python", "fastapi", "sql", "api"},
    }
    role_key = next((key for key in required_skills if key in data.job_role.lower()), "software")
    skill_gap = sorted(required_skills[role_key] - {s.lower() for s in clean_skills})

    conn = get_db()
    cur = conn.cursor()
    created_at = datetime.utcnow().isoformat()

    cur.execute(
        """
        INSERT INTO predictions(username,cgpa,skills,probability,created_at,job_role,ats_score)
        VALUES (?,?,?,?,?,?,?)
        """,
        (user["sub"], data.cgpa, ",".join(clean_skills), probability, created_at, data.job_role, ats_score),
    )
    prediction_id = cur.lastrowid

    if probability >= 70:
        cur.execute(
            """
            INSERT INTO recruiter_candidates(
                prediction_id, student_username, job_role, skills, probability,
                ats_score, status, created_at, updated_at
            )
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            (
                prediction_id,
                user["sub"],
                data.job_role,
                ",".join(clean_skills),
                probability,
                ats_score,
                "shortlisted",
                created_at,
                created_at,
            ),
        )

    conn.commit()
    conn.close()

    return {
        "placement_probability": probability,
        "ats_score": ats_score,
        "skill_gap": skill_gap,
        "recommended_companies": ["Google", "Microsoft", "Amazon"] if probability >= 80 else ["TCS", "Infosys", "Accenture"],
        "ai_roadmap": [
            f"Build one portfolio project for {data.job_role}",
            "Add measurable resume bullets with project outcomes",
            "Prepare system design and behavioral interview stories",
        ],
    }


@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...), user=Depends(require_role("student"))):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    inferred_skills = [
        skill
        for skill in ["Python", "React", "SQL", "FastAPI", "Machine Learning", "Excel", "JavaScript", "Cloud"]
        if skill.lower() in text.lower()
    ]
    ats_score = score_resume_text(text, inferred_skills)

    return {
        "filename": file.filename,
        "ats_score": ats_score,
        "extracted_skills": inferred_skills,
        "suggestions": [
            "Quantify project impact with numbers",
            "Add role-specific keywords from the job description",
            "Keep sections consistent: summary, skills, projects, education",
        ],
    }


@app.get("/history")
def history(user=Depends(require_role("student"))):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, cgpa, skills, probability, created_at, job_role, ats_score
        FROM predictions
        WHERE username=?
        ORDER BY id DESC
        """,
        (user["sub"],),
    )

    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "cgpa": row["cgpa"],
            "skills": row["skills"],
            "probability": row["probability"],
            "date": row["created_at"],
            "job_role": row["job_role"],
            "ats_score": row["ats_score"],
        }
        for row in rows
    ]


@app.get("/admin/analytics")
def analytics(user=Depends(require_role("admin"))):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(DISTINCT username) AS total FROM predictions")
    total = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(DISTINCT username) AS eligible FROM predictions WHERE probability >= 70")
    eligible = cur.fetchone()["eligible"]

    cur.execute("SELECT COUNT(*) AS active FROM users WHERE role='recruiter'")
    recruiters = cur.fetchone()["active"]

    cur.execute("SELECT COUNT(*) AS shortlisted FROM recruiter_candidates WHERE status='shortlisted'")
    shortlisted = cur.fetchone()["shortlisted"]

    cur.execute("SELECT job_role, COUNT(*) AS count FROM predictions GROUP BY job_role ORDER BY count DESC LIMIT 6")
    departments = [{"name": row["job_role"], "value": row["count"]} for row in cur.fetchall()]

    conn.close()

    return {
        "total_candidates": total,
        "eligible_candidates": eligible,
        "active_recruiters": recruiters,
        "shortlisted": shortlisted,
        "success_ratio": round((eligible / total) * 100) if total else 0,
        "department_distribution": departments,
    }


@app.get("/admin/monthly-trend")
def monthly_trend(user=Depends(require_role("admin"))):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT substr(created_at, 1, 7) AS month,
               COUNT(*) AS total,
               SUM(CASE WHEN probability >= 70 THEN 1 ELSE 0 END) AS eligible
        FROM predictions
        GROUP BY month
        ORDER BY month ASC
        LIMIT 12
        """
    )

    rows = cur.fetchall()
    conn.close()

    return [
        {
            "month": row["month"],
            "total": row["total"],
            "eligible": row["eligible"] or 0,
        }
        for row in rows
    ]


@app.get("/admin/eligible-candidates")
def eligible_candidates(user=Depends(require_role("admin"))):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, username, job_role, skills, probability, ats_score, created_at
        FROM predictions
        WHERE probability >= 70
        ORDER BY probability DESC, ats_score DESC
        """
    )
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "student_username": row["username"],
            "job_role": row["job_role"],
            "skills": [s.strip() for s in row["skills"].split(",") if s.strip()],
            "probability": row["probability"],
            "ats_score": row["ats_score"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


@app.post("/admin/send-to-recruiter")
def send_to_recruiter(data: DispatchModel, user=Depends(require_role("admin"))):
    conn = get_db()
    cur = conn.cursor()

    if data.candidate_ids:
        placeholders = ",".join("?" for _ in data.candidate_ids)
        cur.execute(
            f"""
            SELECT id, username, job_role, skills, probability, ats_score, created_at
            FROM predictions
            WHERE id IN ({placeholders})
            """,
            data.candidate_ids,
        )
    else:
        cur.execute(
            """
            SELECT id, username, job_role, skills, probability, ats_score, created_at
            FROM predictions
            WHERE probability >= 70
            """
        )

    rows = cur.fetchall()
    now = datetime.utcnow().isoformat()
    dispatched = 0

    for row in rows:
        cur.execute("SELECT id FROM recruiter_candidates WHERE prediction_id=?", (row["id"],))
        if cur.fetchone():
            continue
        cur.execute(
            """
            INSERT INTO recruiter_candidates(
                prediction_id, recruiter_username, student_username, job_role,
                skills, probability, ats_score, status, created_at, updated_at
            )
            VALUES (?,?,?,?,?,?,?,?,?,?)
            """,
            (
                row["id"],
                data.recruiter_username,
                row["username"],
                row["job_role"],
                row["skills"],
                row["probability"],
                row["ats_score"],
                "shortlisted",
                now,
                now,
            ),
        )
        dispatched += 1

    conn.commit()
    conn.close()
    return {"status": "dispatched", "count": dispatched}


@app.get("/recruiter/candidates")
def recruiter_candidates(user=Depends(require_role("recruiter"))):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT *
        FROM recruiter_candidates
        WHERE recruiter_username IS NULL OR recruiter_username=? OR recruiter_username=''
        ORDER BY probability DESC, ats_score DESC, updated_at DESC
        """,
        (user["sub"],),
    )
    rows = cur.fetchall()
    conn.close()
    return [candidate_from_row(row) for row in rows]


@app.get("/recruiter/pipeline")
def recruiter_pipeline(user=Depends(require_role("recruiter"))):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT status, COUNT(*) AS count
        FROM recruiter_candidates
        WHERE recruiter_username IS NULL OR recruiter_username=? OR recruiter_username=''
        GROUP BY status
        """,
        (user["sub"],),
    )
    rows = cur.fetchall()
    conn.close()
    return [{"status": row["status"], "count": row["count"]} for row in rows]


@app.patch("/recruiter/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: int, data: StatusModel, user=Depends(require_role("recruiter"))):
    status = data.status.lower()
    if status not in {"shortlisted", "interview", "hired", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE recruiter_candidates
        SET status=?, recruiter_username=COALESCE(recruiter_username, ?), updated_at=?
        WHERE id=? AND (recruiter_username IS NULL OR recruiter_username=? OR recruiter_username='')
        """,
        (status, user["sub"], datetime.utcnow().isoformat(), candidate_id, user["sub"]),
    )
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    conn.commit()
    conn.close()
    return {"status": "updated"}


@app.patch("/recruiter/candidates/{candidate_id}/notes")
def update_candidate_notes(candidate_id: int, data: NotesModel, user=Depends(require_role("recruiter"))):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE recruiter_candidates
        SET notes=?, recruiter_username=COALESCE(recruiter_username, ?), updated_at=?
        WHERE id=? AND (recruiter_username IS NULL OR recruiter_username=? OR recruiter_username='')
        """,
        (data.notes, user["sub"], datetime.utcnow().isoformat(), candidate_id, user["sub"]),
    )
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    conn.commit()
    conn.close()
    return {"status": "saved"}


@app.post("/recruiter/candidates/{candidate_id}/interview-call")
def send_interview_call(candidate_id: int, user=Depends(require_role("recruiter"))):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE recruiter_candidates
        SET interview_sent=1, status='interview',
            recruiter_username=COALESCE(recruiter_username, ?), updated_at=?
        WHERE id=? AND (recruiter_username IS NULL OR recruiter_username=? OR recruiter_username='')
        """,
        (user["sub"], datetime.utcnow().isoformat(), candidate_id, user["sub"]),
    )
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    conn.commit()
    conn.close()
    return {"status": "interview_call_sent"}
@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "application": "AI Recruitment Intelligence Platform",
        "version": "1.0.0",
        "time": datetime.utcnow().isoformat(),
        "routes": {
            "register": "/register",
            "login": "/login",
            "predict": "/predict",
            "analytics": "/admin/analytics",
            "recruiter": "/recruiter/candidates"
        }
    }