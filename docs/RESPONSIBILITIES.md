# Responsabilidades por Módulo

## Bot (`app/domain/bot`)
- CRUD de comandos.
- Regras de resposta para automação premium.
- Exposição de API para painel.

## Clips (`app/domain/clips`)
- Detectar picos de engajamento.
- Persistir sugestões de clip.
- Preparar input para worker assíncrono.

## CRM (`app/domain/crm`)
- Registrar eventos de viewer.
- Segmentar audiência (new/casual/core/vip).
- Executar campanhas e pontuação.

## Auth (`app/domain/auth` + `app/api/deps.py`)
- OAuth Twitch.
- Emissão de JWT.
- Controle de autorização por canal.

## Billing (`app/domain/billing`)
- Criar checkout Stripe.
- Preparar integração com webhooks.

## Core (`app/core`)
- Configurações globais.
- Segurança JWT.
- Sessão de banco e lifecycle da aplicação.
