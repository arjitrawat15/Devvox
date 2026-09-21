import asyncio
import json

import websockets
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.models import Interview, Message, MessageType


async def init_sideband(call_id: str, interview_id: str) -> None:
    async with async_session() as session:
        result = await session.execute(
            select(Interview).where(Interview.id == interview_id)
        )
        interview = result.scalar_one_or_none()

    url = f"wss://api.openai.com/v1/realtime?call_id={call_id}"
    headers = {"Authorization": f"Bearer {settings.openai_key}"}

    async with websockets.connect(url, additional_headers=headers) as ws:
        session_update = {
            "type": "session.update",
            "session": {
                "type": "realtime",
                "instructions": (
                    "You are supposed to interview this user on their computer science intellect. "
                    "Ask around 2-3 questions based on their experience. "
                    "Please use english only during the interview.\n"
                    "Here is everything about the users github, will give you a rough idea about what the user does -\n"
                    "## Github metadata\n"
                    f"{interview.github_metadata if interview else '{}'}"
                ),
            },
        }
        await ws.send(json.dumps(session_update))

        async for raw_message in ws:
            parsed = json.loads(raw_message)
            if parsed.get("type") == "response.done":
                contents = []
                for output in parsed["response"]["output"]:
                    contents.extend(output.get("content", []))

                assistant_message = " ".join(
                    c["transcript"]
                    for c in contents
                    if c.get("type") == "output_audio"
                )

                if assistant_message:
                    async with async_session() as session:
                        session.add(
                            Message(
                                interview_id=interview_id,
                                type=MessageType.Assistant,
                                message=assistant_message,
                            )
                        )
                        await session.commit()
