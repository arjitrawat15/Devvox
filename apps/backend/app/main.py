import asyncio
import json

import httpx
from fastapi import Depends, FastAPI, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import decode_jwt
from app.auth import router as auth_router
from app.config import settings
from app.dashboard import router as dashboard_router
from app.database import get_db
from app.models import Interview, InterviewStatus, Message, MessageType
from app.result import calculate_result
from app.schemas import (
    PreInterviewRequest,
    PreInterviewResponse,
    ResultResponse,
    TranscriptItem,
    UserResponseRequest,
)
from app.scrapers.github import scrape_github
from app.sideband import init_sideband

app = FastAPI()

app.include_router(auth_router)
app.include_router(dashboard_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/pre-interview", response_model=PreInterviewResponse)
async def pre_interview(body: PreInterviewRequest, db: AsyncSession = Depends(get_db), authorization: str | None = Header(None)):
    github_url = body.github.rstrip("/")
    github_username = github_url.split("/")[-1]

    github_data = await scrape_github(github_username)

    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            payload = decode_jwt(authorization.split(" ")[1])
            user_id = payload.get("sub")
        except Exception:
            pass

    interview = Interview(
        github_metadata=json.dumps(github_data),
        status=InterviewStatus.Pre,
        user_id=user_id,
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    return PreInterviewResponse(id=str(interview.id))


@app.post("/api/v1/session/{interview_id}")
async def create_session(interview_id: str, request: Request):
    sdp_offer = (await request.body()).decode("utf-8")

    session_config = json.dumps(
        {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {"output": {"voice": "marin"}},
        }
    )

    async with httpx.AsyncClient() as client:
        files = {
            "sdp": (None, sdp_offer),
            "session": (None, session_config),
        }
        response = await client.post(
            "https://api.openai.com/v1/realtime/calls",
            files=files,
            headers={
                "Authorization": f"Bearer {settings.openai_key}",
                "OpenAI-Safety-Identifier": "hashed-user-id",
            },
        )

    location = response.headers.get("location", "")
    call_id = location.split("/")[-1]

    asyncio.create_task(init_sideband(call_id, interview_id))

    sdp_answer = response.text
    return Response(content=sdp_answer, media_type="application/sdp")


@app.post("/api/v1/session/user/response/{interview_id}", status_code=200)
async def save_user_response(
    interview_id: str,
    body: UserResponseRequest,
    db: AsyncSession = Depends(get_db),
):
    message = Message(
        interview_id=interview_id,
        type=MessageType.User,
        message=body.message,
    )
    db.add(message)
    await db.commit()
    return {"message": "Message saved"}


@app.get("/api/v1/result/{interview_id}", response_model=ResultResponse)
async def get_result(interview_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Interview)
        .where(Interview.id == interview_id)
        .options(selectinload(Interview.conversations))
    )
    interview = result.scalar_one_or_none()

    if not interview:
        return Response(
            content=json.dumps({"message": "Interview not found"}),
            status_code=411,
            media_type="application/json",
        )

    transcript = [
        TranscriptItem(
            type=c.type.value,
            content=c.message,
            createdAt=c.created_at,
        )
        for c in interview.conversations
    ]

    response = ResultResponse(
        score=interview.score,
        feedback=interview.feedback,
        transcript=transcript,
        status=interview.status.value,
    )

    if interview.status != InterviewStatus.Done:
        calc = await calculate_result(interview.conversations)
        interview.status = InterviewStatus.Done
        interview.feedback = calc["feedback"]
        interview.score = calc["score"]
        await db.commit()

    return response
