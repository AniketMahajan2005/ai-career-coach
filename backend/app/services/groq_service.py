import json
import re
from groq import AsyncGroq
from app.core.config import settings
from app.models.schemas import AnalysisResponse, SkillGap, InterviewQuestion

client = AsyncGroq(api_key=settings.GROQ_API_KEY)
MODEL = "openai/gpt-oss-120b"


async def analyze_resume(resume_text: str, job_description: str) -> AnalysisResponse:
    """Send resume + JD to Groq and parse structured response."""

    prompt = f"""
You are an expert career coach and technical recruiter.

Analyze the following resume against the job description and return a JSON object with EXACTLY this structure (no markdown, no extra text — raw JSON only):

{{
  "fit_score": <integer 0-100>,
  "summary": "<2-3 sentence summary of candidate fit>",
  "skill_gap": {{
    "matching_skills": ["<skill1>", "<skill2>"],
    "missing_skills": ["<skill1>", "<skill2>"],
    "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>"]
  }},
  "interview_topics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>", "<topic5>"]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    data = json.loads(raw)

    return AnalysisResponse(
        fit_score=data["fit_score"],
        summary=data["summary"],
        skill_gap=SkillGap(**data["skill_gap"]),
        interview_topics=data["interview_topics"],
    )


async def generate_interview_questions(
    topics: list[str], job_description: str
) -> list[InterviewQuestion]:
    """Generate a list of interview questions based on topics from the analysis."""

    prompt = f"""
You are a senior technical interviewer.

Based on these interview topics and the job description below, generate exactly 10 interview questions.
Return a JSON array (no markdown, raw JSON only) like this:

[
  {{
    "question": "<full interview question>",
    "category": "<Technical | Behavioural | Role-specific>",
    "difficulty": "<Easy | Medium | Hard>"
  }}
]

TOPICS: {', '.join(topics)}

JOB DESCRIPTION:
{job_description}
"""

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    questions_data = json.loads(raw)
    return [InterviewQuestion(**q) for q in questions_data]
