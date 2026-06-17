# Requirements: HireIQ

**Defined:** 2026-06-17
**Core Value:** Deliver explainable, deterministic, and auditable AI-powered resume intelligence, candidate scoring, and mock interview evaluation that recruiters and candidates can trust.

## Core Feature Backlog (Sprint Tickets)

The following table lists the 60 master tickets from the sprint backlog. Every ticket represents an atomic requirement that must be implemented and tested to meet the Definition of Done.

### Sprint 1: Foundation & Project Setup
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-001** | Project Scaffolding | Chore | P0 | 3 | Setup backend, ai_service, and frontend monorepo folders, create root `docker-compose.yml` for postgres/redis, configure `.gitignore` and `README.md`. |
| **HIQ-002** | PostgreSQL Schema | Chore | P0 | 3 | Configure Alembic migration environment, create schema with users, jobs, resumes, applications, and interview_sessions tables with correct FKs, indexes, and unique constraints. |
| **HIQ-003** | FastAPI Core API | Chore | P0 | 3 | Implement app factory in `backend/`, register all 7 router prefixes, configure CORS, and build `/health` endpoint returning version and status. |
| **HIQ-004** | Redis Pool Setup | Chore | P0 | 2 | Configure async Redis client connection pool, build Redis utilities (ping test, scan keys delete, cache_or_fetch with TTL). |
| **HIQ-005** | Pydantic settings | Chore | P0 | 2 | Centralized environment variable settings loading via Pydantic BaseSettings from local `.env`. |
| **HIQ-006** | JSON Logging | Chore | P1 | 3 | Setup structured JSON logging middleware via `structlog` and inject unique request IDs into response headers. |
| **HIQ-007** | GitHub Actions CI | Infra | P0 | 5 | Setup GitHub Actions pipeline to run ruff, eslint, pytest backend tests (>=70% coverage), frontend jest tests, and docker build. |
| **HIQ-008** | Next.js Setup | Chore | P0 | 3 | Bootstrap Next.js 14 App Router project with TypeScript strict mode, ESLint, Tailwind CSS, and shadcn/ui. |
| **HIQ-009** | Design System UI | Feature | P1 | 3 | Setup Tailwind config with colors, spacing, shadows from FSD section 1, and dark mode toggle hook. |
| **HIQ-010** | Zustand Stores | Chore | P0 | 2 | Setup client stores (`authStore` for user sessions, `uiStore` for dark mode/sidebar). |

### Sprint 2: Authentication & Security
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-011** | POST /auth/register | Feature | P0 | 5 | Register endpoint with role (job_seeker/recruiter), password bcrypt hashing (rounds=12), duplicate check, token generation, and secure httpOnly refresh cookie. |
| **HIQ-012** | POST /auth/login | Feature | P0 | 5 | Login endpoint with timing attack protection (dummy bcrypt hashes), Redis-based failed attempt logging, and account lockout after 5 fails. |
| **HIQ-013** | POST /auth/refresh | Feature | P0 | 3 | Token refresh endpoint with refresh token rotation (RTR) via Redis. Old refresh token is invalidated. |
| **HIQ-014** | POST /auth/logout | Feature | P0 | 2 | Logout endpoint clearing HTTP cookies and deleting refresh tokens from Redis. |
| **HIQ-015** | JWT Auth Middleware | Security | P0 | 3 | Create backend `get_current_user` dependency validating bearer token signature and expiration. |
| **HIQ-016** | RBAC Middleware | Security | P0 | 3 | Create route decorators verifying user roles and ownership. Seeker cannot CRUD jobs. |
| **HIQ-017** | Rate Limiter | Security | P1 | 5 | Redis sliding window rate limiter middleware (max 10 auth req/min from single IP). |
| **HIQ-018** | Global Error Handler | Chore | P0 | 3 | FastAPI exception handler mapping validation errors to standard JSON envelope and preventing 500 stack leaks. |
| **HIQ-019** | Login Screen UI | Feature | P0 | 5 | Next.js Login UI, split screen, dark mode classes, client forms, inline validation, and red alert box API error handler. |
| **HIQ-020** | Register Screen UI | Feature | P0 | 5 | Next.js Register UI, 2-step card flow (role select card then registration details form), and password strength meter. |

### Sprint 3: User Profiles & Jobs Module
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-021** | GET/PUT Profile | Feature | P0 | 5 | Fetch and update own profile details. Exclude password hashes and internal IDs. Recalculate profile completion. |
| **HIQ-022** | Avatar S3 Upload | Feature | P2 | 3 | Endpoint generating pre-signed PUT URLs for S3 profile picture uploads, capped at 2MB. |
| **HIQ-023** | Completion Calculator | Feature | P1 | 3 | Calculate profile completion percentage based on field weights: name(10), email(10), bio(15), skills(20), experience(20), education(15), avatar(10). |
| **HIQ-024** | Job Database Model | Chore | P0 | 2 | Define jobs table with Alembic migration including title, required_skills (array), salary, location, job_type, and status. |
| **HIQ-025** | POST /jobs Create | Feature | P0 | 5 | Recruiter only job creation API. Validate title, description, skills (1-20 tags), and salary ranges. Invalidate Redis cache. |
| **HIQ-026** | GET /jobs Listing | Feature | P0 | 8 | Paginated job list GET API with postgres tsvector full-text search, skills containment filter, salary overlap, and Redis cache. |
| **HIQ-027** | GET /jobs/:id Detail | Feature | P0 | 3 | Get detailed job posting by UUID. Returns job details and includes match_score if called in candidate context. |
| **HIQ-028** | PUT/DELETE jobs | Feature | P0 | 5 | Update and delete job postings restricted to the owning recruiter. Invalidate Redis listings. |
| **HIQ-029** | PATCH /jobs/:id/close | Feature | P1 | 2 | Recruiter endpoint to toggle job status between active and closed. Closed jobs block new applications. |
| **HIQ-030** | Job Listing UI | Feature | P0 | 8 | Next.js Job Board listing UI, filter sidebar (skills, location input, range slider), JobCard components, and skeleton loading states. |

### Sprint 4: Resume & Applications Module
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-031** | S3 bucket & Policy | Infra | P0 | 3 | Provision private S3 bucket (`hireiq-resumes-prod`), deny public access, enable SSE-S3 encryption and versioning. |
| **HIQ-032** | POST /resumes/upload | Feature | P0 | 8 | Pre-signed upload URLs API for resumes. Max file size validation (5MB). Deletes old S3 file if replacing. Triggers async parsing. |
| **HIQ-033** | GET/DELETE Resumes | Feature | P0 | 3 | Seeker retrieves pre-signed GET URL for resume. Delete endpoint removes record from DB and deletes file from S3 bucket. |
| **HIQ-034** | PyMuPDF Parsing Utility | Chore | P0 | 3 | Create backend text extraction utility from PDF byte streams using `fitz` library. Includes unit tests for various PDF layouts. |
| **HIQ-035** | Async AI Trigger | Feature | P1 | 5 | Use FastAPI `BackgroundTasks` to parse uploaded PDF text and update database record parse status asynchronously. |
| **HIQ-036** | Application DB Schema | Chore | P0 | 2 | Alembic migration for applications table, adding UNIQUE constraint on `(user_id, job_id)`. |
| **HIQ-037** | POST /applications Apply | Feature | P0 | 8 | Submit job application with 6 checks: job exists, job is active, user has resume, no duplicates. Increment job applicant count. |
| **HIQ-038** | GET /applications/me | Feature | P0 | 3 | Job Seeker GET list of all submitted applications with company details, application dates, AI match scores, and status badges. |
| **HIQ-039** | GET /applications/job/:id | Feature | P0 | 5 | Recruiter GET list of all candidates who applied to a specific job. Return candidate info and AI scores. |
| **HIQ-040** | PATCH /applications/:id/status | Feature | P0 | 3 | Recruiter updates candidate application status (applied, shortlisted, rejected, hired). |

### Sprint 5: AI / ML System
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-041** | AI Service Scaffold | Chore | P0 | 5 | Scaffold separate FastAPI `ai_service` on port 8001. Configures lifespan event for pre-loading spaCy and SBERT models. |
| **HIQ-042** | spaCy NER Parser | AI | P0 | 13 | NLP pipeline using `spacy` large model to extract skills, experience, education, and projects from raw resume text. |
| **HIQ-043** | Cosine scoring Engine | AI | P0 | 13 | TF-IDF candidate match scoring engine. Calculates 0-100 similarity between resume text and job description. |
| **HIQ-044** | Job Recommendation Engine| AI | P1 | 8 | Content-based job recommender engine. Returns top 5 active jobs matching seeker skill vectors. |
| **HIQ-045** | SBERT Interview Evaluator| AI | P1 | 8 | Semantic answer evaluation engine scoring text answers against ideal answers using Sentence-Transformers (MiniLM). |
| **HIQ-046** | POST /ai/analyze-resume | Feature | P0 | 3 | AI Service endpoint parsing resume text and returning structured JSON. |
| **HIQ-047** | POST /ai/score-candidate | Feature | P0 | 3 | AI Service endpoint calculating job-candidate similarity and returning matched and missing skills arrays. Caches in Redis. |
| **HIQ-048** | POST /ai/recommend-jobs | Feature | P1 | 3 | AI Service recommendation endpoint. Returns ranked list of job UUIDs. |
| **HIQ-049** | POST /ai/evaluate-interview | Feature | P1 | 3 | AI Service mock interview evaluation endpoint. Returns semantic match score and rule-based feedback. |
| **HIQ-050** | AIService Client API | Feature | P0 | 5 | HTTP client class in Core API utilizing `httpx` to query AI endpoints with 10s timeouts and silent fallback handlers. |

### Sprint 6: Dashboards, AI UI & Production Deploy
| ID | Title | Type | Priority | Points | Description & Acceptance Criteria |
|---|---|---|---|---|---|
| **HIQ-051** | Seeker Dashboard UI | Feature | P0 | 8 | Seeker portal displaying circular AI score ring, resume status cards, and recommended jobs carousel. |
| **HIQ-052** | Recruiter Dashboard UI | Feature | P0 | 8 | Recruiter portal showing active jobs table, applicant trend line chart, and applicant score distribution bar chart. |
| **HIQ-053** | Resume Page UI | Feature | P0 | 8 | Seeker resume upload UI with drag-and-drop zone, file validations, progress indicator, and parsed skills tags. |
| **HIQ-054** | My Applications UI | Feature | P0 | 5 | Seeker applications tracking page with filter tabs (All, Applied, Shortlisted, Rejected) and status badges. |
| **HIQ-055** | AI Insights Page UI | Feature | P1 | 8 | Seeker AI report page showing circular gauge, detailed skill gap analysis, improvement roadmap list, and PDF download. |
| **HIQ-056** | AI Interview Chat UI | Feature | P1 | 8 | Seeker chat interface. Form to setup type/count/difficulty, chat window with message bubbles, progress, and end of session stats. |
| **HIQ-057** | Recruiter Applicants UI | Feature | P0 | 8 | Recruiter applicants ranked table by AI match, bulk shortlist/reject, candidate details slide-in drawer, and CSV export. |
| **HIQ-058** | Recruiter Analytics UI | Feature | P1 | 5 | Recruiter Hiring Analytics page with 5 Recharts components (daily apps, score buckets, top skills tags, hiring funnel, per-job breakdown). |
| **HIQ-059** | AWS Infrastructure | Infra | P0 | 8 | Production deploy configurations using Terraform. Provisions ALB, VPC (public/private), ECS Fargate containers, RDS PostgreSQL, and ElastiCache. |
| **HIQ-060** | Security Hardening & Audit | Security | P0 | 8 | Pentesting checklist, HTTP security headers, CORS settings, cookie safety flags, and OWASP Top 10 vulnerabilities verification. |

## Traceability & Verification Matrix

Every sprint ticket maps to success criteria verified by automated test cases:

- **Auth Module (HIQ-011 to HIQ-020)**: Verified by `pytest tests/test_auth.py` and `pytest tests/test_middleware.py`. Enforces 95% coverage on authentication endpoints.
- **Job Board (HIQ-024 to HIQ-030)**: Verified by `pytest tests/test_jobs.py`. Enforces CRUD permissions, sorting, search debounce, and caching.
- **Resumes (HIQ-031 to HIQ-035)**: Verified by `pytest tests/test_resumes.py`. Mocks S3 boto3 interactions and tests PyMuPDF parsing logic.
- **Applications (HIQ-036 to HIQ-040)**: Verified by `pytest tests/test_applications.py`. Checks applying validations, duplicate attempts, status changes.
- **AI Engines (HIQ-041 to HIQ-050)**: Verified by `pytest tests/test_ai_routes.py` and service integration tests. Validates NER schema and SBERT scorer outputs.
- **Next.js Frontends (HIQ-051 to HIQ-058)**: Verified by Jest component tests and manual walkthroughs. Enforces full responsiveness and dark mode.
- **DevOps (HIQ-001, HIQ-007, HIQ-059, HIQ-060)**: Verified by CI pipeline builds and Terraform plan validations.

---
*Requirements updated: 2026-06-17*
