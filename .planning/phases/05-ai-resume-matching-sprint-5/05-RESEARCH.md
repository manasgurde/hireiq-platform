# Phase 5: AI / ML System — Research

**Gathered:** 2026-06-17
**Phase:** 05-ai-resume-matching-sprint-5

---

## 1. ML Microservice Architecture

To prevent CPU-intensive machine learning tasks from blocking the asynchronous event loop of the main application, the AI/ML components are isolated into a standalone FastAPI microservice (`ai_service`) running on a separate port (e.g., `8001`).

### FastAPI Lifespan & Model Caching
Large models like SBERT and spaCy are loaded into memory once when the application starts using FastAPI's lifespan events. This prevents reloading them on every API request.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
import spacy
from sentence_transformers import SentenceTransformer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    print("Loading ML models into memory...")
    app.state.nlp = spacy.load("en_core_web_sm")
    app.state.sbert_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    yield
    # Clean up on shutdown
    app.state.nlp = None
    app.state.sbert_model = None

app = FastAPI(lifespan=lifespan)
```

### Core API Client with Fallbacks & Redis Caching
The Core Web API communicates with the AI microservice using `httpx.AsyncClient`. To ensure the core API remains resilient:
1. **Timeouts**: Configured with a strict 10-second timeout.
2. **Error Handling**: Network errors or timeouts are logged silently, returning a safe default (fallback matching score of `0.0` or empty parsed entity arrays).
3. **Redis Caching**: Similarity scores are cached in Redis under keys like `score:matching:{resume_id}:{job_id}` to avoid redundant computations.

---

## 2. spaCy NER (Resume Parsing)

Named Entity Recognition (NER) is used to extract entities such as organizations, dates (for experience/tenure), and skills from resume text.

### Extracting standard and custom entities
By default, `en_core_web_sm` does not contain a specific label for software/professional `SKILL` entities. We solve this by adding a custom `EntityRuler` before the main `ner` component in the pipeline.

```python
import spacy
from spacy.pipeline import EntityRuler

def setup_custom_nlp_pipeline():
    nlp = spacy.load("en_core_web_sm")
    ruler = nlp.add_pipe("entity_ruler", before="ner")
    
    # Predefined skill vocabulary/patterns
    skills_patterns = [
        {"label": "SKILL", "pattern": "Python"},
        {"label": "SKILL", "pattern": "FastAPI"},
        {"label": "SKILL", "pattern": "React"},
        {"label": "SKILL", "pattern": "SQL"},
    ]
    ruler.add_patterns(skills_patterns)
    return nlp
```

---

## 3. TF-IDF Job Matching

For fast, keyword-weighted textual alignment matching between resumes and job descriptions, we use Scikit-Learn's `TfidfVectorizer` alongside `cosine_similarity`.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_tfidf_match(resume_text: str, job_description: str) -> float:
    # Set up vectorizer to remove standard English stop words and lowercase the text
    vectorizer = TfidfVectorizer(stop_words='english')
    
    # Fit & transform both documents
    tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
    
    # Compute the cosine similarity matrix
    similarity_matrix = cosine_similarity(tfidf_matrix)
    
    # Extract the score between document 0 and document 1
    score = float(similarity_matrix[0, 1])
    return round(score, 4)
```

---

## 4. SBERT Semantic Scoring

For deeper semantic understanding, such as evaluating open-ended interview responses against an ideal answer key, we use Sentence-BERT (`SBERT`). SBERT produces dense representations where sentences with similar semantic meanings have high cosine similarity.

```python
from sentence_transformers import util

def compute_semantic_score(candidate_answer: str, ideal_answer: str, sbert_model) -> float:
    # Encode both sentences to dense vector embeddings
    embeddings1 = sbert_model.encode(candidate_answer, convert_to_tensor=True)
    embeddings2 = sbert_model.encode(ideal_answer, convert_to_tensor=True)
    
    # Compute cosine similarity using SBERT util
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    score = float(cosine_scores[0][0].item())
    return round(score, 4)
```

---

## 5. Recommended Libraries

Packages needed in the `ai_service` environment:
```text
fastapi>=0.100.0
uvicorn>=0.23.0
spacy>=3.7.0,<3.8.0
scikit-learn>=1.3.0,<1.4.0
sentence-transformers>=3.0.0
```

*Note: The model pipeline `en_core_web_sm` must be downloaded via `python -m spacy download en_core_web_sm`.*
