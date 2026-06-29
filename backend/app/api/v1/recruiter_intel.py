"""
Phase 8 — Recruiter Intelligence API
Bookmarks, saved searches, talent pools, notes, and collaboration.
"""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_recruiter
from app.models.recruiter_intel import (
    Bookmark, SavedSearch, TalentPool, TalentPoolMember,
    RecruiterNote,
)
from app.models.user import User

router = APIRouter(prefix="/recruiter", tags=["Recruiter Intelligence"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class BookmarkCreate(BaseModel):
    candidate_id: uuid.UUID
    notes: Optional[str] = None


class BookmarkOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    notes: Optional[str]

    class Config:
        from_attributes = True


class SavedSearchCreate(BaseModel):
    name: str
    query_json: dict


class SavedSearchOut(BaseModel):
    id: uuid.UUID
    name: str
    query_json: dict

    class Config:
        from_attributes = True


class TalentPoolCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TalentPoolOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    candidate_id: uuid.UUID
    content: str


class NoteOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    content: str

    class Config:
        from_attributes = True


class CompareRequest(BaseModel):
    candidate_ids: list[uuid.UUID]


# ── Bookmarks ─────────────────────────────────────────────────────────────────

@router.post("/bookmarks", response_model=BookmarkOut, status_code=201)
async def create_bookmark(
    body: BookmarkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    existing = await db.execute(
        select(Bookmark).where(
            Bookmark.recruiter_id == current_user.id,
            Bookmark.candidate_id == body.candidate_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already bookmarked")
    bm = Bookmark(recruiter_id=current_user.id, candidate_id=body.candidate_id, notes=body.notes)
    db.add(bm)
    await db.commit()
    await db.refresh(bm)
    return bm


@router.get("/bookmarks", response_model=list[BookmarkOut])
async def list_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    result = await db.execute(select(Bookmark).where(Bookmark.recruiter_id == current_user.id))
    return result.scalars().all()


@router.delete("/bookmarks/{candidate_id}")
async def remove_bookmark(
    candidate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    await db.execute(
        delete(Bookmark).where(
            Bookmark.recruiter_id == current_user.id,
            Bookmark.candidate_id == candidate_id,
        )
    )
    await db.commit()
    return {"success": True}


# ── Saved Searches ────────────────────────────────────────────────────────────

@router.post("/saved-searches", response_model=SavedSearchOut, status_code=201)
async def create_saved_search(
    body: SavedSearchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    ss = SavedSearch(recruiter_id=current_user.id, name=body.name, query_json=body.query_json)
    db.add(ss)
    await db.commit()
    await db.refresh(ss)
    return ss


@router.get("/saved-searches", response_model=list[SavedSearchOut])
async def list_saved_searches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    result = await db.execute(select(SavedSearch).where(SavedSearch.recruiter_id == current_user.id))
    return result.scalars().all()


@router.delete("/saved-searches/{search_id}")
async def delete_saved_search(
    search_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    await db.execute(
        delete(SavedSearch).where(SavedSearch.id == search_id, SavedSearch.recruiter_id == current_user.id)
    )
    await db.commit()
    return {"success": True}


# ── Talent Pools ──────────────────────────────────────────────────────────────

@router.post("/talent-pools", response_model=TalentPoolOut, status_code=201)
async def create_talent_pool(
    body: TalentPoolCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    pool = TalentPool(recruiter_id=current_user.id, name=body.name, description=body.description)
    db.add(pool)
    await db.commit()
    await db.refresh(pool)
    return pool


@router.get("/talent-pools", response_model=list[TalentPoolOut])
async def list_talent_pools(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    result = await db.execute(select(TalentPool).where(TalentPool.recruiter_id == current_user.id))
    return result.scalars().all()


@router.post("/talent-pools/{pool_id}/members", status_code=201)
async def add_pool_member(
    pool_id: uuid.UUID,
    candidate_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    member = TalentPoolMember(pool_id=pool_id, candidate_id=candidate_id)
    db.add(member)
    await db.commit()
    return {"success": True}


# ── Notes ─────────────────────────────────────────────────────────────────────

@router.post("/notes", response_model=NoteOut, status_code=201)
async def create_note(
    body: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    note = RecruiterNote(recruiter_id=current_user.id, candidate_id=body.candidate_id, content=body.content)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/notes/{candidate_id}", response_model=list[NoteOut])
async def get_notes(
    candidate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    result = await db.execute(
        select(RecruiterNote).where(
            RecruiterNote.recruiter_id == current_user.id,
            RecruiterNote.candidate_id == candidate_id,
        )
    )
    return result.scalars().all()


# ── Candidate Comparison ──────────────────────────────────────────────────────

@router.post("/compare")
async def compare_candidates(
    body: CompareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Any:
    from app.models.profile import Profile
    if len(body.candidate_ids) < 2 or len(body.candidate_ids) > 5:
        raise HTTPException(status_code=400, detail="Compare 2–5 candidates at a time")

    profiles = []
    for cid in body.candidate_ids:
        result = await db.execute(select(Profile).where(Profile.id == cid))
        p = result.scalar_one_or_none()
        if p:
            profiles.append({
                "candidate_id": str(cid),
                "bio": p.bio,
                "skills": p.skills or [],
                "avatar_url": p.avatar_url,
                "skill_count": len(p.skills or []),
            })

    # Compute skill overlap matrix
    skill_sets = [set(p["skills"]) for p in profiles]
    common_skills = sorted(set.intersection(*skill_sets)) if skill_sets else []

    return {
        "candidates": profiles,
        "common_skills": common_skills,
        "skill_overlap_matrix": [
            [len(a & b) for b in skill_sets] for a in skill_sets
        ],
    }
