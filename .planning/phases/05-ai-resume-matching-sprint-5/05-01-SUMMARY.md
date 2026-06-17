# Plan 05-01 Summary: AI Service & spaCy

## Execution Notes
- Initialized the `ai_service` FastAPI microservice to run on port 8001.
- Created `ai_service/requirements.txt` with `spacy`, `scikit-learn`, `sentence-transformers`, `fastapi`, and `uvicorn`.
- Designed `main.py` with an async `@asynccontextmanager` `lifespan` function. It safely loads the `en_core_web_sm` model into memory precisely once on startup, storing it in `app.state.nlp`.
- Attached a custom `EntityRuler` to the spaCy pipeline to extract a predefined taxonomy of technical `SKILL` entities.
- Implemented `ai_service/app/services/parser.py` extracting `ORG`, `DATE`, and `SKILL` entities, deduplicating them using sets.
- Exposed `POST /parse` returning the structured JSON.

## Deviations
- Added a `/health` check endpoint for easy docker/container orchestration monitoring of model states.

## Completion State
- [x] All tasks executed.
