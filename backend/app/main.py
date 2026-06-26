from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.core.config import settings
from app.core.redis import init_redis_pool, close_redis_pool, ping
from app.middlewares.logging_middleware import StructlogMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.applications import router as applications_router
# v2.0 routers
from app.api.v1.search import router as search_router
from app.api.v1.recruiter_intel import router as recruiter_intel_router
from app.api.v1.companies import router as companies_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.billing import router as billing_router
from app.api.v1.audit import router as audit_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.ml_ops import router as ml_ops_router
from app.api.v1.files import router as files_router



logger = structlog.get_logger(__name__)

# Structlog configuration
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
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
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Build a list of allowed origins: always include localhost for dev
_cors_origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
# Also allow any *.vercel.app subdomain so preview deployments work
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Middleware
app.add_middleware(StructlogMiddleware)

# ---------------------------------------------------------------------------
# Global Exception Handlers — HIQ-018
# ---------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = [
        {
            "field": ".".join(str(loc) for loc in e["loc"][1:]) if len(e["loc"]) > 1 else str(e["loc"][0]),
            "issue": e["msg"],
        }
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed.",
                "details": details,
            },
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.detail if isinstance(exc.detail, str) else "HTTP_ERROR",
                "message": str(exc.detail),
            },
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("unhandled_exception", error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred.",
            },
        },
    )


# ---------------------------------------------------------------------------
# API Router registration
# ---------------------------------------------------------------------------
api_router = APIRouter()


@api_router.get("/health", tags=["Health"])
async def health_check():
    redis_status = await ping()
    return {
        "success": True,
        "data": {
            "status": "ok",
            "version": settings.VERSION,
            "redis_connected": redis_status,
        },
    }


# Register routers — v1 core
app.include_router(api_router, prefix="/v1")
app.include_router(auth_router, prefix="/v1")
app.include_router(users_router, prefix="/v1")
app.include_router(jobs_router, prefix="/v1")
app.include_router(resumes_router, prefix="/v1")
app.include_router(applications_router, prefix="/v1")

# Register routers — v2.0 features
app.include_router(search_router, prefix="/v1")
app.include_router(recruiter_intel_router, prefix="/v1")
app.include_router(companies_router, prefix="/v1")
app.include_router(notifications_router, prefix="/v1")
app.include_router(billing_router, prefix="/v1")
app.include_router(audit_router, prefix="/v1")
app.include_router(analytics_router, prefix="/v1")
app.include_router(ml_ops_router, prefix="/v1")
app.include_router(files_router, prefix="/v1")


