import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.file_storage import FileRecord

router = APIRouter(prefix="/files", tags=["Files"])


@router.get("/{file_id}")
async def serve_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Serve a stored file from PostgreSQL as a binary response."""
    result = await db.execute(select(FileRecord).where(FileRecord.id == file_id))
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")

    return Response(
        content=record.file_data,
        media_type=record.content_type,
        headers={
            "Content-Disposition": f'inline; filename="{record.filename}"',
            "Content-Length": str(record.file_size),
        },
    )
