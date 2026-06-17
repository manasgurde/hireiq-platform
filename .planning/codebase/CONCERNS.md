# Codebase Concerns

**Analysis Date:** 2026-06-17

## Tech Debt

**Mock responses during v1.0 / Phase 2:**
- Issue: Phase 2 development utilizes hardcoded mock AI responses until Phase 3 models are integrated.
- Files: `backend/app/services/ai_service.py`
- Why: Separation of concerns between core backend features and ML model integration.
- Impact: End-to-end integration issues may go undetected until late in the development cycle.
- Fix approach: Establish structured integration schemas early and test with dummy models in `ai_service` instead of mock files in the backend.

**Celery infrastructure deferred to v1.1:**
- Issue: Asynchronous tasks are routed via FastAPI `BackgroundTasks` rather than a full task queue like Celery.
- Files: `backend/app/main.py`, `backend/app/services/application_service.py`
- Why: Simplicity and reduced infrastructure overhead for v1.0 release.
- Impact: Under heavy load, background tasks can consume API container CPU, degrading HTTP response latency.
- Fix approach: Implement Celery + Redis task queue queueing in Phase 6/Post-launch v1.1.

## Known Risks & Bugs (Design-time)

**AI scoring accuracy deviations:**
- Symptoms: Match scores might deviate from human expectations under specific formatting styles.
- Trigger: Highly stylized resumes with uncommon section headers (confusing the regex section detector).
- Files: `ai_service/app/engines/resume_engine.py` (line ~30, regex parser)
- Workaround: Fall back to parsing the entire text block if section parsing fails.
- Root cause: Keyword-based section split is fragile compared to transformer-based sequence classifiers.

**Stale job recommendation cache:**
- Symptoms: Candidates see recommendations for jobs that have been closed or deleted.
- Trigger: Delay in deleting/updating Redis key `job_matrix:active` after job status changes.
- Files: `backend/app/services/job_service.py` (cache invalidation triggers)
- Root cause: Race conditions between concurrent API updates and cache purge routines.

## Security Considerations

**Unprotected admin routes:**
- Risk: Missing role-based validation checks on admin endpoints could allow recruiters or job seekers to access platform moderation tools.
- Files: `backend/app/api/v1/routes/recruiter.py`, `backend/app/api/v1/routes/users.py`
- Current mitigation: Basic RBAC role-checks.
- Recommendations: Implement dual-factor authorization (2FA) for admin roles and restrict paths via API Gateway.

**S3 bucket public accessibility:**
- Risk: Potential misconfiguration of S3 ACLs exposing candidate resumes to the public internet.
- Files: `backend/app/utils/s3.py`
- Current mitigation: S3 bucket block public access policies.
- Recommendations: Enforce strict AWS IAM roles for ECS task executor, disable ACLs, and use SSE-S3 encryption.

## Performance Bottlenecks

**spaCy model size and memory footprints:**
- Problem: Loading `en_core_web_lg` consumes ~1.5GB RAM.
- File: `ai_service/app/core/model_loader.py`
- Measurement: 10-15s cold start startup time.
- Cause: spaCy loads large static entity-relation embeddings at service initialization.
- Improvement path: Bake model weights into the Docker container image to prevent runtime download, and size ECS tasks with minimum 4GB memory.

**TF-IDF vocabulary collisions:**
- Problem: Candidate scoring TF-IDF matrix recalculations can hit CPU throttling on concurrent loads.
- File: `ai_service/app/engines/scoring_engine.py`
- Measurement: Latency targets < 500ms might slip under 50+ concurrent requests.
- Cause: Raw matrix conversions are CPU-bound on single-thread Python runtimes.
- Improvement path: Cache fitted `TfidfVectorizer` and pre-built active job matrices in Redis, updating only on job postings.

## Scaling Limits

**FastAPI BackgroundTasks queue length:**
- Current capacity: Safely handles 50-100 concurrent uploads.
- Limit: Memory limits on API containers will cause crash loops if background task queue expands indefinitely.
- Scaling path: Transition to Celery + Redis message brokers to decouple task processing.

**Redis Single-Node memory caps:**
- Current capacity: Redis 7 single-node supports up to 10k users.
- Limit: Caching all user profiles and job matrices will exhaust memory.
- Scaling path: Enable Redis Cluster mode in v1.5.

## Dependencies at Risk

**PyMuPDF (fitz):**
- Risk: Restrictive AGPL license might cause compliance issues for proprietary commercial deployment.
- Migration plan: Evaluate Apache-licensed alternatives (e.g. `pypdf` or `pdfplumber`) if commercial licensing terms dictate.

---

*Concerns audit: 2026-06-17*
*Update as issues are fixed or new ones discovered*
