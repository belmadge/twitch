from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

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

cors_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
allowed_hosts = [host.strip() for host in settings.allowed_hosts.split(",") if host.strip()]

if allowed_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.mount("/frontend", StaticFiles(directory="app/frontend"), name="frontend")


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
    return response


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
