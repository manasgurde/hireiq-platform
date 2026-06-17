# Phase 3: User Profiles & Jobs — Research

**Gathered:** 2026-06-17
**Phase:** 03-user-profiles-jobs-sprint-3

---

## 1. Async S3 Avatar Uploads
### aioboto3 Setup
```python
import aioboto3
from botocore.config import Config

session = aioboto3.Session()
# Signature version 4 is mandatory for modern AWS regions
config = Config(signature_version='s3v4')
```

### Direct Upload vs. Presigned URLs
- **Direct Upload Stream (Via Backend):**
  - **Pattern:** FastAPI handles `UploadFile`, validates properties (size limit, file extension/MIME type), then uploads to S3 using `s3.put_object`.
  - **Pros:** Full backend control, immediate verification, security validation is easy.
  - **Cons:** High backend bandwidth/CPU consumption.
- **Presigned Upload URLs:**
  - **Pattern:** Backend generates a signed upload URL via `generate_presigned_url(ClientMethod='put_object')` and returns it to the client. The client performs a `PUT` request directly to S3.
  - **Pros:** Saves backend bandwidth, zero file handling overhead.

**Recommendation:** For avatar uploads, since files are small (< 2MB), **Direct Upload via Backend** is recommended.

### Storing S3 URL
The backend stores the full S3 URL or relative key in the user database model:
```python
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    avatar_url = Column(String(512), nullable=True)
```

---

## 2. Profile Completion Calculator
The profile completion percentage is calculated dynamically on read using a Pydantic `@computed_field` or a property on the SQLAlchemy model:
```python
from pydantic import BaseModel, computed_field
from typing import List, Optional

class ProfileSchema(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: List[str] = []

    @computed_field
    @property
    def completion_percentage(self) -> int:
        score = 0
        if self.avatar_url:
            score += 20
        if self.bio and len(self.bio.strip()) > 0:
            score += 30
        if self.skills and len(self.skills) > 0:
            score += 50
        return score
```

---

## 3. PostgreSQL Full-Text Search in SQLAlchemy
### Generated Column & GIN Index
A stored generated column of type `TSVECTOR` in PostgreSQL automatically concatenates `title` and `description` of a job posting.
```python
from sqlalchemy import Column, String, Text, Computed, Index
from sqlalchemy.dialects.postgresql import TSVECTOR

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Generated TSVector column containing concatenated title and description
    search_vector = Column(
        TSVECTOR,
        Computed("to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))", persisted=True)
    )

Index('idx_job_search_vector', Job.search_vector, postgresql_using='gin')
```

### Searching via `websearch_to_tsquery`
```python
from sqlalchemy import select, func

def search_jobs(db, search_query: str):
    stmt = (
        select(Job)
        .where(Job.search_vector.bool_op("@@")(func.websearch_to_tsquery("english", search_query)))
        .where(Job.is_deleted == False)
    )
    return db.execute(stmt).scalars().all()
```

---

## 4. Array Containment Queries (Skills)
### Schema Definition
```python
from sqlalchemy.dialects.postgresql import ARRAY

class Job(Base):
    skills = Column(ARRAY(String), nullable=False, server_default='{}')
```

### Querying Skills
- **Match all skills (Containment `@>`):**
  ```python
  stmt = select(Job).where(Job.skills.contains(['python', 'fastapi']))
  ```
- **Match any skills (Overlap `&&`):**
  ```python
  stmt = select(Job).where(Job.skills.overlap(['python', 'go']))
  ```

---

## 5. Redis Caching for Job Search
### Cache Key Design
A hashed version of query parameters avoids issues with long keys:
```python
import hashlib
import json

def get_cache_key(query_params: dict) -> str:
    sorted_params = sorted(query_params.items())
    serialized = json.dumps(sorted_params)
    param_hash = hashlib.md5(serialized.encode()).hexdigest()
    return f"jobs:search:{param_hash}"
```

### Cache Invalidation: Versioning Pattern
1. Maintain a global version key `jobs:version` in Redis.
2. Read the current version value (default to `1`).
3. The cache key includes this version: `jobs:search:{version}:{param_hash}`.
4. When a job is created, updated, or deleted, increment the global `jobs:version` in Redis.

---

## 6. Job Posting Model & Soft Deletion
### Database Model
```python
import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    salary_min = Column(Numeric(10, 2), nullable=True)
    salary_max = Column(Numeric(10, 2), nullable=True)
    location = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
```

### Soft Deletion Pattern
When a job is closed or deleted, we flag it with `is_deleted = True`.

---

## 7. Recommended Libraries
- **Backend:** `aioboto3`, `types-aioboto3[s3]`, `cryptography`
- **Frontend:** `react-dropzone`, `lucide-react`
