# Chat et IA

ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.

## Ce que couvre cette page

- ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.
- TalkApiService handles REST and TalkRealtimeService handles WebSocket/STOMP.
- AI features are split between academic predictions and the floating assistant.

## Fichiers principaux

- `src/app/features/chat/chat.service.ts`
- `src/app/features/chat/talk-api.service.ts`
- `src/app/features/ai-assistant`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
