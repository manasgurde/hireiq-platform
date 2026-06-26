"""
Phase 9 — Company Management API
"""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.core.s3 import upload_avatar
from app.models.company import Company, CompanyMember
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["Companies"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None


class CompanyUpdate(BaseModel):
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None


class CompanyOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    industry: Optional[str]
    size: Optional[str]

    class Config:
        from_attributes = True


class MemberOut(BaseModel):
    user_id: uuid.UUID
    role: str

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_company_or_404(company_id: uuid.UUID, db: AsyncSession) -> Company:
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


async def _require_company_admin(company_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> None:
    result = await db.execute(
        select(CompanyMember).where(
            CompanyMember.company_id == company_id,
            CompanyMember.user_id == user_id,
            CompanyMember.role.in_(["owner", "admin"]),
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Insufficient company permissions")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=CompanyOut, status_code=201)
async def create_company(
    body: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    company = Company(**body.model_dump())
    db.add(company)
    await db.flush()
    # Make creator the owner
    member = CompanyMember(company_id=company.id, user_id=current_user.id, role="owner")
    db.add(member)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return await _get_company_or_404(company_id, db)


@router.put("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: uuid.UUID,
    body: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    await _require_company_admin(company_id, current_user.id, db)
    company = await _get_company_or_404(company_id, db)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(company, field, value)
    await db.commit()
    await db.refresh(company)
    return company


@router.post("/{company_id}/logo", response_model=CompanyOut)
async def upload_company_logo(
    company_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    await _require_company_admin(company_id, current_user.id, db)
    company = await _get_company_or_404(company_id, db)
    logo_url = await upload_avatar(file, company.id)  # reuse S3 upload helper
    company.logo_url = logo_url
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/{company_id}/members", response_model=list[MemberOut])
async def list_members(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(CompanyMember).where(CompanyMember.company_id == company_id)
    )
    members = result.scalars().all()
    return [MemberOut(user_id=m.user_id, role=m.role) for m in members]


@router.post("/{company_id}/members", status_code=201)
async def invite_member(
    company_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str = "member",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    await _require_company_admin(company_id, current_user.id, db)
    member = CompanyMember(company_id=company_id, user_id=user_id, role=role)
    db.add(member)
    await db.commit()
    return {"success": True}


@router.delete("/{company_id}/members/{user_id}")
async def remove_member(
    company_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    await _require_company_admin(company_id, current_user.id, db)
    from sqlalchemy import delete
    await db.execute(
        delete(CompanyMember).where(
            CompanyMember.company_id == company_id,
            CompanyMember.user_id == user_id,
        )
    )
    await db.commit()
    return {"success": True}
