from pydantic import BaseModel

from app.schemas.site import SiteSchema


class ChatCommandIn(BaseModel):
    message: str


class ChatCommandOut(BaseModel):
    reply: str
    applied: bool
    site_data: SiteSchema
