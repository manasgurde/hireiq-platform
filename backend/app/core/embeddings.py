"""
Embeddings module — Phase 7: Vector Search
Wraps the Google Gemini Embeddings API with Redis caching.
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Optional

import httpx

from app.core.config import settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

CACHE_TTL = 60 * 60 * 24 * 7  # 7 days — embeddings are stable


def _cache_key(text: str) -> str:
    """Deterministic cache key from input text."""
    digest = hashlib.sha256(text.encode()).hexdigest()
    return f"embedding:gemini:v1:{digest}"


async def get_embedding(text: str) -> Optional[list[float]]:
    """
    Return a 768-dim embedding vector for *text*.
    Results are cached in Redis for 7 days.
    Returns None if Gemini is not configured or if the call fails.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — embeddings disabled")
        return None

    # Normalise whitespace
    text = " ".join(text.split())[:8000]  # keep within token budget

    cache_key = _cache_key(text)
    redis = await get_redis()

    # Try cache
    if redis:
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

    # Call Gemini Embeddings API
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/{settings.EMBEDDING_MODEL}:embedContent",
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": settings.GEMINI_API_KEY,
                },
                json={
                    "model": settings.EMBEDDING_MODEL,
                    "content": {
                        "parts": [{"text": text}]
                    }
                },
            )
            resp.raise_for_status()
            vector: list[float] = resp.json()["embedding"]["values"]
    except Exception as exc:
        logger.error("Embedding API call failed: %s", exc)
        return None

    # Store in cache
    if redis:
        await redis.setex(cache_key, CACHE_TTL, json.dumps(vector))

    return vector


async def get_embeddings_batch(texts: list[str]) -> list[Optional[list[float]]]:
    """
    Batch-embed up to 100 texts in a single API call.
    Individual cache misses are collected, sent in one request, then cached.
    """
    if not settings.GEMINI_API_KEY or not texts:
        return [None] * len(texts)

    redis = await get_redis()
    results: list[Optional[list[float]]] = [None] * len(texts)
    miss_indices: list[int] = []
    miss_texts: list[str] = []

    for i, text in enumerate(texts):
        text = " ".join(text.split())[:8000]
        key = _cache_key(text)
        if redis:
            cached = await redis.get(key)
            if cached:
                results[i] = json.loads(cached)
                continue
        miss_indices.append(i)
        miss_texts.append(text)

    if miss_texts:
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/{settings.EMBEDDING_MODEL}:batchEmbedContents",
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": settings.GEMINI_API_KEY,
                    },
                    json={
                        "requests": [
                            {
                                "model": settings.EMBEDDING_MODEL,
                                "content": {
                                    "parts": [{"text": t}]
                                }
                            } for t in miss_texts
                        ]
                    },
                )
                resp.raise_for_status()
                vectors = [item["values"] for item in resp.json()["embeddings"]]
        except Exception as exc:
            logger.error("Batch embedding call failed: %s", exc)
            vectors = [None] * len(miss_texts)  # type: ignore[list-item]

        for idx, (orig_i, text, vec) in enumerate(zip(miss_indices, miss_texts, vectors)):
            results[orig_i] = vec
            if redis and vec is not None:
                await redis.setex(_cache_key(text), CACHE_TTL, json.dumps(vec))

    return results


def build_profile_text(bio: str | None, skills: list[str]) -> str:
    """Create a rich text representation of a candidate profile for embedding."""
    parts: list[str] = []
    if bio:
        parts.append(bio)
    if skills:
        parts.append("Skills: " + ", ".join(skills))
    return " | ".join(parts) if parts else "candidate"


def build_job_text(title: str, description: str, skills: list[str], location: str) -> str:
    """Create a rich text representation of a job posting for embedding."""
    parts = [f"Job: {title}", f"Location: {location}"]
    if skills:
        parts.append("Required skills: " + ", ".join(skills))
    parts.append(description[:2000])
    return " | ".join(parts)

