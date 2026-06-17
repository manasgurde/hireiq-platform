# Plan 02-02 Summary: Security Middlewares

## Execution Notes
- Created `backend/app/core/deps.py` — `get_current_user` dependency (OAuth2 Bearer → JWT decode → DB lookup), `RoleChecker` callable class, pre-built `require_recruiter`, `require_candidate`, `require_admin`, and `verify_resource_owner` helpers.
- Created `backend/app/middlewares/rate_limiter.py` — Lua sliding window rate limiter using `ZADD/ZREMRANGEBYSCORE`. Fail-open on Redis unavailability. Pre-built `auth_rate_limiter` (10/min) and `api_rate_limiter` (100/min).
- Created `backend/requirements.txt` with all production dependencies.
- Created `backend/Dockerfile` — Python 3.11-slim, non-root `hireiq` user.
- Global error handlers (ValidationError → 422, HTTPException → standard, Exception → 500) were already integrated in 02-01's main.py update.

## Deviations
- Rate limiter is built as a FastAPI dependency for flexibility; it can be applied globally via middleware or per-route via `Depends`.

## Completion State
- [x] All tasks executed.
