from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.s3 import upload_avatar
from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/users", tags=["Users"])


async def _get_or_create_profile(user: User, db: AsyncSession) -> Profile:
    """Fetch the user's profile, creating an empty one if it doesn't exist."""
    result = await db.execute(select(Profile).where(Profile.id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(id=user.id, bio=None, avatar_url=None, skills=[])
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


# ---------------------------------------------------------------------------
# GET /users/profile (HIQ-021)
# ---------------------------------------------------------------------------
@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await _get_or_create_profile(current_user, db)
    return ProfileResponse.model_validate(profile)


# ---------------------------------------------------------------------------
# PUT /users/profile (HIQ-022)
# ---------------------------------------------------------------------------
@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await _get_or_create_profile(current_user, db)

    if body.bio is not None:
        profile.bio = body.bio
    if body.skills is not None:
        profile.skills = body.skills

    await db.commit()
    await db.refresh(profile)
    return ProfileResponse.model_validate(profile)


# ---------------------------------------------------------------------------
# POST /users/avatar (HIQ-023)
# ---------------------------------------------------------------------------
@router.post("/avatar", response_model=ProfileResponse)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    # Upload the file to S3 and get back the public URL
    avatar_url = await upload_avatar(file, current_user.id)

    # Update the user's profile avatar URL
    profile = await _get_or_create_profile(current_user, db)
    profile.avatar_url = avatar_url

    await db.commit()
    await db.refresh(profile)
    return ProfileResponse.model_validate(profile)
