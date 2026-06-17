import json
import httpx
import structlog
from redis.asyncio import Redis

logger = structlog.get_logger(__name__)

# Hardcoded for now. In a real environment, this would come from Settings.
AI_SERVICE_URL = "http://localhost:8001"
TIMEOUT_SECONDS = 10.0


class AIServiceClient:
    """Client for communicating with the ML microservice with fallbacks and caching."""

    def __init__(self, redis: Redis | None = None):
        self.redis = redis
        self.client = httpx.AsyncClient(
            base_url=AI_SERVICE_URL, timeout=TIMEOUT_SECONDS
        )

    async def get_matching_score(
        self, resume_id: str, job_id: str, resume_text: str, job_text: str
    ) -> float:
        """Compute TF-IDF cosine similarity via the AI service, cached in Redis."""
        cache_key = f"score:matching:{resume_id}:{job_id}"

        # 1. Check Cache
        if self.redis:
            try:
                cached_score = await self.redis.get(cache_key)
                if cached_score:
                    return float(cached_score)
            except Exception as e:
                logger.warning("redis_cache_error", error=str(e), key=cache_key)

        # 2. Call AI Service
        score = 0.0
        try:
            response = await self.client.post(
                "/match",
                json={"resume_text": resume_text, "job_text": job_text},
            )
            response.raise_for_status()
            score = response.json().get("score", 0.0)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.error("ai_service_match_failed", error=str(e))
            # Fallback to 0.0
            score = 0.0

        # 3. Cache the successful or fallback result
        if self.redis:
            try:
                # Cache for 24 hours
                await self.redis.setex(cache_key, 86400, str(score))
            except Exception as e:
                logger.warning("redis_cache_set_error", error=str(e), key=cache_key)

        return float(score)

    async def extract_resume_entities(self, text: str) -> dict:
        """Extract ORG, DATE, and SKILL entities using spaCy via the AI service."""
        try:
            response = await self.client.post("/parse", json={"text": text})
            response.raise_for_status()
            return response.json()
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.error("ai_service_parse_failed", error=str(e))
            # Safe Fallback
            return {"organizations": [], "dates": [], "skills": []}

    async def evaluate_interview(
        self, candidate_answer: str, ideal_answer: str
    ) -> float:
        """Evaluate semantic similarity using SBERT via the AI service."""
        try:
            response = await self.client.post(
                "/evaluate-interview",
                json={
                    "candidate_answer": candidate_answer,
                    "ideal_answer": ideal_answer,
                },
            )
            response.raise_for_status()
            return float(response.json().get("semantic_score", 0.0))
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.error("ai_service_evaluate_failed", error=str(e))
            return 0.0

    async def close(self):
        """Close the underlying HTTPX client."""
        await self.client.aclose()


# Singleton pattern dependency injection helper
async def get_ai_client() -> AIServiceClient:
    from app.core.redis import get_redis_client
    redis = await get_redis_client()
    client = AIServiceClient(redis=redis)
    try:
        yield client
    finally:
        await client.close()
