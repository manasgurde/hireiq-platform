import time
import uuid
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = structlog.get_logger(__name__)

class StructlogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            
            # Inject request_id
            response.headers["X-Request-ID"] = request_id
            
            logger.info(
                "request_completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                process_time_ms=round(process_time * 1000, 2)
            )
            return response
            
        except Exception as exc:
            process_time = time.perf_counter() - start_time
            logger.error(
                "request_failed",
                method=request.method,
                path=request.url.path,
                error=str(exc),
                process_time_ms=round(process_time * 1000, 2)
            )
            raise
