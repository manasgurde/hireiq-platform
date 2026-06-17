from typing import List, Optional
from pydantic import BaseModel, computed_field


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: List[str] = []

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def completion_percentage(self) -> int:
        """Calculate profile completion score.

        Weights:
            avatar_url: 20%
            bio: 30%
            skills (at least 1): 50%
        """
        score = 0
        if self.avatar_url:
            score += 20
        if self.bio and self.bio.strip():
            score += 30
        if self.skills:
            score += 50
        return score
