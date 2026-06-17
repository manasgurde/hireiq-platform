def parse_resume_text(text: str, nlp_model) -> dict:
    """Parse resume text using the loaded spaCy model to extract entities.

    Extracts:
      - ORG: Past employers, schools
      - DATE: Tenures, graduation dates
      - SKILL: Custom entity pattern for professional skills

    Args:
        text: Raw resume text.
        nlp_model: The loaded spaCy language model.

    Returns:
        dict: A dictionary containing lists of organizations, dates, and skills.
    """
    doc = nlp_model(text)

    organizations = set()
    dates = set()
    skills = set()

    for ent in doc.ents:
        if ent.label_ == "ORG":
            organizations.add(ent.text.strip())
        elif ent.label_ == "DATE":
            dates.add(ent.text.strip())
        elif ent.label_ == "SKILL":
            skills.add(ent.text.strip())

    return {
        "organizations": sorted(list(organizations)),
        "dates": sorted(list(dates)),
        "skills": sorted(list(skills)),
    }
