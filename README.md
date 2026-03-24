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
