# AI Career Coach

Full-stack AI-powered career assistant — resume analysis, skill gap detection, and real-time interview prep.

**Stack:** Python · FastAPI · React.js (Vite) · MongoDB Atlas · Groq API · WebSocket · JWT · Docker

---

## Features

- **Resume analysis** — Upload a PDF resume + paste a job description → get a fit score (0–100), matching/missing skills, and improvement suggestions
- **Real-time interview questions** — WebSocket-powered session delivers tailored questions one by one based on your analysis topics
- **JWT auth** — Register/login with tokens stored in localStorage; all protected routes require a valid token
- **Session history** — Last 10 analyses saved to MongoDB and queryable

---

## Local Setup

### 1. Clone and set up backend

```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI, SECRET_KEY, and GROQ_API_KEY in .env

python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

### 2. Set up frontend

```bash
cd frontend
cp .env.example .env            # defaults point to localhost:8000
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Docker (full stack)

```bash
# Create backend/.env with real values first
docker-compose up --build
```

- Frontend → http://localhost:80  
- Backend  → http://localhost:8000

---

## Environment Variables

### backend/.env

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (default: `ai_career_coach`) |
| `SECRET_KEY` | Random string for JWT signing |
| `GROQ_API_KEY` | Get from https://console.groq.com |

### frontend/.env

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend HTTP URL |
| `VITE_WS_URL` | Backend WebSocket URL (`ws://` or `wss://`) |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get JWT |
| POST | `/analyze/` | Yes | Upload resume + JD → analysis |
| GET | `/analyze/history` | Yes | Last 10 analyses |
| WS | `/ws/interview` | Token query param | Real-time interview questions |
| GET | `/health` | No | Health check |

---

## Project Structure

```
ai-career-coach/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database, security
│   │   ├── models/        # Pydantic schemas
│   │   ├── routers/       # auth, analyze, interview (WebSocket)
│   │   └── services/      # groq_service, pdf_service, auth_service
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         # AuthPage, Dashboard, InterviewPage
│   │   ├── context/       # AuthContext (JWT management)
│   │   └── services/      # axios instance with auth interceptor
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```
