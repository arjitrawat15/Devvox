from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import AuthProvider, User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7

security = HTTPBearer()


def create_jwt(user_id: UUID, provider: str) -> str:
    payload = {
        "sub": str(user_id),
        "provider": provider,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_jwt(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def _get_or_create_user(
    db: AsyncSession,
    provider: AuthProvider,
    provider_id: str,
    email: str,
    name: str,
    avatar_url: str | None,
    github_username: str | None,
) -> User:
    result = await db.execute(
        select(User).where(
            User.provider == provider,
            User.provider_id == provider_id,
        )
    )
    user = result.scalar_one_or_none()
    if user:
        user.email = email
        user.name = name
        user.avatar_url = avatar_url
        if github_username:
            user.github_username = github_username
        await db.commit()
        await db.refresh(user)
        return user

    user = User(
        provider=provider,
        provider_id=provider_id,
        email=email,
        name=name,
        avatar_url=avatar_url,
        github_username=github_username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ── GitHub OAuth ──────────────────────────────────────

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


@router.get("/github")
async def github_login():
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": f"{settings.frontend_url}/auth/callback?provider=github",
        "scope": "read:user user:email",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GITHUB_AUTH_URL}?{query}")


@router.get("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(400, "Failed to get GitHub access token")

        headers = {"Authorization": f"Bearer {access_token}"}

        # Fetch user profile
        user_resp = await client.get(GITHUB_USER_URL, headers=headers)
        user_data = user_resp.json()

        # Fetch email if not public
        email = user_data.get("email")
        if not email:
            emails_resp = await client.get(GITHUB_EMAILS_URL, headers=headers)
            emails = emails_resp.json()
            primary = next((e for e in emails if e.get("primary")), None)
            email = primary["email"] if primary else f"{user_data['login']}@github.noemail"

    user = await _get_or_create_user(
        db=db,
        provider=AuthProvider.github,
        provider_id=str(user_data["id"]),
        email=email,
        name=user_data.get("name") or user_data["login"],
        avatar_url=user_data.get("avatar_url"),
        github_username=user_data["login"],
    )

    token = create_jwt(user.id, "github")
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")


# ── Google OAuth ──────────────────────────────────────

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/google")
async def google_login():
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": f"{settings.frontend_url}/auth/callback?provider=google",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{settings.frontend_url}/auth/callback?provider=google",
            },
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(400, "Failed to get Google access token")

        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_data = user_resp.json()

    user = await _get_or_create_user(
        db=db,
        provider=AuthProvider.google,
        provider_id=str(user_data["id"]),
        email=user_data["email"],
        name=user_data.get("name") or user_data["email"],
        avatar_url=user_data.get("picture"),
        github_username=None,
    )

    token = create_jwt(user.id, "google")
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")


# ── Me endpoint ───────────────────────────────────────

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "provider": user.provider.value,
        "github_username": user.github_username,
    }
