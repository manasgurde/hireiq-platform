# Phase 4: Resume & Applications — Research

**Gathered:** 2026-06-17
**Phase:** 04-resume-applications-sprint-4

---

## 1. S3 Pre-signed URLs for Uploads
To completely offload S3 upload bandwidth (which is especially important for multi-megabyte PDF resumes) from the FastAPI backend, we use `generate_presigned_url` with `put_object`.

### aioboto3 Implementation
```python
import aioboto3

async def generate_upload_presigned_url(
    bucket_name: str, 
    object_name: str, 
    expiration_seconds: int = 3600
) -> str:
    session = aioboto3.Session()
    async with session.client("s3") as s3_client:
        # Note: generate_presigned_url is async in aioboto3
        presigned_url = await s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_name,
                "ContentType": "application/pdf"
            },
            ExpiresIn=expiration_seconds
        )
        return presigned_url
```
**Workflow:**
1. Frontend requests upload URL `POST /resumes/upload-url`.
2. Backend generates and returns presigned URL + S3 key.
3. Frontend performs `PUT` directly to the presigned URL.
4. Frontend notifies backend of completion `POST /resumes/confirm`.

---

## 2. PyMuPDF Text Extraction (Non-blocking)
`PyMuPDF` (`fitz`) is a fast C-extension library, but it is strictly synchronous. Performing heavy PDF text extraction on the event loop will block FastAPI. 

We must offload the execution to a worker thread using `anyio.to_thread.run_sync`. We can also extract directly from a memory buffer (`bytes`) without writing to disk.

### Implementation Pattern
```python
import anyio
import fitz  # PyMuPDF

def extract_pdf_text_from_bytes_sync(pdf_bytes: bytes) -> str:
    # Open document from memory stream
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_content = [page.get_text() for page in doc]
    doc.close()
    return "\n".join(text_content)

async def extract_pdf_text_from_bytes(pdf_bytes: bytes) -> str:
    # Offload synchronous PDF parsing to a thread pool
    return await anyio.to_thread.run_sync(extract_pdf_text_from_bytes_sync, pdf_bytes)
```

---

## 3. The 6 Application Pre-flight Checks
Before accepting a job application (`POST /applications`), the backend must perform the following robust validations:
1. **Job Exists:** Ensure the `job_id` corresponds to a valid record.
2. **Job Active:** Ensure `is_active == True` and `is_deleted == False`.
3. **Role Validation:** Ensure `current_user.role == 'candidate'`.
4. **Resume Requirement:** Ensure the candidate has a confirmed resume uploaded to S3.
5. **No Duplicate Applications:** Query the `applications` table to ensure `(candidate_id, job_id)` does not already exist (enforced by a database UniqueConstraint).
6. **Deadline Check:** If the job has an `expires_at` deadline (optional), ensure `utcnow() < expires_at`.

---

## 4. Application Status Workflow
A standard ATS status machine involves these states:
- `applied`: Initial state upon submission.
- `reviewing`: Recruiter has opened the application.
- `shortlisted`: Candidate moves to interview stages.
- `rejected`: Application denied.
- `hired`: Candidate accepted the offer.

We will map this using an Enum or String column in the `Application` model.

---

## 5. Recommended Libraries
- **PDF Extraction:** `PyMuPDF`
- **File Uploads:** `python-multipart` (already present, verify version is `>= 0.0.9`)
- **Async concurrency:** `anyio` (installed via FastAPI/Starlette dependency)
