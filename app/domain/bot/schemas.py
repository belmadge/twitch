from pydantic import BaseModel, Field


class CommandCreate(BaseModel):
    trigger: str = Field(pattern=r"^![a-z0-9_]+$")
    response_text: str = Field(min_length=2, max_length=500)


class CommandOut(BaseModel):
    trigger: str
    response_text: str

    class Config:
        from_attributes = True
