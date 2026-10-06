import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.core.security import decode_token
from app.services.groq_service import generate_interview_questions

router = APIRouter(tags=["Interview"])


@router.websocket("/ws/interview")
async def interview_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    topics: str = Query(...),
    job_description: str = Query(...),
):
    # browser websockets can't set auth headers, so the token comes in the query
    email = decode_token(token)
    if not email:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await websocket.accept()

    try:
        topic_list = [t.strip() for t in topics.split(",") if t.strip()]

        await websocket.send_json({"type": "status", "message": "Generating interview questions..."})

        questions = await generate_interview_questions(topic_list, job_description)

        for i, q in enumerate(questions):
            await websocket.send_json({
                "type": "question",
                "index": i + 1,
                "total": len(questions),
                "question": q.question,
                "category": q.category,
                "difficulty": q.difficulty,
            })
            await asyncio.sleep(0.6)

        await websocket.send_json({"type": "done", "message": "All questions delivered"})

    except WebSocketDisconnect:
        print(f"Client {email} disconnected from interview session")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        await websocket.close()
