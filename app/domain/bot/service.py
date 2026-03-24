from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.bot.models import BotCommand
from app.domain.bot.schemas import CommandCreate


class BotService:
    """Responsável por comandos premium de chat."""

    def list_commands(self, db: Session, channel_login: str) -> list[BotCommand]:
        query = select(BotCommand).where(BotCommand.channel_login == channel_login.lower())
        return list(db.scalars(query))

    def upsert_command(self, db: Session, channel_login: str, payload: CommandCreate) -> BotCommand:
        query = select(BotCommand).where(
            BotCommand.channel_login == channel_login.lower(),
            BotCommand.trigger == payload.trigger.lower(),
        )
        cmd = db.scalar(query)
        if cmd:
            cmd.response_text = payload.response_text
        else:
            cmd = BotCommand(
                channel_login=channel_login.lower(),
                trigger=payload.trigger.lower(),
                response_text=payload.response_text,
            )
            db.add(cmd)

        db.commit()
        db.refresh(cmd)
        return cmd
