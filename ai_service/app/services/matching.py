from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_match_score(resume_text: str, job_description: str) -> float:
    """Compute the TF-IDF cosine similarity between a resume and a job description.

    Args:
        resume_text: The extracted raw text of the candidate's resume.
        job_description: The job posting text (title + description).

    Returns:
        float: A score between 0.0 and 1.0 representing the structural text match.
    """
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    # Set up vectorizer to remove standard English stop words and lowercase the text
    vectorizer = TfidfVectorizer(stop_words="english")

    try:
        # Fit & transform both documents
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])

        # Compute the cosine similarity matrix
        similarity_matrix = cosine_similarity(tfidf_matrix)

        # Extract the score between document 0 and document 1
        score = float(similarity_matrix[0, 1])
        
        # Round for cleaner API responses
        return round(score, 4)
    except Exception:
        # Fallback if vocabulary is entirely empty after stop-word removal
        return 0.0
