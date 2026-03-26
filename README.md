# Twitch Creator SaaS (FastAPI)

Projeto em **Python/FastAPI** para creators com 5 módulos de produto:

1. **Auth** (OAuth Twitch + JWT da aplicação)
2. **Bot** (comandos e automação)
3. **Clips** (detecção de highlights)
4. **CRM** (engajamento e segmentação)
5. **Billing** (Stripe checkout + webhook)

---

## Você consegue ganhar dinheiro com esse projeto?

**Sim, consegue** — desde que você trate este app como um **SaaS B2B para streamers**, com foco em recorrência mensal.

### Modelo de monetização recomendado

- **Plano Free**
  - limite de comandos do bot
  - limite de highlights por semana
  - sem campanhas avançadas de CRM
- **Plano Pro (mensal/anual)**
  - comandos ilimitados
  - clipagem com prioridade
  - segmentação e campanhas completas
  - suporte prioritário
- **Add-ons**
  - pacote extra de processamento de clips
  - onboarding/consultoria para streamers maiores

### Métricas mínimas para validar negócio

- Conversão Free → Pro (%).
- Churn mensal (%).
- ARPU (receita média por usuário pagante).
- Tempo para “primeiro valor” (cadastro até primeiro resultado útil).

---

## Esse app “passa” para uso na Twitch Developer?

A Twitch normalmente avalia se o app:

- usa OAuth corretamente,
- pede apenas os escopos necessários,
- tem política de privacidade e termos,
- respeita segurança e identidade visual,
- não viola regras de spam/abuso.

Este backend já tem uma base boa (OAuth, state assinado, CORS, host allowlist, checkout Stripe), mas para ficar **“pronto para painel/publicação”** você ainda precisa concluir os itens de produção da checklist abaixo.

> Importante: este repositório é backend. Para um “painel” público, você também precisa de front-end (landing, dashboard, pricing, login e telas de consentimento).

---

## Arquitetura resumida

- API FastAPI em `app/main.py`
- Domínios:
  - `app/domain/auth`
  - `app/domain/bot`
  - `app/domain/clips`
  - `app/domain/crm`
  - `app/domain/billing`
- Banco padrão: SQLite local (produção recomendada: Postgres)
- Fila opcional para clips: Redis + worker

---

## 1) Pré-requisitos

- Python 3.11+
- Conta Twitch com 2FA habilitado
- Conta Stripe
- (Produção) Postgres gerenciado + Redis gerenciado

---

## 2) Registrar o app na Twitch Developer Console

1. Acesse o console da Twitch e crie um app.
2. Defina OAuth Redirect URL:
   - `http://localhost:8000/api/auth/callback` (dev)
   - `https://SEU_DOMINIO/api/auth/callback` (prod)
3. Copie:
   - `Client ID`
   - `Client Secret`

> A callback precisa ser idêntica no console e em `TWITCH_REDIRECT_URI`.

---

## 3) Configurar ambiente

```bash
cp .env.example .env
```

Preencha no `.env`:

### Obrigatórios (OAuth + segurança)

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI`
- `JWT_SECRET` (forte, aleatório)

### Obrigatórios para deploy

- `APP_ENV=production`
- `APP_BASE_URL=https://SEU_DOMINIO`
- `CORS_ORIGINS` com seus domínios reais
- `ALLOWED_HOSTS` com seus hosts reais
- `DATABASE_URL` (Postgres recomendado)

### Billing (para monetizar)

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_PRO`
- `STRIPE_WEBHOOK_SECRET`

### Opcionais

- `REDIS_URL` (worker assíncrono de clips)

---

## 4) Rodar localmente

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

## 5) Fluxo OAuth (teste rápido)

1. `GET /api/auth/twitch-url`
2. Abra `authorize_url`
3. Autorize na Twitch
4. Twitch redireciona para callback com `?code=...&state=...`
5. `GET /api/auth/callback` retorna JWT da aplicação

---

## 6) Fluxo de monetização Stripe

### Status da cobrança

- `GET /api/billing/status` → mostra se Stripe está habilitado

### Criar checkout

- `POST /api/billing/{channel_login}/checkout` com Bearer token do dono do canal

### Webhook Stripe (novo)

- `POST /api/billing/webhook`
- Valida assinatura via `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET`
- Retorna `event_type` recebido

#### Testar webhook localmente

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

Depois dispare eventos de teste no Stripe CLI.

---

## 7) Checklist para ficar “pronto para vender”

### Produto

- [ ] Definir planos (Free, Pro, anual) com limites claros.
- [ ] Criar onboarding curto até primeiro valor (comando bot + 1 clip + 1 campanha CRM).
- [ ] Implementar dashboard de uso e consumo por plano.

### Técnico

- [ ] Migrar SQLite para Postgres em produção.
- [ ] Adicionar migrations (Alembic) e rotina de backup.
- [ ] Persistir estado de assinatura (customer/subscription/status/period_end).
- [ ] Processar eventos críticos do webhook (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).
- [ ] Rate limit e auditoria de segurança.
- [ ] Observabilidade (logs estruturados + erro + métricas).

### Compliance e confiança

- [ ] Publicar **Política de Privacidade**.
- [ ] Publicar **Termos de Uso**.
- [ ] Definir e-mail de suporte e página de contato.
- [ ] Documentar retenção e exclusão de dados.

### Go-to-market

- [ ] Landing page com proposta de valor e pricing.
- [ ] Stripe Customer Portal para autoatendimento de assinatura.
- [ ] Funil de aquisição (conteúdo, creators parceiros, afiliados).

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
- `POST /api/billing/webhook`

---

## Segurança já aplicada na base

- OAuth state assinado e com expiração curta (anti-CSRF)
- CORS configurável por ambiente
- Trusted hosts (`ALLOWED_HOSTS`)
- Security headers (`nosniff`, `X-Frame-Options`, CSP etc.)

---

## Testes

```bash
pytest
```

Cobertura inicial:

- objetivos no endpoint raiz
- lógica de detecção de pico para clipagem

---

## Próximos passos recomendados (ordem prática)

1. Subir backend em produção com domínio e TLS.
2. Integrar front-end de dashboard/painel.
3. Concluir persistência de assinatura por webhook.
4. Publicar termos/privacidade.
5. Rodar beta fechado com 10–20 streamers.
6. Ajustar pricing conforme retenção e churn.
