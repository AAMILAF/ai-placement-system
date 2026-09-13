# AI Placement System

An AI-powered placement and recruitment platform designed to help students assess their placement readiness, analyze resumes, improve employability, discover relevant job opportunities, and connect with recruiters.

---

## 🚀 Overview

The **AI Placement System** is a full-stack web application that brings students, recruiters, and administrators together on a single platform.

The system combines resume analysis, ATS evaluation, placement prediction, career roadmap generation, job recommendations, company matching, notifications, and recruitment management.

The platform is designed to help students understand their current placement readiness and identify the skills and improvements required to become job-ready.

---

## ✨ Features

### 👨‍🎓 Student Portal

- Secure student registration and login
- Student profile management
- Resume upload
- Resume parsing
- ATS score analysis
- Resume feedback
- AI-based placement prediction
- Placement prediction history
- Personalized career roadmap
- Skill improvement recommendations
- Course and certification suggestions
- Job recommendations
- Company matching
- Job application workflow
- Application tracking
- Notifications

### 🧑‍💼 Recruiter Portal

- Secure recruiter authentication
- Recruiter dashboard
- Candidate discovery
- Candidate profile review
- Candidate information management
- Candidate pipeline management
- Candidate status updates
- Recruiter notes
- Interview call management
- Recruitment workflow management

### 👨‍💻 Admin Portal

- Secure administrator authentication
- Admin dashboard
- Student analytics
- Placement analytics
- Recruiter analytics
- Candidate analytics
- Recruitment statistics
- Placement trend analysis
- System-level monitoring

---

## 🤖 AI & Machine Learning

The platform integrates Artificial Intelligence and Machine Learning concepts to provide intelligent placement assistance.

### AI capabilities include:

- Placement probability prediction
- Resume intelligence
- ATS scoring
- Skill gap identification
- Career roadmap generation
- Personalized feedback
- Job recommendations
- Company matching
- Career guidance

The AI architecture can be extended with advanced Machine Learning models and Large Language Models as the platform evolves.

---

## 🏗️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Fetch API

### Backend

- Python
- FastAPI
- Pydantic
- SQLite
- REST APIs

### AI / Machine Learning

- Python
- Scikit-learn
- Pandas
- NumPy
- Natural Language Processing
- Machine Learning

### Authentication & Security

- JWT authentication
- Password hashing
- Role-based access control
- Protected routes
- API rate limiting
- Environment-based configuration
- File upload validation

---

## 📁 Project Structure

```text
ai-placement-system/
│
├── backend/
│   ├── models/
│   │   ├── placement_model.py
│   │   ├── recruiter_model.py
│   │   └── user_model.py
│   │
│   ├── routers/
│   │   ├── admin_routes.py
│   │   ├── auth_routes.py
│   │   ├── jobs_routes.py
│   │   ├── notification_routers.py
│   │   ├── profile_routers.py
│   │   ├── recruiter_routes.py
│   │   ├── resume_routes.py
│   │   ├── roadmap_routes.py
│   │   └── student_routes.py
│   │
│   ├── security/
│   │   ├── auth.py
│   │   ├── hashing.py
│   │   ├── permissions.py
│   │   └── rate_limit.py
│   │
│   ├── services/
│   │   ├── ats_service.py
│   │   ├── company_service.py
│   │   ├── feedback_service.py
│   │   ├── job_service.py
│   │   ├── notification_service.py
│   │   ├── prediction_service.py
│   │   ├── resume_service.py
│   │   └── roadmap_service.py
│   │
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── resume_parser.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── PredictionChart.jsx
│   │   │   ├── PredictionResult.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── StudentProfileForm.jsx
│   │   │   ├── ToastProvider.jsx
│   │   │   └── placementchart.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── Register.jsx
│   │   │   └── StudentDashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md


⚙️ Requirements

Before running the project, make sure the following are installed:

Python 3.10 or later
Node.js 18 or later
npm
Git


🔧 Backend Setup
1. Navigate to the backend
cd backend
2. Create a Python virtual environment
Windows
python -m venv .venv

Activate the environment:

.venv\Scripts\activate
Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

3. Install dependencies
pip install -r requirements.txt

4. Configure environment variables

Create a .env file from the provided example.

Windows
copy .env.example .env
Linux / macOS
cp .env.example .env

Configure the required values inside .env.

Example:

SECRET_KEY=change-this-in-production
DATABASE_URL=sqlite:///./placement.db
ACCESS_TOKEN_EXPIRE_MINUTES=30

Never commit real secrets, passwords, API keys, or production credentials to GitHub.

5. Start the backend

Run:

uvicorn main:app

The backend API will normally be available at:

http://127.0.0.1:8000

FastAPI interactive documentation:

http://127.0.0.1:8000/docs

Alternative API documentation:

http://127.0.0.1:8000/redoc


🎨 Frontend Setup

Open a new terminal.

Navigate to the frontend directory:

cd frontend

Install the required packages:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🔐 Environment Variables

Environment variables are used to keep sensitive configuration outside the source code.

The project provides:

backend/.env.example

Create your local .env file from this template.

Example:

SECRET_KEY=change-this-in-production
DATABASE_URL=sqlite:///./placement.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
Security Guidelines

Do not commit:

.env
API keys
passwords
JWT secrets
database credentials
private certificates
production configuration

The .gitignore file is configured to prevent sensitive local files from being committed.

🔄 Student Application Flow
                         STUDENT
                            │
                            ▼
                     Register / Login
                            │
                            ▼
                      Student Profile
                            │
                            ▼
                       Upload Resume
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
            Resume Parsing       ATS Analysis
                  │                   │
                  └─────────┬─────────┘
                            ▼
                  Placement Prediction
                            │
                            ▼
                     Skill Gap Analysis
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              Roadmap     Courses    Feedback
                 │          │          │
                 └──────────┼──────────┘
                            ▼
                  Job Recommendations
                            │
                            ▼
                    Company Matching
                            │
                            ▼
                     Job Application
                            │
                            ▼
                  Application Tracking
🧑‍💼 Recruitment Flow
Recruiter
    │
    ▼
Recruiter Login
    │
    ▼
Recruiter Dashboard
    │
    ▼
View Candidates
    │
    ▼
Review Candidate
    │
    ├── Profile
    ├── Resume
    ├── Skills
    ├── ATS Score
    └── Placement Information
    │
    ▼
Candidate Pipeline
    │
    ├── Shortlisted
    ├── Interview
    ├── Selected
    └── Rejected
📊 Admin Flow
Administrator
      │
      ▼
   Admin Login
      │
      ▼
 Admin Dashboard
      │
      ├── Student Analytics
      │
      ├── Placement Analytics
      │
      ├── Recruiter Analytics
      │
      ├── Candidate Analytics
      │
      └── Recruitment Trends
🛡️ Security

Security is an important component of the platform.

The application includes security mechanisms such as:

JWT-based authentication
Password hashing
Role-based authorization
Protected API endpoints
Protected frontend routes
API rate limiting
Environment-based configuration
File upload validation
Role separation between students, recruiters, and administrators
Production Security Roadmap

Before deploying the application for real-world production use, additional hardening should be performed, including:

PostgreSQL or another production-grade database
Strong password hashing such as Argon2 or bcrypt
Access and refresh token architecture
HTTPS
Strict CORS configuration
Comprehensive audit logging
Database migrations using Alembic
Secure resume/file storage
File type and size validation
Production-grade rate limiting
Secure secret management
Centralized monitoring and logging
Backup and recovery procedures
🧪 Development Status

This project is currently under active development.

Current Modules
 Authentication
 Student registration
 Login
 Role-based access
 Protected routes
 Student dashboard
 Recruiter dashboard
 Admin dashboard
 Placement prediction
 Prediction history
 Resume upload
 Resume parsing
 ATS analysis
 Career roadmap
 Job module
 Company matching
 Notification module
 Student profile module
 Recruiter candidate management
 Admin analytics
🚧 Planned Features

The following features are planned for future development:

 Advanced AI career assistant
 Voice-based career assistant
 AI mock interview system
 Interview performance analysis
 Advanced resume optimization
 Advanced job matching
 Real-time notifications
 Email notifications
 Advanced job application tracking
 Company-wise placement insights
 Skill gap visualization
 Advanced recruiter search
 Recruiter interview scheduling
 PostgreSQL production database
 Alembic database migrations
 Docker support
 CI/CD pipeline
 Production deployment
 Advanced monitoring and logging
 Multi-organization support
🎯 Future Vision

The long-term vision of the project is to create a complete AI-powered career and recruitment ecosystem.

The platform aims to combine:

AI Career Advisor
Resume Analyzer
ATS Checker
Placement Prediction System
Career Roadmap Generator
Job Recommendation Engine
Company Matching System
Student Placement Portal
Recruiter Portal
Campus Recruitment Management System

The overall goal is to help students move through the complete placement journey:

Student
   │
   ▼
Resume Preparation
   │
   ▼
Skill Assessment
   │
   ▼
Placement Prediction
   │
   ▼
Career Guidance
   │
   ▼
Job Matching
   │
   ▼
Application
   │
   ▼
Interview
   │
   ▼
Placement

At the same time, recruiters can use the platform to discover candidates and manage recruitment workflows more efficiently.

🤝 Contributing

Contributions, suggestions, and improvements are welcome.

Getting Started
Fork the repository.
Clone the repository:
git clone https://github.com/AAMILAF/ai-placement-system.git
Navigate to the project:
cd ai-placement-system
Create a feature branch:
git checkout -b feature/your-feature
Make your changes.
Stage your changes:
git add .
Commit your changes:
git commit -m "Add your feature"
Push your branch:
git push origin feature/your-feature
Open a Pull Request on GitHub.
📌 Important Notes

This project is currently under active development and should be considered a development-stage application.

Features, APIs, AI models, database architecture, and security mechanisms may change as development continues.

The current development configuration should not be used directly in a production environment without appropriate security, database, infrastructure, and deployment hardening.

📄 License

This project is licensed under the MIT License.

See the LICENSE file for details.

👩‍💻 Author
Aamila Fathima M

GitHub:

https://github.com/AAMILAF

Project Repository:

https://github.com/AAMILAF/ai-placement-system

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

Suggestions, improvements, and contributions are welcome.
