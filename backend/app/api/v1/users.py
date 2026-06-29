from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.file_storage import FileRecord
from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/users", tags=["Users"])


async def _get_or_create_profile(user: User, db: AsyncSession) -> Profile:
    """Fetch the user's profile, creating an empty one if it doesn't exist."""
    result = await db.execute(select(Profile).where(Profile.id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(id=user.id, bio=None, avatar_url=None, skills=[], phone_number=None, location=None)
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
    resp = ProfileResponse.model_validate(profile)
    resp.full_name = current_user.full_name
    return resp


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
    if body.phone_number is not None:
        profile.phone_number = body.phone_number
    if body.location is not None:
        profile.location = body.location
    if body.date_of_birth is not None:
        profile.date_of_birth = body.date_of_birth
    if body.linkedin_url is not None:
        profile.linkedin_url = body.linkedin_url
    if body.github_url is not None:
        profile.github_url = body.github_url
        
    if body.full_name is not None:
        current_user.full_name = body.full_name

    await db.commit()
    await db.refresh(profile)
    await db.refresh(current_user)
    
    # We should return a dict or object that matches ProfileResponse, but Profile doesn't have full_name.
    # ProfileResponse only cares about Profile fields.
    resp = ProfileResponse.model_validate(profile)
    resp.full_name = current_user.full_name
    return resp


# ---------------------------------------------------------------------------
# POST /users/avatar (HIQ-023)
# ---------------------------------------------------------------------------
@router.post("/avatar", response_model=ProfileResponse)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Upload avatar, store raw bytes in PostgreSQL, save URL reference in profile."""
    allowed = {"image/jpeg", "image/png", "image/webp"}
    content_type = file.content_type or ""
    if content_type not in allowed:
        from fastapi import status as s
        raise HTTPException(status_code=s.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, or WebP images allowed.")

    file_data = await file.read()
    if len(file_data) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 2 MB.")

    import uuid
    record = FileRecord(
        id=uuid.uuid4(),
        filename=file.filename or "avatar.jpg",
        content_type=content_type,
        file_data=file_data,
        file_size=len(file_data),
    )
    db.add(record)
    await db.flush()

    profile = await _get_or_create_profile(current_user, db)
    profile.avatar_url = f"/v1/files/{record.id}"

    await db.commit()
    await db.refresh(profile)
    return ProfileResponse.model_validate(profile)
