# Plan 04-03 Summary: Applications API

## Execution Notes
- Extended `backend/app/schemas/application.py` with `ApplicationStatusUpdate` enum payload.
- Added `GET /me` to `backend/app/api/v1/applications.py` allowing candidates to view their application history.
- Added `GET /job/{job_id}` allowing recruiters to list applicants. Enforces strict job ownership validation (`job.recruiter_id == current_user.id`).
- Added `PATCH /{app_id}/status` allowing recruiters to update application states (e.g., `applied` -> `reviewing`). Joined the job table to enforce recruiter authorization for that specific application.

## Deviations
- None

## Completion State
- [x] All tasks executed.
