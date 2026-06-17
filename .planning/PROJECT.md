# HireIQ — AI Hiring Intelligence Platform

## What This Is

HireIQ is an AI-powered SaaS hiring intelligence platform designed to transform the traditional recruitment process into a data-driven, intelligent pipeline. The platform provides deep AI analysis of resumes, semantic candidate scoring, personalized job recommendations, and automated mock interview evaluations for both recruiters and job seekers.

## Core Value

Deliver explainable, deterministic, and auditable AI-powered resume intelligence, candidate scoring, and mock interview evaluation that recruiters and candidates can trust.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] JWT-based Registration, Login, Logout, and Token Refresh with Role Selection (Job Seeker / Recruiter) and bcrypt password hashing
- [ ] User Profiles module supporting skills, experience, education profile editing, and profile picture upload (up to 2MB)
- [ ] Job Module supporting full CRUD, keyword search, filter (skills/location/salary), and pagination
- [ ] Resume Module supporting PDF upload to AWS S3 (up to 5MB), PyMuPDF text extraction, and structured JSON parsing
- [ ] Application Module supporting applying to jobs, duplicate prevention, and status tracking (applied/shortlisted/rejected)
- [ ] AI Resume Engine featuring NLP-based spaCy NER extraction of skills, experience, education, and projects
- [ ] Candidate Scoring Engine using TF-IDF and cosine similarity (0-100 score) with matched and missing skills breakdown
- [ ] Job Recommendations using content-based filtering (top 5 personalized job recommendations based on user skills)
- [ ] AI Mock Interview Q&A using Sentence-Transformers (all-MiniLM-L6-v2) for semantic similarity scoring (0-100) and rule-based feedback
- [ ] Recruiter Dashboard featuring applicant overview, AI score rankings, and hiring analytics charts
- [ ] Job Seeker Dashboard featuring profile summary, AI score, skill gap analysis, and recommended jobs feed
- [ ] Admin Panel supporting basic user management, job moderation, and platform analytics

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
| dual-token auth strategy | Opaque refresh tokens stored in Redis + short-lived JWTs for security | — Pending |
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
