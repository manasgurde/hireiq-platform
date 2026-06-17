# HireIQ — AI Hiring Intelligence Platform

## What This Is

HireIQ is an AI-powered SaaS hiring intelligence platform designed to transform the traditional recruitment process into a data-driven, intelligent pipeline. The platform provides deep AI analysis of resumes, semantic candidate scoring, personalized job recommendations, and automated mock interview evaluations for both recruiters and job seekers.

## Core Value

Deliver explainable, deterministic, and auditable AI-powered resume intelligence, candidate scoring, and mock interview evaluation that recruiters and candidates can trust.

## Requirements

The development is divided into 6 sprints containing 60 total backlog tickets, fully detailed in `.planning/REQUIREMENTS.md`.

### Validated

(None yet — ship to validate)

### Active Sprints & Backlog

- **Sprint 1: Foundation & Project Setup** (HIQ-001 to HIQ-010)
  - Monorepo folder setup, dockerized development services, initial PostgreSQL database migrations, FastAPI app factory, structured logging, Next.js frontend scaffolding, Zustand stores, and GitHub Actions CI.
- **Sprint 2: Authentication & Security** (HIQ-011 to HIQ-020)
  - JWT token registration/login/refresh/logout backend APIs, RBAC middleware, sliding window rate limiters, global error handler middleware, and user login/registration Next.js pages.
- **Sprint 3: User Profiles & Jobs Module** (HIQ-021 to HIQ-030)
  - User profiles API, S3 avatar upload, profile completion percentage, database models, job creation/close endpoints, paginated job board search (full-text search and skills matching), and job board Next.js interface.
- **Sprint 4: Resume & Applications Module** (HIQ-031 to HIQ-040)
  - AWS S3 private bucket, upload resume pre-signed URL API, PyMuPDF parsing utility, async AI triggers, application schema, apply API with 6 checks, seeker history feed, and recruiter candidate ranked listing API.
- **Sprint 5: AI / ML System** (HIQ-041 to HIQ-050)
  - Separate FastAPI AI microservice, spaCy NLP skills/experience extraction, TF-IDF cosine similarity candidate scoring, content-based job recommendation engine, SBERT S-Transformers mock interview evaluator, and HTTP client integration with timeouts/fallbacks.
- **Sprint 6: Dashboards, AI UI & Production Deploy** (HIQ-051 to HIQ-060)
  - Next.js seeker dashboard (circular score ring, carousel), recruiter dashboard (active jobs table, charts), resume upload interface, application status tracking, AI report details page, mock interview chat UI, recruiter candidate ranked table (slide-in drawer, CSV export), Terraform AWS ECS Fargate deploy, and OWASP Top 10 security audits.

### Out of Scope

- **Video Interviews** — Live video interview recording and AI analysis (deferred to v2.0)
- **Voice Analysis** — Speech-to-text tone analysis (deferred to v2.0)
- **Chrome Extension** — LinkedIn profile import browser extension (deferred to v2.5)
- **Mobile Apps** — Native iOS and Android applications (deferred to v2.0)
- **ATS Integrations** — Direct integrations with Workday, Greenhouse, and Lever (deferred to v2.0)
- **Bias Audit Module** — Automated bias detection and fairness reporting (deferred to v1.5)
- **Personality Analysis** — MBTI / Big Five personality scoring from text responses (deferred to v2.0)
- **Multi-language** — Non-English resume processing and platform localization (deferred to v1.5)

## Context

- The platform is configured as a Monorepo containing three core services: frontend (`Next.js 14`), backend (`FastAPI`), and AI service (`FastAPI`).
- The AI service requires a private subnet VPC setup and is only accessible by the backend Core API.
- spaCy and Sentence-Transformers models require significant memory footprints, requiring at least 4GB of container memory.
- The ML models must load at service startup (lifespan) to eliminate request latency overhead.

## Constraints

- **Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, FastAPI (Python 3.11), PostgreSQL 15, Redis 7, AWS S3.
- **Explainability**: Every candidate score must have matched and missing skills reasons. Black-box ML models are prohibited for candidate scoring.
- **Determinism**: Given the same input, all AI scoring and evaluation pipelines must yield identical results (no random/stochastic sampling).
- **Performance**: Standard REST API responses under 500ms p95; AI inference endpoints under 5 seconds p95.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Service-Oriented Architecture (SOA) | Separation of Core business API and heavy CPU-bound ML engines | — Pending |
| TF-IDF & Cosine Similarity | Explainable, deterministic candidate-to-job matching score | — Pending |
| Dual-token Auth Strategy | Opaque refresh tokens stored in Redis + short-lived JWTs for security | — Pending |
| S3 Pre-signed Upload URLs | Prevents file processing bottlenecks at the API gateway level | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-17 after initialization*
