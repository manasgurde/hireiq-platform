# Roadmap: HireIQ

## Overview

HireIQ will be built in four coarse phases. We begin with establishing the foundation (boilerplate, docker, database schemas, auth, and profiles). Next, we build the core recruitment features (job postings, resume uploads, and applications). Then, we integrate the AI/ML microservice engines (resume extraction, TF-IDF candidate scoring, SBERT mock interviews) and build the user dashboards. Finally, we implement security, conduct QA, and automate the AWS deployment pipeline.

## Phases

- [ ] **Phase 1: Foundation** - Monorepo boilerplate, docker configurations, database setup, JWT auth, and user profiles.
- [ ] **Phase 2: Core Features** - Job postings CRUD, resume PDF uploads, and job applications submissions.
- [ ] **Phase 3: AI Integration & Dashboards** - spaCy resume parsing, candidate scoring, SBERT interviews, and role-based analytics dashboards.
- [ ] **Phase 4: QA, Security & Launch** - End-to-end testing, OWASP security checks, and production AWS ECS deployment.

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the monorepo structure, local dockerized environments, PostgreSQL database schemas, JWT authentication APIs, and profile management services.
**Depends on**: Nothing
**Requirements**: `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-05`, `AUTH-06`, `USER-01`, `USER-02`, `USER-03`, `USER-04`
**Success Criteria**:
  1. Users can register, login, refresh tokens, and logout with correct roles (Job Seeker / Recruiter).
  2. Authenticated users can view and update their profile fields and see their profile completion score.
  3. All services (frontend, backend, database, cache) run locally via docker-compose.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Setup monorepo structure, docker-compose configurations, and PostgreSQL database schema.
- [ ] 01-02: Implement JWT authentication routes, RBAC middleware, and User Profile services.

### Phase 2: Core Features
**Goal**: Build the core job board mechanics, S3 file uploads, and job application submission flows.
**Depends on**: Phase 1
**Requirements**: `JOB-01`, `JOB-02`, `JOB-03`, `JOB-04`, `JOB-05`, `JOB-06`, `RES-01`, `RES-02`, `RES-03`, `RES-04`, `RES-05`, `RES-06`, `APP-01`, `APP-02`, `APP-03`, `APP-04`, `APP-05`, `APP-06`
**Success Criteria**:
  1. Recruiters can create, edit, close, and delete jobs.
  2. Users can browse and search jobs with filters (skills, location, salary).
  3. Job seekers can upload PDF resumes and apply to jobs, attaching their active resume.
  4. Recruiters can update application statuses and view applicant lists.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Implement Job CRUD endpoints, keyword searching, and status toggles.
- [ ] 02-02: Setup AWS S3 integrations for resume uploads and create job application pipelines.

### Phase 3: AI Integration & Dashboards
**Goal**: Integrate the FastAPI AI microservice, build NLP parsing, candidate scoring, mock interviews, and build the analytical dashboards.
**Depends on**: Phase 2
**Requirements**: `AI-01`, `AI-02`, `AI-03`, `AI-04`, `AI-05`, `AI-06`, `DASH-01`, `DASH-02`, `DASH-03`
**Success Criteria**:
  1. Uploaded resumes are automatically parsed for skills, years of experience, and education.
  2. Applications are scored (0-100) using TF-IDF and cosine similarity with skill gap reasons.
  3. Candidates can complete mock interview questions with SBERT semantic scoring and feedback.
  4. Recruiter and Job Seeker dashboards display rankings, skill gaps, and Recharts analytics.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Setup AI service, spaCy parsing engine, TF-IDF scoring, and SBERT interview evaluator.
- [ ] 03-02: Build Recruiter and Job Seeker Dashboards with Redis caching and analytics charts.

### Phase 4: QA, Security & Launch
**Goal**: Implement security hardeners, rate limiters, write integration tests, and automate AWS cloud deployments.
**Depends on**: Phase 3
**Requirements**: `ADM-01`
**Success Criteria**:
  1. All integration and unit tests pass with at least 70% backend line coverage.
  2. API endpoints are protected by security headers and rate limits.
  3. Platform is deployed to AWS ECS, RDS, S3, and CloudFront.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Write integration tests, implement security header and rate limit middlewares, and configure AWS CI/CD pipelines.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Core Features | 0/2 | Not started | - |
| 3. AI Integration & Dashboards | 0/2 | Not started | - |
| 4. QA, Security & Launch | 0/1 | Not started | - |
