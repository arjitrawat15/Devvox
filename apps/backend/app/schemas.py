from datetime import datetime
from pydantic import BaseModel


class PreInterviewRequest(BaseModel):
    github: str


class PreInterviewResponse(BaseModel):
    id: str


class UserResponseRequest(BaseModel):
    message: str


class TranscriptItem(BaseModel):
    type: str
    content: str
    createdAt: datetime


class ResultResponse(BaseModel):
    score: int
    feedback: str | None
    transcript: list[TranscriptItem]
    status: str


class DashboardStats(BaseModel):
    total_interviews: int
    average_score: float
    best_score: int
    current_streak: int


class DashboardInterview(BaseModel):
    id: str
    date: datetime
    score: int
    status: str
    feedback: str | None
    github_metadata: dict | None


class DashboardResponse(BaseModel):
    stats: DashboardStats
    interviews: list[DashboardInterview]
