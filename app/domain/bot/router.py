from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_channel_owner
from app.core.database import get_db
from app.domain.bot.schemas import CommandCreate, CommandOut
from app.domain.bot.service import BotService

router = APIRouter(prefix="/bot", tags=["bot"])
service = BotService()


@router.get("/{channel_login}/commands", response_model=list[CommandOut])
def list_commands(
    channel_login: str,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.list_commands(db, channel_login)


@router.post("/{channel_login}/commands", response_model=CommandOut)
def create_command(
    channel_login: str,
    payload: CommandCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.upsert_command(db, channel_login, payload)
