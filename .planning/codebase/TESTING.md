# Testing Patterns

**Analysis Date:** 2026-06-17

## Test Framework

**Core API & AI Services:**
- Runner: `pytest`
- Libraries: `pytest-asyncio` (async runner), `httpx` (client testing)
- Commands:
  ```bash
  pytest backend/tests/               # Run all Core API tests
  pytest ai_service/tests/            # Run all AI Service unit tests
  python ai_service/benchmarks/run_resume_benchmark.py # Run resume benchmark
  python ai_service/benchmarks/run_scoring_benchmark.py # Run scoring benchmark
  python ai_service/benchmarks/run_interview_benchmark.py # Run interview benchmark
  ```

**Frontend Application:**
- Runner: `Jest` + `React Testing Library` (unit/component)
- E2E Runner: `Playwright`
- Commands:
  ```bash
  npm run test                        # Run Jest unit tests
  npm run test:e2e                    # Run Playwright E2E tests
  ```

## Test File Organization

**Location:**
- Python: Separate directories for tests under respective services:
  - `backend/tests/` (API and DB logic)
  - `ai_service/tests/` (inference engines)
- TypeScript: colocated with source code:
  - Component tests: `[ComponentName].test.tsx` alongside component file
  - Utility tests: `[utility].test.ts` alongside utility file
  - E2E tests: separate `frontend/e2e/` folder

**Structure Example:**
```
backend/
  tests/
    conftest.py              # Pytest shared fixtures
    test_auth.py             # Auth route tests
    test_jobs.py             # Job CRUD tests
ai_service/
  tests/
    conftest.py              # Shared fixtures
    test_resume_engine.py    # Unit tests for NLP engine
  benchmarks/
    run_resume_benchmark.py  # 50-resume Gold set benchmarks
    data/
      resume_benchmark/      # Annotated JSON benchmark files
```

## Test Structure

**Python Pytest Pattern:**
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_job_success(client: AsyncClient, auth_headers: dict):
    # Arrange
    payload = {
        "title": "Python Developer",
        "description": "Must have 3 years of FastAPI and SQLAlchemy experience.",
        "required_skills": ["python", "fastapi", "sqlalchemy"],
        "salary_min": 80000,
        "salary_max": 120000,
        "location": "Remote",
        "job_type": "remote"
    }
    
    # Act
    response = await client.post("/v1/jobs", json=payload, headers=auth_headers)
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Python Developer"
    assert "id" in data
```

**TypeScript Jest Pattern:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobCard from './JobCard';

describe('JobCard Component', () => {
  it('renders job details correctly', () => {
    // Arrange
    const job = { title: 'Software Engineer', location: 'Remote', salary: '$100k' };
    render(<JobCard job={job} />);
    
    // Act & Assert
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });
});
```

## Mocking

**Python Mocking (pytest-mock / unittest.mock):**
- Mock AWS S3 client upload and URL generation in unit tests.
- Mock the private AI service endpoints inside `backend/app/services/ai_service.py` to test Core API isolation.
- Mock current system date/time to ensure age/experience calculations are deterministic:
```python
from unittest.mock import patch
import datetime

@patch('app.engines.resume_engine.datetime')
def test_experience_present(mock_datetime):
    # Lock current year to 2026
    mock_datetime.date.today.return_value = datetime.date(2026, 6, 17)
    # Perform date parser test relative to 2026
```

## AI & ML Evaluation Benchmarks

The AI engines must pass strict regression benchmark gates before release:
1. **Resume Intelligence (Engine 1):** Checked via `benchmarks/run_resume_benchmark.py` against 50 manually annotated gold-set resumes.
   - Target: Skill Recall >= 85%, Skill Precision >= 90%, Education/Experience Accuracy >= 80%.
2. **Candidate Scoring (Engine 2):** Checked via `benchmarks/run_scoring_benchmark.py` against 30 expert-labeled resume-job pairs.
   - Target: Pearson Correlation Coefficient >= 0.80.
3. **Interview Evaluation (Engine 4):** Checked via `benchmarks/run_interview_benchmark.py` against 50 question-answer rating pairs.
   - Target: Score band agreement >= 75%.

*If any benchmark score falls below target or previous model version, deployment is blocked (Regression Gate).*

## Coverage

**Target:** Minimum 70% line coverage required for Python `backend` core business services. Checked during the CI test phase.

---

*Testing analysis: 2026-06-17*
*Update when test patterns change*
