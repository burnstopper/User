from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    user_id: int
