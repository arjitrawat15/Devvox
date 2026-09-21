import json

from google import genai

from app.config import settings
from app.models import Message

RESULT_PROMPT = """
You are an expert evaluator. Your job is to evaluate the users interview. Give them a score out of 10
and also let them know any feedback you have about their interview.

Please return only a json which looks like this -
{
    "feedback": "string",
    "score": number
}

DO NOT RETURN ANY OTHER TEXT
{user_transcript}
"""


async def calculate_result(messages: list[Message]) -> dict:
    client = genai.Client(api_key=settings.gemini_api_key)

    transcript = json.dumps(
        [
            {
                "type": m.type.value,
                "message": m.message,
                "createdAt": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=RESULT_PROMPT.format(user_transcript=transcript),
        config={
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "feedback": {"type": "string"},
                    "score": {"type": "integer"},
                },
                "required": ["feedback", "score"],
            },
        },
    )

    return json.loads(response.text)
