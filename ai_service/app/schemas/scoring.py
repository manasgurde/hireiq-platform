from pydantic import BaseModel


class MatchRequest(BaseModel):
    resume_text: str
    job_text: str


class MatchResponse(BaseModel):
    score: float


class EvaluateRequest(BaseModel):
    candidate_answer: str
    ideal_answer: str


class EvaluateResponse(BaseModel):
    semantic_score: float
