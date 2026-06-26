import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    DUMMY_HASH,
)
from app.core.redis import (
    store_refresh_token,
    rotate_refresh_token,
    check_refresh_reuse,
    get_refresh_payload,
    invalidate_token_family,
    delete_refresh_token,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, TokenResponse, UserOut, GoogleLoginRequest
from app.core.config import settings
import secrets
router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Set the httpOnly refresh token cookie."""
    # In production (HTTPS), we need secure=True and samesite='none' for
    # cross-origin cookie sharing between Vercel frontend and Render backend
    is_production = settings.FRONTEND_URL.startswith("https://")
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "strict",
        path="/v1/auth/refresh",
        max_age=REFRESH_COOKIE_MAX_AGE,
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Clear the refresh token cookie on logout."""
    is_production = settings.FRONTEND_URL.startswith("https://")
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/v1/auth/refresh",
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "strict",
    )


# ---------------------------------------------------------------------------
# POST /auth/register (HIQ-011)
# ---------------------------------------------------------------------------
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    # Check for duplicate email
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Hash password and create user
    user = User(
        id=uuid.uuid4(),
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token, jti, family_id = create_refresh_token(user_id=str(user.id))

    # Store RT in Redis
    await store_refresh_token(jti=jti, user_id=str(user.id), family_id=family_id)

    # Set httpOnly refresh cookie
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


# ---------------------------------------------------------------------------
# POST /auth/login (HIQ-012)
# ---------------------------------------------------------------------------
@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    # Fetch user — always run bcrypt to prevent timing attacks
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        # Run dummy verification to maintain constant-time response
        verify_password(body.password, DUMMY_HASH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token, jti, family_id = create_refresh_token(user_id=str(user.id))

    # Store RT and set cookie
    await store_refresh_token(jti=jti, user_id=str(user.id), family_id=family_id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


# ---------------------------------------------------------------------------
# POST /auth/google
# ---------------------------------------------------------------------------
@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google Sign-In is not configured on the server."
        )

    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {body.token}"}
            )
            if resp.status_code != 200:
                raise ValueError("Invalid access token")
            idinfo = resp.json()
            
        email = idinfo.get("email")
        if not email:
            raise ValueError("Token didn't contain an email.")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {exc}"
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        # Generate a random strong password hash
        random_pwd = secrets.token_urlsafe(32)
        hashed_pwd = hash_password(random_pwd)
        
        user = User(
            email=email,
            password_hash=hashed_pwd,
            role=body.role,
            full_name=idinfo.get("name")
        )
        db.add(user)
        await db.flush()
        # Create an empty profile for the new user
        from app.models.profile import Profile
        new_profile = Profile(id=user.id, avatar_url=idinfo.get("picture"))
        db.add(new_profile)
        await db.commit()
        await db.refresh(user)

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token, jti, family_id = create_refresh_token(user_id=str(user.id))

    # Store RT and set cookie
    await store_refresh_token(jti=jti, user_id=str(user.id), family_id=family_id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


# ---------------------------------------------------------------------------
# POST /auth/refresh (HIQ-013)
# ---------------------------------------------------------------------------
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided",
        )

    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    jti = payload.get("jti")
    family_id = payload.get("family_id")
    user_id = payload.get("sub")

    # Check for token reuse (security: invalidate entire family)
    if await check_refresh_reuse(jti):
        await invalidate_token_family(family_id)
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reused — session invalidated for security",
        )

    # Verify token is still active in Redis
    if not await get_refresh_payload(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or expired",
        )

    # Issue new tokens (RTR)
    new_access_token = create_access_token(data={"sub": user_id})
    new_refresh_token, new_jti, _ = create_refresh_token(
        user_id=user_id, family_id=family_id
    )

    await rotate_refresh_token(
        old_jti=jti,
        new_jti=new_jti,
        user_id=user_id,
        family_id=family_id,
    )

    _set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(access_token=new_access_token)


# ---------------------------------------------------------------------------
# POST /auth/logout (HIQ-014)
# ---------------------------------------------------------------------------
@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
) -> dict:
    if refresh_token:
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti")
            if jti:
                await delete_refresh_token(jti)
        except HTTPException:
            # Token may already be expired — still clear the cookie
            pass

    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}
