from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, engine
from app.domain.auth.router import router as auth_router
from app.domain.billing.router import router as billing_router
from app.domain.bot.router import router as bot_router
from app.domain.clips.router import router as clips_router
from app.domain.crm.router import router as crm_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(title=settings.app_name, lifespan=lifespan)


@app.get("/")
def root():
    return {
        "project": settings.app_name,
        "objectives": {
            "bot": "Automação premium de chat para streamers",
            "clips": "Detecção de highlights para conteúdo curto",
            "crm": "Retenção e engajamento com segmentação de comunidade",
            "safety": "Sinalização de usuários com comportamento ofensivo recorrente",
        },
    }


@app.get("/health")
def health():
    return {"ok": True, "env": settings.app_env}


app.include_router(auth_router, prefix="/api")
app.include_router(bot_router, prefix="/api")
app.include_router(clips_router, prefix="/api")
app.include_router(crm_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
