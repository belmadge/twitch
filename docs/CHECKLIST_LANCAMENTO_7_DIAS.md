# Checklist priorizada de lançamento (7 dias)

Objetivo: sair de “backend funcional” para “SaaS publicável” com risco controlado.

## Dia 1 — Fundação de produção (bloqueador)

- [ ] Definir ambiente de produção (`APP_ENV=production`) e domínio oficial.
- [ ] Configurar `APP_BASE_URL`, `CORS_ORIGINS` e `ALLOWED_HOSTS` com valores reais.
- [ ] Trocar `DATABASE_URL` de SQLite para Postgres gerenciado.
- [ ] Validar variáveis obrigatórias de OAuth e JWT (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_REDIRECT_URI`, `JWT_SECRET`).
- [ ] Criar runbook curto de deploy/rollback.

**Critério de pronto do dia:** API sobe em produção com Postgres, healthcheck ok e login OAuth funcional.

---

## Dia 2 — Dados e confiabilidade mínima

- [ ] Configurar migrations (Alembic) e pipeline de execução no deploy.
- [ ] Definir estratégia de backup do Postgres (snapshot diário + retenção).
- [ ] Padronizar logs estruturados (request id, user/channel, erro).
- [ ] Adicionar monitoramento básico (uptime + erros 5xx).

**Critério de pronto do dia:** banco versionado e recuperação básica possível sem intervenção manual complexa.

---

## Dia 3 — Billing realmente vendável

- [ ] Persistir estado de assinatura (customer_id, subscription_id, status, period_end).
- [ ] Tratar webhooks Stripe essenciais:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Garantir idempotência de processamento de webhook.
- [ ] Testar fluxo ponta a ponta com Stripe CLI + ambiente de teste.

**Critério de pronto do dia:** compra ativa plano Pro, cancelamento/atualização refletem no sistema corretamente.

---

## Dia 4 — Segurança de operação

- [ ] Aplicar rate limit em endpoints críticos (auth, webhook, escrita sensível).
- [ ] Revisar escopos OAuth para mínimo necessário.
- [ ] Revisar secret management (sem segredo em repositório; rotação documentada).
- [ ] Criar auditoria mínima (quem alterou comando/campanha e quando).

**Critério de pronto do dia:** risco de abuso reduzido e trilha de investigação disponível.

---

## Dia 5 — Compliance e confiança pública

- [ ] Publicar página de Política de Privacidade.
- [ ] Publicar página de Termos de Uso.
- [ ] Definir e-mail de suporte e página de contato.
- [ ] Documentar política de retenção/exclusão de dados.

**Critério de pronto do dia:** requisitos mínimos de confiança para onboarding e revisão de parceiros atendidos.

---

## Dia 6 — Produto e ativação (primeiro valor)

- [ ] Fechar planos comerciais (Free/Pro/anual) com limites claros.
- [ ] Implementar onboarding curto:
  - [ ] conectar Twitch
  - [ ] criar 1 comando de bot
  - [ ] gerar 1 highlight
  - [ ] disparar 1 campanha CRM
- [ ] Expor indicadores simples de uso por plano (consumo atual/limite).

**Critério de pronto do dia:** novo usuário chega ao “primeiro valor” em poucos minutos.

---

## Dia 7 — Go-live comercial

- [ ] Publicar landing page com proposta de valor e pricing.
- [ ] Habilitar Stripe Customer Portal para autoatendimento.
- [ ] Validar funil mínimo de aquisição (UTMs, canal principal, CTA).
- [ ] Executar checklist final de lançamento (abaixo).

**Critério de pronto do dia:** operação apta para receber usuários pagantes com suporte básico.

---

## Checklist final de lançamento (antes de abrir tráfego)

- [ ] OAuth Twitch funcionando em domínio oficial.
- [ ] Checkout + webhooks Stripe processando sem erro.
- [ ] Plano Pro habilita/desabilita recursos corretamente.
- [ ] Política de Privacidade e Termos publicados e acessíveis.
- [ ] Backup e monitoramento ativos.
- [ ] Canal de suporte funcionando.
- [ ] Dashboard mínimo de métricas com:
  - [ ] conversão Free → Pro
  - [ ] churn mensal
  - [ ] ARPU
  - [ ] tempo para primeiro valor

---

## Prioridade executiva (se faltar tempo)

1. **Obrigatório para cobrar com segurança:** Dias 1, 3, 5.
2. **Obrigatório para estabilidade mínima:** Dia 2 e Dia 4.
3. **Obrigatório para escalar aquisição:** Dia 6 e Dia 7.

Se precisar cortar escopo, nunca corte: webhook confiável, persistência de assinatura, compliance legal e backup.
