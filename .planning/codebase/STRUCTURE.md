# Codebase Structure

**Analysis Date:** 2026-06-17

## Directory Layout

```
[project-root]/
├── backend/            # FastAPI Core API backend service
│   ├── app/            # Main application directory
│   ├── migrations/     # Alembic database migration scripts
│   ├── tests/          # pytest unit and integration test suites
│   ├── Dockerfile      # Backend container build configuration
│   └── requirements.txt# Backend python dependencies
├── ai_service/         # FastAPI AI/ML microservice
│   ├── app/            # Main application directory
│   ├── tests/          # pytest unit and benchmark test suites
│   ├── Dockerfile      # AI Service container build configuration
│   └── requirements.txt# AI Service python dependencies
├── frontend/           # Next.js 14 Web Application
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # React presentation components
│   ├── lib/            # Axios API client and utility libraries
│   ├── hooks/          # React hooks for API interaction
│   ├── store/          # Zustand stores for client state
│   ├── types/          # TypeScript interface definitions
│   └── Dockerfile      # Frontend container build configuration
├── infrastructure/     # Terraform IaC configurations (planned)
├── docker-compose.yml  # Local multi-container development configuration
└── README.md           # Project documentation
```

## Directory Purposes

**backend/app/**
- Purpose: Application source code for the Core business API
- Contains:
  - `api/v1/routes/` - REST API route handlers
  - `core/` - Global configurations, security utilities, database setup
  - `models/` - SQLAlchemy declarative models
  - `schemas/` - Pydantic input/output validation schemas
  - `services/` - Business logic controllers called by routes
  - `middlewares/` - Auth, rate limiting, and logging middlewares
  - `utils/` - S3 helper, PyMuPDF parsing, validators, pagination
- Key files: `main.py` - FastAPI app factory and main router registration

**ai_service/app/**
- Purpose: Application source code for the AI inference service
- Contains:
  - `routes/` - private REST API endpoints
  - `engines/` - Extraction and similarity computation modules
  - `data/` - Curated skills dictionaries and interview ideal Q&As
  - `models/` - Serialized TF-IDF vectorizer and SBERT directory
  - `core/` - Lifespan model loader and service configurations
- Key files: `main.py` - FastAPI app startup and model loading trigger

**frontend/app/**
- Purpose: Next.js file-based routing and page layout system
- Contains:
  - `(auth)/` - Login and registration routes
  - `(dashboard)/` - Job Seeker and Recruiter workspace routes
  - `admin/` - Platform moderation panels
- Subdirectories:
  - `jobs/`, `resume/`, `applications/`, `ai/insights/`, `ai/interview/`, `recruiter/`

**frontend/components/**
- Purpose: Reusable UI blocks and presentation components
- Contains:
  - `ui/` - Headless shadcn base primitives
  - `layout/` - Navbar and sidebar layouts
  - `jobs/`, `candidates/`, `ai/`, `charts/`, `resume/` - Feature specific components

## Key File Locations

**Entry Points:**
- `backend/app/main.py`: Core API application startup
- `ai_service/app/main.py`: AI Service application startup
- `frontend/app/layout.tsx`: Next.js global provider layout

**Configuration:**
- `backend/app/core/config.py`: Pydantic BaseSettings environment loader
- `ai_service/app/core/config.py`: AI settings loader
- `frontend/next.config.ts`: Next.js config
- `frontend/tailwind.config.ts`: Tailwind CSS theme tokens
- `docker-compose.yml`: Multi-container local execution

**Core Logic:**
- `backend/app/services/`: Core business operations (Jobs, Resumes, Applications)
- `ai_service/app/engines/`: ML inference logic (Resume NER, Cosine similarity, SBERT interview evaluation)
- `frontend/store/`: Zustand global state managers

**Testing:**
- `backend/tests/`: Pytest backend route and service testing suite
- `ai_service/tests/`: Unit tests and benchmarks for ML engines
- `frontend/jest.config.js` / `playwright.config.ts`: Frontend test setups

## Naming Conventions

**Files:**
- `snake_case.py` - Python modules and scripts
- `kebab-case.ts` - TypeScript modules and utilities
- `PascalCase.tsx` - React component files
- `[id]/page.tsx` - Next.js dynamic routing path parameters

**Directories:**
- `snake_case` - Python directories and packages
- `kebab-case` / `(parenthesis)` - Frontend app structure groups

## Where to Add New Code

**New API Endpoint:**
- Definition: Add router route to `backend/app/api/v1/routes/`
- Request/Response validation: Define schemas in `backend/app/schemas/`
- Business logic: Implement services under `backend/app/services/`
- Test: Add test module under `backend/tests/`

**New AI Pipeline Feature:**
- Algorithm: Write engine class under `ai_service/app/engines/`
- API Route: Add endpoint to `ai_service/app/routes/`
- Test: Write unit and regression benchmark tests in `ai_service/tests/`

**New UI Page/Feature:**
- Page: Create directory and `page.tsx` inside `frontend/app/(dashboard)/`
- Component: Define widgets under `frontend/components/`
- Custom Hook: Add hook under `frontend/hooks/` for backend synchronization

---

*Structure analysis: 2026-06-17*
*Update when directory structure changes*
