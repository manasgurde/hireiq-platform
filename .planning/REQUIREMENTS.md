# Requirements: HireIQ

**Defined:** 2026-06-17
**Core Value:** Deliver explainable, deterministic, and auditable AI-powered resume intelligence, candidate scoring, and mock interview evaluation that recruiters and candidates can trust.

## v1 Requirements

### Authentication & Authorization

- [ ] **AUTH-01**: User registration with name, email, password, and role selection (job_seeker or recruiter)
- [ ] **AUTH-02**: Passwords hashed using bcrypt with cost factor 12
- [ ] **AUTH-03**: Dual-token issuance: signed JWT access token (24h expiry) + refresh token (30-day expiry)
- [ ] **AUTH-04**: Role-Based Access Control (RBAC) preventing cross-role access (recruiters cannot apply, job seekers cannot post)
- [ ] **AUTH-05**: JWT verification middleware returning HTTP 401 for invalid/missing tokens
- [ ] **AUTH-06**: Token refresh rotation to issue new tokens without forcing frequent re-logins

### User Profiles

- [ ] **USER-01**: User view and edit own profile fields (name, bio, skills, experience, education)
- [ ] **USER-02**: Profile picture upload (JPEG/PNG up to 2MB)
- [ ] **USER-03**: Calculate and display profile completion percentage dynamically
- [ ] **USER-04**: Skills stored as a structured array to support AI matching operations

### Job Module

- [ ] **JOB-01**: Authenticated recruiters can create, read, update, and delete (CRUD) their jobs
- [ ] **JOB-02**: Paginated job listings (default 10 items per page) for authenticated browsing
- [ ] **JOB-03**: Job search by keyword and filters (skills, location, salary range) using PostgreSQL GIN indexing
- [ ] **JOB-04**: Enforced job ownership: update/delete restricted to the owning recruiter (others receive HTTP 403)
- [ ] **JOB-05**: Display creation timestamp and applicant count on job cards
- [ ] **JOB-06**: Active/closed status toggle to block new applications on closed jobs

### Resume Module

- [ ] **RES-01**: Resume file upload in PDF format (up to 5MB)
- [ ] **RES-02**: Uploaded resumes stored in private AWS S3 bucket with secure access URL saved in the database
- [ ] **RES-03**: Text extraction from PDF using PyMuPDF (fitz) triggered automatically on upload
- [ ] **RES-04**: Store parsed resume data (skills, experience, education) as structured JSONB in the database
- [ ] **RES-05**: Dual deletion: deleting a resume removes it from both S3 and the database
- [ ] **RES-06**: Strict frontend and backend file type and size validation before processing uploads

### Application Module

- [ ] **APP-01**: Limit job seekers to apply for each job only once (duplicate prevention)
- [ ] **APP-02**: Attach the user's active resume S3 URL to the application record at time of submission
- [ ] **APP-03**: Automatically set application status to 'applied' by default upon submission
- [ ] **APP-04**: Recruiter can update application status (applied, shortlisted, rejected, hired)
- [ ] **APP-05**: Job seekers can view all their submitted applications with status tracking
- [ ] **APP-06**: Block application submission if the job seeker has not uploaded a resume

### AI & ML Module

- [ ] **AI-01**: Parse resume text using spaCy NER into structured JSON skills, experience, education, and projects
- [ ] **AI-02**: Candidate scoring using TF-IDF vectorization and cosine similarity (0-100 score) with matched/missing skills reasons
- [ ] **AI-03**: Content-based job recommendations (top 5 matched jobs based on candidate skill vectors)
- [ ] **AI-04**: Interactive AI interview evaluation scoring text answers against ideal answers using SBERT embeddings
- [ ] **AI-05**: Trigger background async resume parsing and application scoring on submission
- [ ] **AI-06**: Ensure all AI endpoints respond within 5 seconds p95 under production load

### Dashboards & UI

- [ ] **DASH-01**: Recruiter Dashboard displaying candidate listings ranked by AI score, status selectors, and pipeline charts
- [ ] **DASH-02**: Job Seeker Dashboard displaying resume score, detailed skill gap analysis, and personalized jobs feed
- [ ] **DASH-03**: Full responsiveness (320px to 2560px), dark mode toggle persistence, and skeleton loading screens

### Admin Panel

- [ ] **ADM-01**: Basic admin interface for user moderation, job moderation, and platform statistics

## v2 Requirements

### Advanced AI & Live Interactivity

- **VID-01**: Live video interview recording and automated facial/confidence AI analysis (planned for v2.0)
- **VOI-01**: Speech-to-text tone analysis for voice interviews (planned for v2.0)
- **EXT-01**: Chrome Extension for LinkedIn profile import and parsing (planned for v2.5)
- **MOB-01**: Native iOS and Android mobile applications (planned for v2.0)
- **ATS-01**: Direct integrations with third-party ATS platforms (Workday, Greenhouse, Lever) (planned for v2.0)
- **PERS-01**: MBTI/Big Five personality analysis from interview answers (planned for v2.0)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video Interviews v1.0 | High bandwidth costs, deferred to v2.0 |
| Voice Analysis v1.0 | High processing requirements, deferred to v2.0 |
| ATS Integrations v1.0 | High customization requirements, deferred to v2.0 |
| Bias Audit Module v1.0 | Scheduled for post-launch v1.5 release |
| Multi-language Resumes v1.0 | Restricted to English parsing for initial release, v1.5 scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| USER-01 | Phase 1 | Pending |
| USER-02 | Phase 1 | Pending |
| USER-03 | Phase 1 | Pending |
| USER-04 | Phase 1 | Pending |
| JOB-01 | Phase 2 | Pending |
| JOB-02 | Phase 2 | Pending |
| JOB-03 | Phase 2 | Pending |
| JOB-04 | Phase 2 | Pending |
| JOB-05 | Phase 2 | Pending |
| JOB-06 | Phase 2 | Pending |
| RES-01 | Phase 2 | Pending |
| RES-02 | Phase 2 | Pending |
| RES-03 | Phase 2 | Pending |
| RES-04 | Phase 2 | Pending |
| RES-05 | Phase 2 | Pending |
| RES-06 | Phase 2 | Pending |
| APP-01 | Phase 2 | Pending |
| APP-02 | Phase 2 | Pending |
| APP-03 | Phase 2 | Pending |
| APP-04 | Phase 2 | Pending |
| APP-05 | Phase 2 | Pending |
| APP-06 | Phase 2 | Pending |
| AI-01 | Phase 3 | Pending |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| AI-04 | Phase 3 | Pending |
| AI-05 | Phase 3 | Pending |
| AI-06 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| ADM-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after initial definition*
