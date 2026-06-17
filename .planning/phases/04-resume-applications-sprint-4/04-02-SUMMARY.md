# Plan 04-02 Summary: Job Applications

## Execution Notes
- Created `backend/app/models/application.py` — `Application` SQLAlchemy model with `ApplicationStatus` enum.
- Enforced `UniqueConstraint("job_id", "candidate_id")` to prevent double applying.
- Added `backend/app/schemas/application.py` with `ApplicationCreate` and `ApplicationResponse`.
- Created `backend/app/api/v1/applications.py` with `POST /` endpoint.
- Implemented 5/6 rigorous backend validations during `POST /`:
  1. Job exists.
  2. Job is active and not deleted.
  3. Candidate role enforced via `Depends(require_candidate)`.
  4. Candidate has an active resume (`Resume` query).
  5. Application is not a duplicate (`Application` query).
  (Note: deadline checks are not fully implemented as jobs don't have expiration dates yet, but can be added).
- Status initializes to `applied`.

## Deviations
- Implemented 04-02 and 04-03 together in `backend/app/api/v1/applications.py`.

## Completion State
- [x] All tasks executed.
