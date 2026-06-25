from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aioboto3
from botocore.config import Config
from fastapi import HTTPException, UploadFile, status
import uuid

from app.core.config import settings

# Allowed MIME types and max size for avatar uploads
AVATAR_ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB
AVATAR_S3_PREFIX = "avatars"

_s3_session = aioboto3.Session(
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


@asynccontextmanager
async def get_s3_client():
    """Context manager that yields an async S3 client."""
    s3_config = Config(signature_version="s3v4")
    endpoint = f"https://s3.{settings.AWS_REGION}.amazonaws.com" if settings.AWS_REGION else None
    async with _s3_session.client("s3", config=s3_config, endpoint_url=endpoint) as client:
        yield client


def _get_extension(content_type: str) -> str:
    mapping = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    return mapping.get(content_type, "bin")


async def upload_avatar(file: UploadFile, user_id: uuid.UUID) -> str:
    """Validate and upload an avatar file to S3.

    Returns:
        str: The public S3 URL of the uploaded avatar.

    Raises:
        HTTPException 400: If the file type is not allowed or exceeds size limit.
        HTTPException 503: If S3 upload fails.
    """
    # Validate MIME type
    content_type = file.content_type or ""
    if content_type not in AVATAR_ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' not allowed. Use JPEG, PNG, or WebP.",
        )

    # Read and validate size
    file_data = await file.read()
    if len(file_data) > AVATAR_MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is too large. Maximum size is {AVATAR_MAX_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    if not settings.S3_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not configured.",
        )

    # Build the S3 key
    ext = _get_extension(content_type)
    s3_key = f"{AVATAR_S3_PREFIX}/{user_id}.{ext}"

    try:
        async with get_s3_client() as s3:
            await s3.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_data,
                ContentType=content_type,
            )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Avatar upload failed. Please try again later.",
        ) from exc

    # Return the public URL
    return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"


async def generate_presigned_upload_url(
    object_name: str, expiration_seconds: int = 3600
) -> str:
    """Generate a presigned URL for direct S3 PUT uploads.

    Args:
        object_name: The S3 key (path) to upload to.
        expiration_seconds: How long the URL is valid.

    Returns:
        str: The presigned URL.
    """
    if not settings.S3_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not configured.",
        )

    async with get_s3_client() as s3:
        presigned_url = await s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": object_name,
                "ContentType": "application/pdf",
            },
            ExpiresIn=expiration_seconds,
        )
        return presigned_url


async def get_s3_object_bytes(object_name: str) -> bytes:
    """Fetch an object from S3 as raw bytes.

    Args:
        object_name: The S3 key to fetch.

    Returns:
        bytes: The raw content of the object.
    """
    if not settings.S3_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not configured.",
        )

    try:
        async with get_s3_client() as s3:
            response = await s3.get_object(
                Bucket=settings.S3_BUCKET_NAME, Key=object_name
            )
            # aiobotocore uses streaming body, must be awaited/read
            async with response["Body"] as stream:
                return await stream.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not retrieve file from storage: {exc}",
        ) from exc


async def generate_presigned_download_url(
    object_name: str, expiration_seconds: int = 3600
) -> str:
    """Generate a presigned URL for direct S3 GET downloads.

    Args:
        object_name: The S3 key (path) to download.
        expiration_seconds: How long the URL is valid.

    Returns:
        str: The presigned URL.
    """
    if not settings.S3_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not configured.",
        )

    async with get_s3_client() as s3:
        presigned_url = await s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": object_name,
            },
            ExpiresIn=expiration_seconds,
        )
        return presigned_url

