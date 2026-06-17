# Coding Conventions

**Analysis Date:** 2026-06-17

## Naming Patterns

**Files & Directories:**
- Python: `snake_case.py` for all modules, scripts, and directories (`auth_middleware.py`, `user_service.py`).
- TypeScript (Frontend):
  - `PascalCase.tsx` for React components (`Navbar.tsx`, `JobCard.tsx`).
  - `kebab-case.ts` for custom hooks, stores, and general utilities (`use-auth.ts`, `auth-store.ts`).
  - Next.js routing: Feature directories in `kebab-case`, file name is strictly `page.tsx` or `layout.tsx`.
- Tests:
  - Python: `test_*.py` matching the module prefix, placed under `tests/` directory.
  - TypeScript: `*.test.ts` or `*.test.tsx` placed in close proximity to the tested component or utility.

**Variables & Functions:**
- Python & TS:
  - `camelCase` for all TypeScript variables and functions.
  - `snake_case` for all Python variables, functions, and properties.
  - `UPPER_SNAKE_CASE` for global constants (`MAX_SIZE_BYTES`, `JWT_ALGORITHM`).
  - HTTP event handlers on components: `handleEventName` (e.g., `handleSubmit`, `handleUpload`).
  - Async functions: No special prefix (like `async` or `get...Async`), standard naming preferred.

**Types & Classes:**
- Python: PascalCase for classes (`ModelRegistry`, `JobCreate`).
- TypeScript:
  - PascalCase for interface and type declarations (`CreateJobOptions`, `UserSession`).
  - Avoid `I` prefix for interfaces (`User`, not `IUser`).
  - PascalCase for Enums, with `UPPER_CASE` values.

## Code Style

**Python Formatting & Linting:**
- Linter/Formatter: `ruff` checks and format alignments.
- Type Hints: Mandatory for all function signatures and schemas.
- Line Limit: 88 characters.
- Quotes: Single quotes for internal strings; double quotes for docstrings and output text.

**TypeScript Formatting & Linting:**
- Linter/Formatter: `eslint` with TypeScript plugins, formatted via `prettier`.
- Tab Width: 2 spaces.
- Semicolons: Required.
- Quotes: Single quotes for JavaScript strings, double quotes for JSX attributes.

## Import Organization

**Python Order:**
1. Standard library imports (e.g. `import os, json, re`)
2. Third-party package imports (e.g. `from fastapi import FastAPI`, `import spacy`)
3. Local application imports (e.g. `from app.core.config import settings`)
- Empty line separator between groups, alphabetically sorted.

**TypeScript Order:**
1. React core and Next.js libraries
2. Third-party packages (e.g., `lucide-react`, `zustand`)
3. Internal path-mapped modules (`@/components`, `@/lib`, `@/hooks`)
4. Relative file imports (`../utils`, `./styles`)
5. Type imports (`import type { User }`)
- Empty line separator between groups, alphabetically sorted.

## Error Handling

**Core API (Python):**
- Raise custom exceptions at service layers. Catch them via FastAPI exception handlers to format uniform HTTP responses.
- HTTP errors must return the standard envelope: `{ "error": "Descriptive message", "code": "ERROR_CODE", "details": {} }`.
- Async operations use `try/catch` blocks; avoid using `.catch()` chains.

**Frontend (TypeScript):**
- Axios interceptors catch `401 Unauthorized` responses to trigger token refresh.
- Expected validation errors display inline under the input field in real-time.
- Unhandled API failures prompt generic toast notifications via `react-hot-toast`.

## Logging

**Structured Logging:**
- All backend services use `structlog` to output structured JSON in production.
- Middlewares inject `request_id` and `user_id` into the log context.
- Log levels: `DEBUG` (local/dev only), `INFO` (normal operations, state changes), `WARNING` (recoverable issues), `ERROR` (exceptions, failure events).
- **CRITICAL:** Never log passwords, JWT secret keys, AWS credentials, S3 pre-signed URLs, or raw credit cards. Emails must be masked in logs (`john@example.com` -> `j***@example.com`).

---

*Convention analysis: 2026-06-17*
*Update when patterns change*
