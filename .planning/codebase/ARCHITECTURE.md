# System Architecture

**Analysis Date:** 2026-06-17

## Pattern Overview

**Overall:** Service-Oriented Architecture (SOA) with a Monorepo workspace layout.

**Key Characteristics:**
- Three independently deployable services: Frontend Application, Core API Service, and AI/ML Service
- Stateless request processing with token-based authentication (JWT)
- Event-driven asynchronous AI processing utilizing FastAPI `BackgroundTasks`
- Cache-aside performance layer powered by Redis

## Layers

**Frontend Application (Next.js):**
- Purpose: User interface and client-side interactions
- Contains: React components, hooks, Zustand stores, and routing layouts
- Location: `frontend/`
- Depends on: Core API (HTTP REST)
- Used by: End users (Job Seekers, Recruiters, Admins) via browser

**Core API Service (FastAPI):**
- Purpose: Orchestrates business logic, database transactions, and security checks
- Contains: Route handlers, SQLAlchemy models, Pydantic schemas, and services
- Location: `backend/`
- Depends on: PostgreSQL (RDS), Redis (Cache), AWS S3, and AI/ML Service
- Used by: Frontend application (proxies all requests, AI service is private)

**AI/ML Service (FastAPI):**
- Purpose: Performs CPU-intensive Natural Language Processing (NLP) and semantic scoring
- Contains: Extraction pipelines, vectorizers, and sentence embeddings loaders
- Location: `ai_service/`
- Depends on: Local model weights and Redis (caching job matrices)
- Used by: Core API Service (internal VPC calls only)

## Data Flow

**Job Application with AI Scoring Lifecycle:**

1. **Submission:** Job Seeker clicks "Apply" on Next.js frontend, initiating an HTTP POST to `backend/app/api/v1/routes/applications.py`.
2. **Auth & Validation:** API Gateway verifies JWT. Core API validates candidate eligibility (active job, uploaded resume, duplicate check).
3. **Database Write:** Core API creates an application record with `status='applied'` and `ai_score=null` in PostgreSQL.
4. **Async Trigger:** Core API initiates a FastAPI `BackgroundTask` and returns `HTTP 201 Created` immediately to the frontend.
5. **Inference Call:** The background task executes `POST /ai/score-candidate` to the AI Service, passing resume text and job description.
6. **AI Processing:** AI Service tokenizes inputs, vectorizes via TF-IDF (`ai_service/app/engines/scoring_engine.py`), computes cosine similarity, extracts skill match/gaps, and returns the JSON payload.
7. **Result Sync:** Core API receives the scoring payload, updates PostgreSQL, and invalidates the Redis caches.
8. **Dashboard Read:** Recruiter dashboard reads the ranked candidates. Active scores are served directly from Redis (`ai_score:{user_id}:{job_id}`) in ~2ms.

**State Management:**
- Services are entirely stateless; no in-memory session states.
- Client state (authentication tokens, UI state) is managed via Zustand.
- Database state persists in PostgreSQL, with cache states managed in Redis with configured TTLs.

## Key Abstractions

**Route Handlers:**
- Purpose: Exposes HTTP endpoints, parses inputs, and translates outputs using Pydantic validation schemas.
- Examples: `backend/app/api/v1/routes/jobs.py`, `ai_service/app/routes/score.py`
- Pattern: FastAPI APIRouter

**Business Services:**
- Purpose: Encapsulates domain business logic and database operations.
- Examples: `backend/app/services/job_service.py`, `backend/app/services/ai_service.py`
- Pattern: Service Pattern (dependency-injected into routes)

**Inference Engines:**
- Purpose: Wraps machine learning model inferences and pipelines.
- Examples: `ai_service/app/engines/resume_engine.py`, `ai_service/app/engines/interview_engine.py`
- Pattern: Singleton wrapper classes loaded at startup

**Middlewares:**
- Purpose: Intercepts requests for cross-cutting security, logging, and rate limiting.
- Examples: `backend/app/middlewares/auth_middleware.py`, `backend/app/middlewares/rate_limit.py`
- Pattern: ASGI Middlewares

## Entry Points

**Core API Entry:**
- Location: `backend/app/main.py`
- Triggers: HTTP requests routed by Uvicorn (port 8000)
- Responsibilities: Database connections initialization, routers registration, and middleware pipeline setup.

**AI Service Entry:**
- Location: `ai_service/app/main.py`
- Triggers: Internal VPC HTTP requests routed by Uvicorn (port 8001)
- Responsibilities: Lifespan startup ML model loading (`load_all_models()`), routes registration.

**Frontend Entry:**
- Location: `frontend/app/layout.tsx` / `frontend/app/page.tsx`
- Triggers: Next.js dev/production server start (port 3000)
- Responsibilities: Server-Side Rendering (SSR), route loading, and layout rendering.

## Error Handling

**Strategy:** FastAPI exception handlers catch custom exceptions at the boundary, log details, and return standard JSON responses.

**Patterns:**
- Services raise custom exceptions (e.g., `ValidationError`, `NotFoundError`).
- Core API maps exceptions to standard error envelopes: `{ "error": "Access denied", "code": "INSUFFICIENT_ROLE", "details": {} }`.
- AI Service fails gracefully by returning `null` values for failed inferences, ensuring application continuity.

## Cross-Cutting Concerns

**Logging:**
- Backend services use `structlog` to write structured JSON to stdout. Request IDs are injected in middlewares and propagated via headers (`X-Request-ID`).

**Validation:**
- Zod schemas validate client inputs on the frontend before submission. Pydantic v2 schemas strictly enforce type safety at FastAPI boundaries.

**Rate Limiting:**
- Middleware `rate_limit.py` uses Redis sliding windows to enforce rate limits (e.g., 10 req/min for login, 1000 req/min general API).

---

*Architecture analysis: 2026-06-17*
*Update when major patterns change*
