from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import List

from app.models.schemas import AnalysisResponse, AnalysisRecord
from app.services.groq_service import analyze_resume
from app.services.pdf_service import extract_text_from_pdf
from app.services.auth_service import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/", response_model=AnalysisResponse)
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    if resume.content_type not in ["application/pdf", "application/octet-stream"]:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await resume.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    result = await analyze_resume(resume_text, job_description)

    db = get_db()
    record = {
        "user_email": current_user["email"],
        "job_description": job_description,
        "resume_text": resume_text[:2000],
        "result": result.model_dump(),
    }
    await db["analyses"].insert_one(record)

    return result


@router.get("/history", response_model=List[dict])
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db["analyses"].find(
        {"user_email": current_user["email"]},
        {"_id": 0, "result": 1, "job_description": 1},
    ).sort("_id", -1).limit(10)

    records = []
    async for doc in cursor:
        records.append(doc)
    return records
