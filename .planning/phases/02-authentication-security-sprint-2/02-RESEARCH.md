# Phase 2: Authentication & Security — Research

**Gathered:** 2026-06-17
**Phase:** 02-authentication-security-sprint-2

---

## 1. JWT Authentication Pattern (FastAPI)

FastAPI uses OAuth2 with Password Flow (Bearer tokens) as its primary security mechanism. We use **PyJWT** (not deprecated `python-jose`) for JWT encoding/decoding.

### Payload Schema
```json
{
  "sub": "user-uuid",
  "exp": 1718640900,
  "iat": 1718640000,
  "type": "access"
}
```
- `sub`: User UUID
- `exp`: 15 minutes from now (access token)
- `type`: `"access"` or `"refresh"` — prevents token mix-up attacks

### Dependency Injection Pattern
```python
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    if payload.get("type") != "access":
        raise credentials_exception
    ...
```

### Key Choices
- **Algorithm:** HS256 (symmetric) — API server is sole issuer/consumer
- **Access Token TTL:** 15 minutes (short-lived, in-memory on client)
- **Refresh Token TTL:** 7 days (httpOnly, Secure, SameSite=Strict cookie)

---

## 2. Refresh Token Rotation (RTR) with Redis

RTR invalidates old refresh tokens on every use. Reuse detection triggers full family invalidation (breach response).

### Redis Key Schema
| Key | Value | TTL |
|-----|-------|-----|
| `rt:{jti}` | `{"user_id": str, "family_id": str}` | 7d |
| `rt_family:{family_id}` | Redis Set of active JTIs | 7d |
| `revoked_rt:{jti}` | `"reused"` (grace period) | 60s |

### Atomic Rotation (Redis Pipeline)
```python
async with redis.pipeline(transaction=True) as pipe:
    pipe.delete(f"rt:{old_jti}")
    pipe.setex(f"revoked_rt:{old_jti}", 60, "reused")
    pipe.setex(f"rt:{new_jti}", 604800, json.dumps({...}))
    pipe.sadd(f"rt_family:{family_id}", new_jti)
    pipe.srem(f"rt_family:{family_id}", old_jti)
    pipe.expire(f"rt_family:{family_id}", 604800)
    await pipe.execute()
```

### Reuse Detection Flow
1. Check `revoked_rt:{jti}` — if exists → token reused → invalidate entire family
2. Check `rt:{jti}` — if missing → return 401
3. Proceed with rotation

---

## 3. Timing Attack Prevention

Attackers measure response latency to infer user existence. Solution: always run bcrypt verification — even against a dummy hash if the user doesn't exist.

```python
DUMMY_HASH = pwd_context.hash("dummy_password_for_timing")

async def authenticate_user(email: str, password: str, db: AsyncSession):
    user = await db.execute(select(User).where(User.email == email))
    user = user.scalar_one_or_none()
    if not user:
        pwd_context.verify(password, DUMMY_HASH)  # consume same time
        return None
    if not pwd_context.verify(password, user.password_hash):
        return None
    return user
```

For API key/token comparisons: use `hmac.compare_digest()` instead of `==`.

---

## 4. RBAC Pattern (FastAPI Dependencies)

```python
class UserRole(str, Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"
    CANDIDATE = "candidate"

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

# Pre-built dependency shortcuts
require_recruiter = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN]))
require_candidate = Depends(RoleChecker([UserRole.CANDIDATE, UserRole.ADMIN]))
```

Route-level ownership check (e.g., recruiter can only edit their own jobs):
```python
async def require_job_owner(job_id: UUID, current_user = Depends(get_current_user), db = Depends(get_db)):
    job = await db.get(Job, job_id)
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403)
    return job
```

---

## 5. Redis Sliding Window Rate Limiter

Uses Lua script for atomic ZSET operations. Keyed per IP + route path.

```lua
-- sliding_window.lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)
local count = redis.call('ZCARD', key)
if count < limit then
    redis.call('ZADD', key, now, now .. math.random())
    redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
    return 1
else
    return 0
end
```

Middleware dependency:
```python
class SlidingWindowRateLimiter:
    def __init__(self, requests: int = 10, window_seconds: int = 60):
        self.requests = requests
        self.window_ms = window_seconds * 1000

    async def __call__(self, request: Request):
        key = f"rate:{request.url.path}:{request.client.host}"
        now_ms = int(time.time() * 1000)
        allowed = await redis_client.eval(LUA_SCRIPT, 1, key, now_ms, self.window_ms, self.requests)
        if not allowed:
            raise HTTPException(status_code=429, detail="Too many requests")

# Usage
auth_rate_limit = Depends(SlidingWindowRateLimiter(requests=10, window_seconds=60))
```

---

## 6. Global Error Envelope (FastAPI)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed.",
    "details": [{ "field": "email", "issue": "value is not a valid email address" }]
  }
}
```

```python
@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc):
    details = [{"field": ".".join(map(str, e["loc"][1:])), "issue": e["msg"]} for e in exc.errors()]
    return JSONResponse(422, {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Input validation failed.", "details": details}})

@app.exception_handler(HTTPException)
async def http_handler(request, exc):
    return JSONResponse(exc.status_code, {"success": False, "error": {"code": "HTTP_ERROR", "message": str(exc.detail)}})

@app.exception_handler(Exception)
async def generic_handler(request, exc):
    logger.error("unhandled_exception", error=str(exc))
    return JSONResponse(500, {"success": False, "error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."}})
```

---

## 7. bcrypt Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

- `rounds=12`: ~200ms verification time on commodity hardware — secure, responsive
- `deprecated="auto"`: auto-upgrades hashes on login if rounds increase later

---

## 8. Next.js Auth UI Patterns

### Form Validation: React Hook Form + Zod
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })
```

### Password Strength: @zxcvbn-ts/core
```typescript
import { zxcvbn } from '@zxcvbn-ts/core'
const result = zxcvbn(password)
// result.score: 0 (weak) to 4 (very strong)
```

### Token Storage Strategy
- **Access Token:** In-memory Zustand store only (XSS immune, lost on tab close)
- **Refresh Token:** httpOnly, Secure, SameSite=Strict cookie set by FastAPI backend, path=/v1/auth/refresh
- **Auth Guard:** Next.js Middleware checks a `logged_in=true` non-httpOnly cookie for redirect logic without exposing the actual token

### 2-Step Registration Flow
1. **Step 1:** Role selection card (Candidate | Recruiter)
2. **Step 2:** Details form (email, name, password + zxcvbn meter)

---

## 9. Recommended Libraries

### Backend (`requirements.txt`)
```text
fastapi==0.111.0
uvicorn[standard]==0.30.1
pyjwt==2.8.0
passlib[bcrypt]==1.7.4
redis==5.0.6
structlog==24.2.0
pydantic==2.7.4
pydantic-settings==2.3.3
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
python-multipart==0.0.9
httpx==0.27.0
pytest==8.2.2
pytest-asyncio==0.23.7
fakeredis==2.23.2
```

### Frontend (`package.json`)
```json
{
  "react-hook-form": "^7.52.0",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.6.0",
  "@zxcvbn-ts/core": "^3.0.4",
  "@zxcvbn-ts/language-common": "^3.0.2",
  "axios": "^1.7.2"
}
```

---

## 10. Validation Architecture (Testing)

### conftest.py pattern
```python
import fakeredis
import pytest
from httpx import AsyncClient, ASGITransport

@pytest.fixture
def fake_redis():
    return fakeredis.FakeRedis()

@pytest.fixture
async def async_client(app, fake_redis):
    app.dependency_overrides[get_redis] = lambda: fake_redis
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
```

### Key Test Scenarios
1. `POST /auth/register` — duplicate email → 409, role enforcement, bcrypt hash stored
2. `POST /auth/login` — wrong password timing uniformity, account lockout at 5 fails
3. `POST /auth/refresh` — RTR rotation, reuse triggers family invalidation
4. Rate limiter — 11th request returns 429
5. RBAC — candidate hitting recruiter-only route → 403
6. Error envelope — all error responses follow `{success, error: {code, message, details?}}` shape
