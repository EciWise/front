# Chat und KI

ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.

## Was diese Seite abdeckt

- ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.
- TalkApiService handles REST and TalkRealtimeService handles WebSocket/STOMP.
- AI features are split between academic predictions and the floating assistant.

## Wichtige Dateien

- `src/app/features/chat/chat.service.ts`
- `src/app/features/chat/talk-api.service.ts`
- `src/app/features/ai-assistant`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
