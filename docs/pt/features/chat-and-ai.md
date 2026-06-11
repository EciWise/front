# Chat e IA

ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.

## O que esta pagina cobre

- ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.
- TalkApiService handles REST and TalkRealtimeService handles WebSocket/STOMP.
- AI features are split between academic predictions and the floating assistant.

## Arquivos principais

- `src/app/features/chat/chat.service.ts`
- `src/app/features/chat/talk-api.service.ts`
- `src/app/features/ai-assistant`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
