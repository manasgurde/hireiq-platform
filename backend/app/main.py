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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


# Register routers
app.include_router(api_router, prefix="/v1")
app.include_router(auth_router, prefix="/v1")

