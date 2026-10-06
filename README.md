# AI Career Coach

A web app that compares a resume against a job description and then runs a mock interview over a WebSocket. You upload a PDF resume, paste a job description, and get a fit score, the skills you match and the ones you're missing, and a few suggestions. From there you can generate interview questions based on the analysis.

Stack: Python, FastAPI, React (Vite), MongoDB Atlas, Groq API, WebSocket, JWT, Docker.

## What it does

- Resume analysis: fit score from 0 to 100, matching and missing skills, and suggestions
- Interview questions streamed one at a time over a WebSocket, based on the topics from the analysis
- Register and login with JWT. The token is kept in localStorage and every protected route needs it
- The last 10 analyses are saved in MongoDB and available through the history endpoint

## Running locally

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` with `MONGODB_URI`, `SECRET_KEY` and `GROQ_API_KEY` (see the table below), then:

```bash
uvicorn app.main:app --reload
```

The API runs on http://localhost:8000 and the Swagger docs are at http://localhost:8000/docs.

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs on http://localhost:5173.

## Docker

Create `backend/.env` first, then:

```bash
docker-compose up --build
```

The frontend is served on http://localhost:80 and the backend on http://localhost:8000.

## Environment variables

`backend/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name, defaults to `ai_career_coach` |
| `SECRET_KEY` | Secret used to sign the JWTs |
| `GROQ_API_KEY` | API key from https://console.groq.com |

`frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend HTTP URL |
| `VITE_WS_URL` | Backend WebSocket URL (`ws://` or `wss://`) |

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create an account |
| POST | `/auth/login` | No | Log in and get a JWT |
| POST | `/analyze/` | Yes | Upload a resume and job description, get the analysis |
| GET | `/analyze/history` | Yes | Last 10 analyses |
| WS | `/ws/interview` | Token in query string | Interview questions |
| GET | `/health` | No | Health check |

## Project structure

```
ai-career-coach/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database, security
│   │   ├── models/        # pydantic schemas
│   │   ├── routers/       # auth, analyze, interview (websocket)
│   │   └── services/      # groq_service, pdf_service, auth_service
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         # AuthPage, Dashboard, InterviewPage
│   │   ├── context/       # AuthContext
│   │   └── services/      # axios instance
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```
