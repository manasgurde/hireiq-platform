# Plan 04-01 Summary: Resume Uploads

## Execution Notes
- Created `backend/app/models/resume.py` — `Resume` SQLAlchemy model, enforcing 1-to-1 with `User` (`candidate`).
- Updated `backend/app/models/__init__.py` and `user.py` to expose the relationship.
- Updated `backend/app/core/s3.py` with `generate_presigned_upload_url` for async S3 PUT signatures, and `get_s3_object_bytes` to read the PDF.
- Created `backend/app/core/pdf_parser.py` using `PyMuPDF` (`fitz`) wrapped in `anyio.to_thread.run_sync` to perform synchronous text extraction from memory without blocking the FastAPI event loop.
- Added `PyMuPDF` to `requirements.txt`.
- Created `backend/app/schemas/resume.py`.
- Created `backend/app/api/v1/resumes.py` — `POST /upload-url` generates the presigned URL, `POST /confirm` fetches the S3 bytes, extracts text, and upserts the DB record. `GET /me` and `DELETE /me` handle standard CRUD.

## Deviations
- None

## Completion State
- [x] All tasks executed.
