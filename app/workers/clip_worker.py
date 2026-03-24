"""Worker assíncrono de clipagem.

Pode ser executado com RQ usando REDIS_URL quando quiser processar tarefas pesadas
(transcrição, IA, classificação de melhores momentos).
"""

from app.core.config import settings


def process_clip_job(channel_login: str, clip_id: int) -> None:
    print(
        f"[worker] Processando clip={clip_id} do canal={channel_login} "
        f"(redis={bool(settings.redis_url)})"
    )
