# HireIQ — AI Hiring Intelligence Platform

HireIQ is a multi-tenant SaaS application that provides AI-powered resume intelligence, candidate scoring, and mock interview evaluation.

## Monorepo Layout
- `backend/`: FastAPI core application and PostgreSQL integrations.
- `ai_service/`: Standalone service or module for ML/AI workflows.
- `frontend/`: Next.js 14 application for recruiters and candidates.

## Local Setup
1. Copy the `.env.example` to `.env`.
2. Run `docker-compose up -d` to start the PostgreSQL database and Redis services.
3. Apply database migrations inside the `backend` folder:
   ```bash
   cd backend
   alembic upgrade head
   ```
4. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
5. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```
