import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import Interview, InterviewStatus, User
from app.schemas import DashboardInterview, DashboardResponse, DashboardStats

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


def _calculate_streak(interviews: list[Interview]) -> int:
    """Count consecutive interviews (most recent first) with score >= 5, max 14-day gap."""
    if not interviews:
        return 0

    sorted_interviews = sorted(
        [i for i in interviews if i.status == InterviewStatus.Done],
        key=lambda i: i.created_at,
        reverse=True,
    )

    streak = 0
    prev_date = None
    for interview in sorted_interviews:
        if interview.score < 5:
            break
        if prev_date and (prev_date - interview.created_at).days > 14:
            break
        streak += 1
        prev_date = interview.created_at

    return streak


def _parse_github_metadata(raw) -> dict | None:
    if raw is None:
        return None
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return None
    if isinstance(raw, dict):
        return raw
    return None


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == user.id)
        .order_by(Interview.created_at.desc())
    )
    interviews = list(result.scalars().all())

    done_interviews = [i for i in interviews if i.status == InterviewStatus.Done]
    total = len(done_interviews)
    avg_score = round(sum(i.score for i in done_interviews) / total, 1) if total > 0 else 0.0
    best_score = max((i.score for i in done_interviews), default=0)
    streak = _calculate_streak(interviews)

    stats = DashboardStats(
        total_interviews=total,
        average_score=avg_score,
        best_score=best_score,
        current_streak=streak,
    )

    interview_list = [
        DashboardInterview(
            id=str(i.id),
            date=i.created_at,
            score=i.score,
            status=i.status.value,
            feedback=i.feedback,
            github_metadata=_parse_github_metadata(i.github_metadata),
        )
        for i in interviews
    ]

    return DashboardResponse(stats=stats, interviews=interview_list)
