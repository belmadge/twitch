# Twitch Creator SaaS (Python)

Repositório reorganizado em **Python/FastAPI**, com separação clara por domínio e responsabilidade para as 3 partes do produto:

1. **Bot Premium** (automação de chat)
2. **Clipagem Automática** (highlights para Shorts/TikTok)
3. **CRM de Comunidade** (retenção e campanhas)

---

## Objetivo do projeto

Transformar livestream em negócio com 3 motores de receita/crescimento:

- **Bot:** monetização por assinatura de automação.
- **Clips:** geração de conteúdo para aquisição.
- **CRM:** retenção e reativação para aumentar LTV.

Veja também:
- `docs/PROJECT_OBJECTIVES.md`
- `docs/RESPONSIBILITIES.md`

---

## Estrutura organizada

```text
app/
  core/
    config.py
    database.py
    security.py
  api/
    deps.py
  domain/
    auth/
    bot/
    clips/
    crm/
    billing/
  workers/
    clip_worker.py
  main.py

docs/
  PROJECT_OBJECTIVES.md
  RESPONSIBILITIES.md

tests_py/
  test_objectives.py
  test_clip_logic.py
```

Cada domínio possui:
- `models.py` (persistência)
- `schemas.py` (contratos)
- `service.py` (regras de negócio)
- `router.py` (API)

---

## Tecnologias

- FastAPI
- SQLAlchemy
- PostgreSQL (ou SQLite no dev)
- JWT (python-jose)
- Stripe
- Redis + RQ (worker opcional)
- Pytest

---

## Variáveis de ambiente

Use `.env.example` e ajuste os valores:

- `DATABASE_URL` (sugestão grátis: Supabase/Neon)
- `REDIS_URL` (sugestão grátis: Upstash)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`
- `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, etc.

---

## Como rodar

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --port 8000
```

Acesse:
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

---

## Endpoints principais

### Auth
- `GET /api/auth/twitch-url`
- `GET /api/auth/callback?code=...`

### Bot
- `GET /api/bot/{channel_login}/commands`
- `POST /api/bot/{channel_login}/commands`

### Clips
- `POST /api/clips/detect`
- `GET /api/clips/{channel_login}`

### CRM
- `POST /api/crm/viewer-event`
- `GET /api/crm/{channel_login}/viewers`
- `POST /api/crm/{channel_login}/campaigns`
- `POST /api/crm/{channel_login}/campaigns/{campaign_id}/apply`

### Billing
- `GET /api/billing/status`
- `POST /api/billing/{channel_login}/checkout`

---

## Segurança e responsabilidades

- JWT obrigatório para rotas protegidas.
- Ownership por canal (`require_channel_owner`).
- Regras de negócio isoladas por domínio (`service.py`).

---

## Testes

```bash
pytest
```

Testes iniciais cobrem:
- objetivos das 3 partes no endpoint raiz
- regra de detecção de pico para clipagem

---

## Nota sobre base anterior

A base TypeScript antiga permanece no repositório como legado de transição.
A implementação principal recomendada agora é a versão Python em `app/`.
# Twitch Chat Premium SaaS (Starter)

Projeto inicial para um SaaS de bot premium para streamers da Twitch.

## Funcionalidades iniciais

- Login OAuth com Twitch.
- Bot conecta no canal do streamer após autorização.
- Comandos customizados por canal (`!discord`, `!regras`, etc).
- Placeholder `{user}` em respostas (ex: `Olá, {user}!`).
- Endpoint simples para criar comandos via API.

## Stack

- Node.js + TypeScript
- Express
- tmi.js

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha as variáveis.

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Acesse `http://localhost:3000`.

## Endpoints

- `GET /` home.
- `GET /auth/twitch` inicia OAuth.
- `GET /auth/callback` callback OAuth.
- `GET /dashboard/:login` dashboard básico.
- `POST /api/channels/:login/commands` cria/atualiza comando.
- `GET /health` healthcheck.

Exemplo para criar comando:

```bash
curl -X POST http://localhost:3000/api/channels/SEU_LOGIN/commands \
  -H "content-type: application/json" \
  -d '{"trigger":"!discord","response":"Entre no Discord: discord.gg/seuconvite"}'
```

## Próximos passos para monetizar

- Adicionar autenticação de sessão e múltiplos usuários.
- Persistência em banco (PostgreSQL) em vez de memória.
- Assinatura (Stripe/Mercado Pago) para limites por plano.
- Painel frontend (Next.js) com analytics e automações.
- Logs e observabilidade.
