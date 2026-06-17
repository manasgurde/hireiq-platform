from sentence_transformers import util


def compute_semantic_score(
    candidate_answer: str, ideal_answer: str, sbert_model
) -> float:
    """Evaluate the semantic similarity of an interview answer.

    Args:
        candidate_answer: The text submitted by the candidate.
        ideal_answer: The rubric/ideal answer text.
        sbert_model: The loaded SentenceTransformer model.

    Returns:
        float: A score between -1.0 and 1.0 (usually 0.0 to 1.0) indicating semantic similarity.
    """
    if not candidate_answer.strip() or not ideal_answer.strip():
        return 0.0

    try:
        # Encode both sentences to dense vector embeddings
        embeddings1 = sbert_model.encode(candidate_answer, convert_to_tensor=True)
        embeddings2 = sbert_model.encode(ideal_answer, convert_to_tensor=True)

        # Compute cosine similarity using SBERT util
        cosine_scores = util.cos_sim(embeddings1, embeddings2)
        score = float(cosine_scores[0][0].item())
        
        # Clamp negative scores to 0.0 for business logic simplicity
        if score < 0.0:
            score = 0.0

        return round(score, 4)
    except Exception:
        return 0.0
