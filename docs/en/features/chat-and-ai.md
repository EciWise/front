# Chat and AI

ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.

## What this page covers

- ChatService orchestrates conversations, messages, typing, reactions, read state and moderation.
- TalkApiService handles REST and TalkRealtimeService handles WebSocket/STOMP.
- AI features are split between academic predictions and the floating assistant.

## Main files

- `src/app/features/chat/chat.service.ts`
- `src/app/features/chat/talk-api.service.ts`
- `src/app/features/ai-assistant`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
