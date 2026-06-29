import json
import structlog
from google import genai
from pydantic import BaseModel, Field
from app.core.config import settings

logger = structlog.get_logger(__name__)

class ResumeEvaluation(BaseModel):
    candidate_name: str | None = Field(default=None, description="The full name of the candidate extracted from the resume.")
    extracted_skills: list[str] = Field(description="A list of technical and soft skills extracted from the resume.", default_factory=list)
    rating: int = Field(description="A score out of 100 representing the overall quality and ATS compatibility of the resume.")
    good_points: list[str] = Field(description="A list of 3-5 strong points about the resume.")
    bad_points: list[str] = Field(description="A list of 1-3 weak points or areas for improvement.")
    suggestions: list[str] = Field(description="A list of 2-4 actionable suggestions to improve the resume.")

async def evaluate_resume(raw_text: str) -> dict:
    """
    Evaluates a candidate's resume text using Gemini and returns a structured JSON evaluation.
    """
    if not raw_text or len(raw_text.strip()) < 50:
        return {
            "candidate_name": None,
            "extracted_skills": [],
            "rating": 0,
            "good_points": [],
            "bad_points": ["Resume is too short or could not be parsed."],
            "suggestions": ["Please upload a standard text-based PDF resume."]
        }
        
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Cannot evaluate resume.")
            return None

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert technical recruiter and ATS system. Evaluate the following resume text and provide a structured JSON assessment.
        Consider formatting, action verbs, measurable achievements, and clarity.
        
        Resume Text:
        {raw_text[:8000]}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ResumeEvaluation,
            }
        )
        
        return json.loads(response.text)
    except Exception as e:
        logger.error("resume_evaluation_failed", error=str(e))
        return None
class ApplicationEvaluation(BaseModel):
    overall_score: float = Field(description="A score from 0.0 to 1.0 representing the overall match of the candidate for the job.")
    experience_score: float = Field(description="A score from 0.0 to 1.0 representing how well the candidate's experience matches the job.")
    skills_score: float = Field(description="A score from 0.0 to 1.0 representing how well the candidate's skills match the job requirements.")

async def evaluate_application(resume_text: str, job_title: str, job_description: str, job_skills: list[str]) -> dict | None:
    """
    Evaluates a candidate's resume against a specific job posting.
    Returns granular AI match scores.
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return {
            "overall_score": 0.0,
            "experience_score": 0.0,
            "skills_score": 0.0
        }
        
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Cannot evaluate application.")
            return None

        client = genai.Client(api_key=api_key)
        
        skills_str = ", ".join(job_skills) if job_skills else "None specified"
        
        prompt = f"""
        You are an expert technical recruiter and ATS system.
        Evaluate the following candidate resume against the provided Job Description.
        
        Provide 3 granular match scores from 0.0 to 1.0 (where 1.0 is a perfect match).
        
        JOB TITLE: {job_title}
        JOB SKILLS REQUIRED: {skills_str}
        
        JOB DESCRIPTION:
        {job_description}
        
        CANDIDATE RESUME:
        {resume_text[:8000]}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ApplicationEvaluation,
            }
        )
        
        return json.loads(response.text)
    except Exception as e:
        logger.error("application_evaluation_failed", error=str(e))
        return None
