# Twitch Chat Premium SaaS (Starter)

Projeto inicial para um SaaS de automação para streamers da Twitch.

Este repositório reúne, em uma única base, três frentes de produto que podem ser monetizadas em planos separados ou combinados:

1. **Bot de comandos premium** para automação de chat e experiência da live.
2. **Clipagem automática inteligente** para gerar sugestões de recortes curtos para TikTok e YouTube Shorts.
3. **CRM de comunidade** para retenção, segmentação de audiência e campanhas de lealdade.

---

## O que é esse bot (descrição detalhada)

O bot é um agente conectado ao chat da Twitch via `tmi.js`, autorizado pelo streamer através de OAuth. Depois da conexão, ele passa a atuar em tempo real sobre cada mensagem do chat e executa três responsabilidades principais:

### 1) Automação de chat (núcleo do bot premium)

- Responde comandos personalizados criados pelo streamer (ex.: `!discord`, `!agenda`, `!setup`).
- Suporta placeholders simples nas respostas (ex.: `{user}` para mencionar quem executou o comando).
- Expõe um comando interno `!comandos` para listar o conjunto ativo de comandos do canal.

**Valor para monetização:**
- Plano gratuito com limite de comandos.
- Plano Pro com comandos ilimitados, templates e automações adicionais.

### 2) Observabilidade de engajamento e clipagem automática

- Cada mensagem recebida é contabilizada como evento de atividade.
- O módulo de clipagem compara janelas recentes de eventos com uma linha de base anterior.
- Quando o volume sobe de forma relevante (pico de chat), o sistema cria uma **sugestão de clip** com:
  - score,
  - intervalo de tempo,
  - motivo do destaque,
  - título/descrição sugeridos,
  - plataformas de destino (TikTok/YouTube Shorts).

**Valor para monetização:**
- Cobrança por créditos de processamento.
- Plano mensal com número de sugestões por mês.

### 3) CRM de comunidade (fidelização)

- Cada viewer recebe um perfil com métricas como pontos, mensagens, presença e tags.
- O sistema classifica audiência em segmentos (`new`, `casual`, `core`, `vip`).
- Permite criar campanhas segmentadas (ex.: bônus de pontos para viewers casuais retornarem).
- Suporta ranking no chat (`!ranking`) para gamificar participação.

**Valor para monetização:**
- Plano CRM+ para creators que querem retenção e recorrência.
- Upsell para agências e streamers médios/grandes.

---

## Como o sistema funciona (fluxo fim a fim)

1. Streamer acessa `/auth/twitch` e autoriza o app.
2. Callback OAuth troca código por token e registra o usuário.
3. O bot entra no canal do streamer automaticamente.
4. Em cada mensagem:
   - atualiza CRM,
   - avalia pico para clipagem,
   - processa comandos customizados.
5. O painel/API expõe:
   - comandos configurados,
   - sugestões de clips,
   - dados de comunidade e campanhas.

---

## Arquitetura atual (MVP)

- **Backend:** Node.js + TypeScript + Express.
- **Conexão chat:** `tmi.js`.
- **Dados:** in-memory (sem banco, ideal para protótipo).
- **Autenticação Twitch:** OAuth + Helix API.

> Observação: esta versão é propositalmente simples para validação rápida. Para produção, o ideal é migrar dados para PostgreSQL/Redis e usar filas para tarefas de clipagem pesada.

---

## Funcionalidades implementadas

- Login OAuth com Twitch.
- Conexão automática do bot no canal após autorização.
- CRUD básico de comandos customizados por API.
- Comando `!comandos` para listar comandos.
- Comando `!ranking` para ranking de pontos da comunidade.
- Engine de sugestão de clips por pico de atividade.
- CRM com segmentação e campanhas de recompensa.

---

## Stack

- Node.js + TypeScript
- Express
- tmi.js

---

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

---

## Endpoints

### Base

- `GET /` home.
- `GET /auth/twitch` inicia OAuth.
- `GET /auth/callback` callback OAuth.
- `GET /dashboard/:login` dashboard básico.
- `POST /api/channels/:login/commands` cria/atualiza comando.
- `GET /health` healthcheck.

### Clipagem automática

- `GET /api/channels/:login/clips` lista sugestões de clip detectadas automaticamente.

### CRM (lealdade/comunidade)

- `GET /api/channels/:login/crm/viewers` lista viewers ranqueados por pontos.
- `POST /api/channels/:login/crm/campaigns` cria campanha segmentada.
- `POST /api/channels/:login/crm/campaigns/:campaignId/apply` aplica campanha no segmento.

---

## Exemplos

Criar comando customizado:

```bash
curl -X POST http://localhost:3000/api/channels/SEU_LOGIN/commands \
  -H "content-type: application/json" \
  -d '{"trigger":"!discord","response":"Entre no Discord: discord.gg/seuconvite"}'
```

Criar campanha CRM:

```bash
curl -X POST http://localhost:3000/api/channels/SEU_LOGIN/crm/campaigns \
  -H "content-type: application/json" \
  -d '{"name":"Reativação Semanal","segment":"casual","rewardPoints":25,"message":"Volte hoje e ganhe bônus!"}'
```

Aplicar campanha:

```bash
curl -X POST http://localhost:3000/api/channels/SEU_LOGIN/crm/campaigns/CAMPAIGN_ID/apply
```

---

## Estratégia de monetização (sugestão)

- **Free:** até 5 comandos + dados básicos.
- **Pro Bot:** comandos ilimitados + automações avançadas.
- **Pro Clips:** pacote mensal de sugestões de clip.
- **CRM+:** campanhas segmentadas + ranking + relatórios de retenção.

---

## Próximos passos (produção)

- Persistir dados em PostgreSQL.
- Adicionar Redis para contadores/filas.
- Integrar billing (Stripe/Mercado Pago).
- Criar autenticação de sessão/JWT para painel.
- Adicionar observabilidade (logs estruturados + métricas + alertas).
- Construir frontend dedicado (Next.js) com UX de produto SaaS.
