import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship

from app.database import Base


class AuthProvider(str, enum.Enum):
    github = "github"
    google = "google"


class InterviewStatus(str, enum.Enum):
    Pre = "Pre"
    InProgress = "InProgress"
    Done = "Done"


class MessageType(str, enum.Enum):
    User = "User"
    Assistant = "Assistant"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("provider", "provider_id", name="uq_provider_identity"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    provider = Column(Enum(AuthProvider), nullable=False)
    provider_id = Column(String, nullable=False)
    github_username = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    interviews = relationship("Interview", back_populates="user")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_metadata = Column(JSON, nullable=False)
    status = Column(Enum(InterviewStatus), nullable=False, default=InterviewStatus.Pre)
    score = Column(Integer, nullable=False, default=0)
    feedback = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="interviews")
    conversations = relationship(
        "Message", back_populates="interview", cascade="all, delete-orphan",
        order_by="Message.created_at"
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message = Column(Text, nullable=False)
    type = Column(Enum(MessageType), nullable=False)
    interview_id = Column(
        UUID(as_uuid=True), ForeignKey("interviews.id"), nullable=False
    )
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    interview = relationship("Interview", back_populates="conversations")
