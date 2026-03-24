from pydantic import BaseModel, Field


class ClipEventIn(BaseModel):
    channel_login: str
    events_last_minute: int = Field(ge=0)
    baseline_events: int = Field(ge=1)


class ClipSuggestionOut(BaseModel):
    score: int
    reason: str
    suggested_title: str

    class Config:
        from_attributes = True
