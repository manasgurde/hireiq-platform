from typing import List
from pydantic import BaseModel

class ParseRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    organizations: List[str]
    dates: List[str]
    skills: List[str]
