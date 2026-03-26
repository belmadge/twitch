# Twitch Creator SaaS (FastAPI)

Projeto em **Python/FastAPI** para creators com 4 domínios:

1. **Auth** (OAuth Twitch + JWT)
2. **Bot** (comandos e automação)
3. **Clips** (detecção de highlights)
4. **CRM** (engajamento e segmentação)
5. **Billing** (assinatura/checkout)

---

## 1) Registrar o aplicativo na Twitch

Antes de rodar o projeto, registre seu app no **Twitch Developer Console**:

1. Faça login no console da Twitch (com 2FA habilitado na conta).
2. Crie um novo aplicativo.
3. Defina a OAuth Redirect URL com o callback da API:
   - `http://localhost:8000/api/auth/callback`
4. Após criar, copie:
   - **Client ID**
   - **Client Secret**

> A URL de callback precisa ser exatamente igual em `TWITCH_REDIRECT_URI` e no console da Twitch.

---

## 2) Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Campos obrigatórios para OAuth:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI`
- `JWT_SECRET`

Campos importantes de runtime:

- `APP_ENV`
- `APP_BASE_URL`
- `PORT`
- `CORS_ORIGINS` (origens permitidas do front-end)
- `ALLOWED_HOSTS` (hosts válidos para evitar Host Header Injection)
- `DATABASE_URL` (default já aponta para SQLite local)

Campos opcionais:

- `REDIS_URL` (worker assíncrono de clips)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`

---

## 3) Executar o projeto

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --port 8000
```

Acesse:

- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

---

## 4) Testar OAuth da Twitch

1. Abra `GET /api/auth/twitch-url` no Swagger.
2. Copie `authorize_url` retornada.
3. Abra a URL no navegador e autorize o app na Twitch.
4. A Twitch redirecionará para `TWITCH_REDIRECT_URI` com `?code=...`.
5. O endpoint `GET /api/auth/callback` troca o `code` por token Twitch e retorna JWT da aplicação.

---

## Endpoints principais

### Auth
- `GET /api/auth/twitch-url`
- `GET /api/auth/callback?code=...&state=...`

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

## O que falta para produção (checklist)

- [ ] Preencher `.env` com dados reais da Twitch.
- [ ] Ajustar `TWITCH_REDIRECT_URI` para domínio de produção.
- [ ] Configurar banco gerenciado (Postgres) se não quiser SQLite local.
- [ ] Configurar `REDIS_URL` para processamento assíncrono de clips.
- [ ] Configurar Stripe para cobrança real.
- [ ] Implementar integrações externas necessárias (ex.: e-mail/SMS no CRM).

## Segurança já aplicada nesta base

- Validação de `state` de OAuth assinado com expiração curta (anti-CSRF no callback).
- CORS configurável por variável de ambiente.
- Validação de host confiável (`ALLOWED_HOSTS`).
- Security headers HTTP padrão (`X-Frame-Options`, `CSP`, `nosniff`, etc).

## Front-end

Este repositório contém o **back-end FastAPI** e persistência (SQLite/Postgres).
Se você quiser front-end pronto, precisa plugar um cliente (ex.: Next.js/Vite) consumindo os endpoints de `/api`.

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


.venv\Scripts\uvicorn app.main:app --reload --port 8000
