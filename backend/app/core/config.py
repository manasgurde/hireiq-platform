from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "HireIQ"
    VERSION: str = "2.0.0"

    # Database — runtime uses pooler, migrations use direct connection
    DATABASE_URL: str = "postgresql+asyncpg://hireiq:password@localhost:5432/hireiq_db"
    # Direct (non-pooled) URL for Alembic migrations (bypasses pgbouncer)
    # On Supabase: use port 5432 (direct), not 6543 (pooler)
    DIRECT_DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", "DIRECT_DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET_KEY: str = "super_secret_key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:3000"

    # AWS / S3 (or Cloudflare R2)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = "dummy-bucket"
    S3_ENDPOINT_URL: Optional[str] = None
    S3_PUBLIC_URL_PREFIX: Optional[str] = None

    # ── Phase 7: Vector Search ─────────────────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "models/text-embedding-004"
    EMBEDDING_DIMENSIONS: int = 768

    # ── Phase 10: Email (Resend) ───────────────────────────────────────────
    RESEND_API_KEY: str | None = None
    
    # OAuth
    GOOGLE_CLIENT_ID: str | None = None

    EMAIL_FROM: str = "noreply@hireiq.app"

    # ── Phase 11: Stripe Billing ───────────────────────────────────────────
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRO_PRICE_ID: Optional[str] = None
    STRIPE_ENTERPRISE_PRICE_ID: Optional[str] = None

    # Plan limits
    FREE_JOB_LIMIT: int = 5
    PRO_JOB_LIMIT: int = 50
    # Enterprise = unlimited (None)

    # ── Phase 14: MLflow ──────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "hireiq-matching"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
