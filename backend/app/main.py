from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import structlog

from app.core.config import settings
from app.core.redis import init_redis_pool, close_redis_pool, ping
from app.middlewares.logging_middleware import StructlogMiddleware

# Structlog configuration
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis_pool()
    yield
    # Shutdown
    await close_redis_pool()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Middleware
app.add_middleware(StructlogMiddleware)

# API Router setup
api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
async def health_check():
    redis_status = await ping()
    return {
        "status": "ok",
        "version": settings.VERSION,
        "redis_connected": redis_status
    }

# Placeholders for future routers
# api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

app.include_router(api_router, prefix="/v1")
