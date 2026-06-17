# Technology Stack

**Analysis Date:** 2026-06-17

## Languages

**Primary:**
- Python 3.11+ - Core API Service (`backend/`) and AI/ML Service (`ai_service/`) application code
- TypeScript - Next.js frontend application code (`frontend/`)

**Secondary:**
- SQL - Database queries, migrations, and indexing in PostgreSQL
- JavaScript - Build scripts, Docker/CI configurations
- HTML & CSS - Frontend markup and layout configuration

## Runtime

**Environment:**
- Python 3.11+ - Application runtime for the backend services
- Node.js 18+ / 20.x (LTS) - Application runtime for Next.js frontend

**Package Manager:**
- npm 10.x - Next.js frontend package manager
- pip - Python dependencies manager (via `requirements.txt`)

## Frameworks

**Core:**
- FastAPI (Python) - Web framework for Core API and AI/ML services
- Next.js 14 (App Router) - React framework for the frontend application

**Testing:**
- pytest - Python unit and integration testing framework for backend and AI services
- Jest + React Testing Library - Unit and component testing for Next.js frontend
- Playwright - End-to-end testing for full user flows

**Build/Dev:**
- Docker & docker-compose - Containerization for local development and production deployment
- TypeScript compiler - Frontend build compilation

## Key Dependencies

**Backend (Core API & AI/ML):**
- SQLAlchemy 2.0 - Async ORM for PostgreSQL database interactions
- Alembic - Database migration manager
- asyncpg - Async database driver for PostgreSQL
- python-jose & passlib[bcrypt] - JWT authentication and password hashing (cost factor 12)
- redis-py - Caching client and rate limiter store
- Pydantic v2 - Data validation and settings management
- PyMuPDF (fitz) - PDF text extraction for resume parsing
- spaCy (en_core_web_lg) - NLP pipeline and NER for entity extraction
- scikit-learn - TF-IDF vectorization and cosine similarity calculation
- sentence-transformers (all-MiniLM-L6-v2) - Semantic similarity embeddings for interview evaluation
- joblib - Model serialization and loading
- structlog - Structured JSON logging

**Frontend:**
- Zustand - Global client state management (auth/UI)
- TanStack Query (React Query) - Server-state synchronization and caching
- Axios - HTTP client with request/response interceptors
- Recharts - Charting and analytics visualization
- shadcn/ui - Accessible component library styled with Tailwind
- Tailwind CSS v3 - Styling and layout utility framework
- React Hook Form & Zod - Form handling and schema validation
- react-hot-toast - Lightweight toast notifications
- react-dropzone - File upload drag-and-drop handler
- Lucide React - Icon set

## Configuration

**Environment:**
- Backend: Configured via `.env` files loaded using `Pydantic BaseSettings` (`backend/app/core/config.py`)
- Frontend: Next.js environment variables (`.env.local` / `NEXT_PUBLIC_*`) injected client-side/server-side

**Build:**
- `tsconfig.json` - TypeScript compiler options for the frontend
- `next.config.js` - Next.js framework configuration
- `tailwind.config.ts` - Tailwind design tokens and configurations
- `docker-compose.yml` - Multi-service container orchestration

## Platform Requirements

**Development:**
- Windows/macOS/Linux with Docker Desktop installed
- Python 3.11 and Node.js (v18+) for local tooling

**Production:**
- Deployment target: AWS ECS Fargate (serverless containers for Core API & AI/ML)
- Database: AWS RDS PostgreSQL 15 (Multi-AZ)
- Caching: AWS ElastiCache Redis 7 (single-node v1.0, cluster v1.5)
- Storage: AWS S3 (private bucket with pre-signed URL access)
- CDN: AWS CloudFront (static assets and resume files delivery)

---

*Stack analysis: 2026-06-17*
*Update after major dependency changes*
