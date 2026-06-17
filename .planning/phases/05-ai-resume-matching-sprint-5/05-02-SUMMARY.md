# Plan 05-02 Summary: Scoring & Interview Engines

## Execution Notes
- Created `ai_service/app/schemas/scoring.py` containing request/response schemas for `/match` and `/evaluate-interview`.
- Implemented `ai_service/app/services/matching.py` leveraging `scikit-learn`'s `TfidfVectorizer` to strip stop-words and compute `cosine_similarity` between the candidate's raw resume string and the job posting's string.
- Implemented `ai_service/app/services/interview.py` leveraging `sentence-transformers` and `util.cos_sim` to compare a candidate's mock-interview textual answer against an ideal answer. Clamped negative scores to 0.0 for easier frontend UX.
- Updated `ai_service/main.py` lifespan to preload the `all-MiniLM-L6-v2` SBERT model into `app.state.sbert`.
- Registered `POST /match` and `POST /evaluate-interview` in the FastAPI router.

## Deviations
- Clamped negative SBERT similarities to 0.0, as mathematically they don't add value to the ATS user interface (anything <= 0.0 is effectively completely dissimilar).

## Completion State
- [x] All tasks executed.
