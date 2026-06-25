import enum
import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.user import Base


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewing = "reviewing"
    shortlisted = "shortlisted"
    interview = "interview"
    rejected = "rejected"
    hired = "hired"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=ApplicationStatus.applied.value
    )
    overall_score: Mapped[float] = mapped_column(Float, nullable=True)
    experience_score: Mapped[float] = mapped_column(Float, nullable=True)
    skills_score: Mapped[float] = mapped_column(Float, nullable=True)


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("job_id", "candidate_id", name="uq_job_candidate"),
    )

    # Relationships
    job: Mapped["Job"] = relationship("Job", backref="applications")  # type: ignore[name-defined]
    candidate: Mapped["User"] = relationship("User", backref="applications")  # type: ignore[name-defined]
    resume: Mapped["Resume"] = relationship("Resume", backref="applications")  # type: ignore[name-defined]
