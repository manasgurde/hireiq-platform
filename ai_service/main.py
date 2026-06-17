from contextlib import asynccontextmanager
from fastapi import FastAPI
import spacy

from app.schemas.parser import ParseRequest, ParseResponse
from app.services.parser import parse_resume_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models into memory at startup
    print("Loading ML models into memory...")

    # Load spaCy
    try:
        nlp = spacy.load("en_core_web_sm")
        ruler = nlp.add_pipe("entity_ruler", before="ner")
        
        # Predefined skill vocabulary/patterns
        skills_patterns = [
            {"label": "SKILL", "pattern": "Python"},
            {"label": "SKILL", "pattern": "FastAPI"},
            {"label": "SKILL", "pattern": "React"},
            {"label": "SKILL", "pattern": "SQL"},
            {"label": "SKILL", "pattern": "TypeScript"},
            {"label": "SKILL", "pattern": "AWS"},
            {"label": "SKILL", "pattern": "Machine Learning"},
            {"label": "SKILL", "pattern": "Docker"},
        ]
        ruler.add_patterns(skills_patterns)
        app.state.nlp = nlp
        print("spaCy model loaded successfully.")
    except OSError:
        print("ERROR: en_core_web_sm model not found. Run: python -m spacy download en_core_web_sm")
        app.state.nlp = None

    # TODO: Load SBERT in Phase 05-02
    
    yield

    # Clean up on shutdown
    print("Shutting down AI service...")
    app.state.nlp = None


app = FastAPI(
    title="HireIQ AI Service",
    description="Microservice for resume parsing, job matching, and interview scoring.",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "models_loaded": {
            "spacy": app.state.nlp is not None,
        }
    }


@app.post("/parse", response_model=ParseResponse)
def parse_resume(request: ParseRequest):
    if not app.state.nlp:
        return ParseResponse(organizations=[], dates=[], skills=[])
        
    result = parse_resume_text(request.text, app.state.nlp)
    return ParseResponse(**result)
