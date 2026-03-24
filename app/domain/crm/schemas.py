from pydantic import BaseModel, Field


class ViewerEventIn(BaseModel):
    channel_login: str
    username: str


class ViewerOut(BaseModel):
    username: str
    points: int
    segment: str

    class Config:
        from_attributes = True


class CampaignCreate(BaseModel):
    name: str = Field(min_length=2)
    segment: str = Field(pattern=r"^(new|casual|core|vip)$")
    reward_points: int = Field(gt=0, le=1000)
    message: str = Field(min_length=2)


class CampaignOut(BaseModel):
    id: int
    name: str
    segment: str
    reward_points: int
    message: str

    class Config:
        from_attributes = True
