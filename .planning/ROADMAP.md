# Roadmap: HireIQ

## Overview

HireIQ will be built in six granular phases corresponding directly to the project's six development sprints. We begin with Sprint 1 establishing the monorepo foundation, dockerized local environment, and database migrations. Sprint 2 focuses on building secure JWT authentication and RBAC middlewares. Sprint 3 delivers user profiles and core job board CRUD features. Sprint 4 implements the S3 resume upload pipeline and job application flow. Sprint 5 deploys the specialized FastAPI AI/ML service hosting NLP parsing, TF-IDF scoring, and SBERT evaluation. Finally, Sprint 6 builds all Next.js recruiter/seeker dashboards and automates the production AWS deployment.

## Phases

- [ ] **Phase 1: Foundation & Project Setup (Sprint 1)** - Set up the monorepo, Docker Compose, Alembic migration environment, and Tailwind design system tokens.
- [ ] **Phase 2: Authentication & Security (Sprint 2)** - Implement user registration, login, refresh, logout, role middleware (RBAC), and rate limiting.
- [ ] **Phase 3: User Profiles & Jobs (Sprint 3)** - Implement profile CRUD, S3 avatar upload, profile completion percentage, and job board CRUD with search.
- [ ] **Phase 4: Resume & Applications (Sprint 4)** - Setup resume uploads, PyMuPDF extraction, and job applications with pre-flight checks.
- [ ] **Phase 5: AI / ML System (Sprint 5)** - Setup the AI service, spaCy NER parsing, TF-IDF candidate scoring, SBERT interview evaluation, and HTTP client integration.
- [ ] **Phase 6: Dashboards, AI UI & Production Deploy (Sprint 6)** - Build the Next.js role-based dashboards, Recharts analytics, AI insights pages, and Terraform AWS deployment.

## Phase Details

### Phase 1: Foundation & Project Setup (Sprint 1)
* **Goal**: Establish the monorepo structure, local dockerized environments, PostgreSQL initial database migrations, Next.js boilerplate, and design system tokens.
* **Depends on**: None
* **Success Criteria**:
  1. All services (frontend, backend, database, cache) run locally via a single `docker-compose up` command.
  2. Next.js 14 boots successfully on port 3000 and has the HireIQ color tokens loaded in `tailwind.config.ts`.
  3. Alembic can successfully upgrade and downgrade the initial schema.
* **Plans**: 3 plans

**Plans:**
- [ ] **01-01**: Scaffolding — Setup monorepo directories (`backend/`, `frontend/`, `ai_service/`), root `docker-compose.yml`, and initial Alembic database migrations. (Covers HIQ-001, HIQ-002)
- [ ] **01-02**: Core API Shell — Configure FastAPI application factory, router registration, Redis pool, Pydantic BaseSettings, and JSON logging. (Covers HIQ-003, HIQ-004, HIQ-005, HIQ-006)
- [ ] **01-03**: Frontend & CI Scaffolding — Initialize Next.js 14 project, configure Zustand store (auth/UI), Tailwind color tokens, and GitHub Actions CI pipeline. (Covers HIQ-007, HIQ-008, HIQ-009, HIQ-010)

---

### Phase 2: Authentication & Security (Sprint 2)
* **Goal**: Build secure user authentication, token rotation, RBAC role enforcement, rate limiting, and generic error handling.
* **Depends on**: Phase 1
* **Success Criteria**:
  1. Users can register and login securely, receiving JWT access tokens and httpOnly refresh cookies.
  2. Access token refresh rotation works seamlessly via Redis-based refresh token store.
  3. Route protection verifies JWTs and blocks unauthorized roles (e.g. Seeker posting a job).
* **Plans**: 3 plans

**Plans:**
- [ ] **02-01**: Auth APIs — Implement POST `/auth/register`, POST `/auth/login` (with timing attack prevention), POST `/auth/refresh` (with Redis rotation), and POST `/auth/logout`. (Covers HIQ-011, HIQ-012, HIQ-013, HIQ-014)
- [ ] **02-02**: Security Middlewares — Build JWT validation middleware, RBAC require_role decorator, Redis sliding window rate limiter, and global error envelope formatter. (Covers HIQ-015, HIQ-016, HIQ-017, HIQ-018)
- [ ] **02-03**: Auth Screens — Implement Next.js login page and 2-step registration page UI with inline validations and zxcvbn password meter. (Covers HIQ-019, HIQ-020)

---

### Phase 3: User Profiles & Jobs (Sprint 3)
* **Goal**: Deliver user profile management, profile completion percentage calculation, S3 avatar upload, and full job posting CRUD with paginated filters.
* **Depends on**: Phase 2
* **Success Criteria**:
  1. Users can update their profile fields, upload an avatar, and see completion score.
  2. Recruiters can create, edit, close, and delete job listings.
  3. Job seekers can search jobs by keywords and filter by skills, location, and salary.
* **Plans**: 3 plans

**Plans:**
- [ ] **03-01**: User Profiles — Build GET/PUT `/users/profile` CRUD endpoints, profile completion % calculator, and POST `/users/avatar` S3 upload logic. (Covers HIQ-021, HIQ-022, HIQ-023)
- [ ] **03-02**: Job posting CRUD — Design Job database model, implement create, edit, update, delete, and close job endpoints. (Covers HIQ-024, HIQ-025, HIQ-027, HIQ-028, HIQ-029)
- [ ] **03-03**: Job Search & Frontends — Build paginated job list GET `/jobs` with PostgreSQL full-text search, skills array containment, and Redis caching. Build the Job Board UI in Next.js. (Covers HIQ-026, HIQ-030)

---

### Phase 4: Resume & Applications (Sprint 4)
* **Goal**: Create S3-integrated resume upload, PyMuPDF text parsing, and application submission flows with 6 pre-flight checks.
* **Depends on**: Phase 3
* **Success Criteria**:
  1. Job seekers can upload PDF resumes, which are saved to S3 and parsed to structured JSON.
  2. Job seekers can apply to jobs (once per job) attaching their active resume.
  3. Recruiters can view applications, update status, and view applicant listings.
* **Plans**: 3 plans

**Plans:**
- [ ] **04-01**: Resume Uploads — Setup S3 bucket integrations, implement POST `/resumes/upload` pre-signed URLs, GET/DELETE `/resumes/me`, and PyMuPDF text extractor. (Covers HIQ-031, HIQ-032, HIQ-033, HIQ-034)
- [ ] **04-02**: Job Applications — Create Application models, implement POST `/applications` applying with 6 pre-flight validations and async AI trigger. (Covers HIQ-035, HIQ-036, HIQ-037)
- [ ] **04-03**: Applications API — Implement job seeker application history GET `/applications/me`, recruiter applicant list GET `/applications/job/:id`, and PATCH `/applications/:id/status`. (Covers HIQ-038, HIQ-039, HIQ-040)

---

### Phase 5: AI / ML System (Sprint 5)
* **Goal**: Build and deploy the FastAPI AI microservice, spaCy NER parsing engine, TF-IDF similarity scoring, SBERT mock interview evaluator, and client fallbacks.
* **Depends on**: Phase 4
* **Success Criteria**:
  1. Resumes are parsed by spaCy NER accurately, yielding structured skills/experience JSON.
  2. Job match scoring computes cosine similarity using a pre-fitted TF-IDF model.
  3. Mock interview text answers are scored using SBERT embeddings and keyword matching.
  4. Core API communicates with AI Service via async HTTP with Redis caching and 10s timeout fallbacks.
* **Plans**: 3 plans

**Plans:**
- [ ] **05-01**: AI Service & spaCy — Setup the FastAPI `ai_service` project, load spaCy models, and implement the NER skills/experience parsing engine. (Covers HIQ-041, HIQ-042, HIQ-046)
- [ ] **05-02**: Scoring & Interview Engines — Build the TF-IDF Candidate matching engine, Redis-cached job recommendation content-filtering engine, and SBERT S-Transformers interview evaluator. (Covers HIQ-043, HIQ-044, HIQ-045, HIQ-047, HIQ-048, HIQ-049)
- [ ] **05-03**: AI Service Client — Implement `AIService` client in Core API with 10s timeouts, Redis score caching, and silent error logging fallbacks. (Covers HIQ-050)

---

### Phase 6: Dashboards, AI UI & Production Deploy (Sprint 6)
* **Goal**: Implement recruiter and candidate Next.js dashboards, Recharts analytics, interactive AI interview chat page, and AWS production Terraform deployment.
* **Depends on**: Phase 5
* **Success Criteria**:
  1. Recruiter and candidate dashboards show animated stats and Recharts widgets.
  2. Seeker can upload resumes, view skill gaps, and complete SBERT-scored mock interviews.
  3. Production architecture is deployed to AWS ECS, RDS, Redis, S3, CloudFront and passes security audits.
* **Plans**: 4 plans

**Plans:**
- [ ] **06-01**: Job Seeker UI — Implement Job Seeker dashboard with circular AI score ring, resume upload UI, recent applications table, and Recommended jobs feed. (Covers HIQ-051, HIQ-053, HIQ-054)
- [ ] **06-02**: Recruiter UI — Build Recruiter Dashboard with jobs table, top candidates list, candidate details slide-in drawer, and status action buttons. (Covers HIQ-052, HIQ-057)
- [ ] **06-03**: AI Insights & Interview UIs — Implement AI Insights details page (skill gap, benchmark charts) and AI Interview Chat interface (settings, chat bubbes, progress, and results). (Covers HIQ-055, HIQ-056)
- [ ] **06-04**: Production AWS & QA Audit — Build Recharts recruiter analytics dashboard, write AWS Terraform configurations (ALB, ECS, RDS, CloudFront), and execute OWASP Top 10 security audit. (Covers HIQ-058, HIQ-059, HIQ-060)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Project Setup | 0/3 | Not started | - |
| 2. Authentication & Security | 0/3 | Not started | - |
| 3. User Profiles & Jobs | 0/3 | Not started | - |
| 4. Resume & Applications | 0/3 | Not started | - |
| 5. AI / ML System | 0/3 | Not started | - |
| 6. Dashboards, AI UI & Production Deploy | 0/4 | Not started | - |
