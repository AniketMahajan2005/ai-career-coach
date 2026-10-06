from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    email: str


# ─── Analysis ────────────────────────────────────────────────────────────────

class SkillGap(BaseModel):
    missing_skills: List[str]
    matching_skills: List[str]
    suggestions: List[str]


class AnalysisResponse(BaseModel):
    fit_score: int                  # 0–100
    summary: str
    skill_gap: SkillGap
    interview_topics: List[str]     # used by WebSocket interview session
    created_at: datetime = datetime.utcnow()


class AnalysisRecord(BaseModel):
    user_email: str
    job_description: str
    resume_text: str
    result: AnalysisResponse
    created_at: datetime = datetime.utcnow()


# ─── Interview ────────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    question: str
    category: str       # e.g. "Technical", "Behavioural", "Role-specific"
    difficulty: str     # "Easy" | "Medium" | "Hard"
