# Chat and AI

Chat and AI are cross-cutting support capabilities exposed through floating actions and role-specific screens.

## Chat architecture

| Layer | File | Responsibility |
| --- | --- | --- |
| Orchestration | `features/chat/chat.service.ts` | Conversation state, permissions, active thread, local events |
| REST transport | `features/chat/talk-api.service.ts` | Conversations, messages, attachments, moderation, censored words |
| Realtime transport | `features/chat/talk-realtime.service.ts` | STOMP connection, typing, notifications and message events |
| Directory | `features/chat/users-directory.service.ts` | User search for conversations |
| UI shell | `features/chat/chat-panel.ts` | Drawer/panel composition |
| UI components | `features/chat/ui/*` | Conversation list, thread, messages, composer and moderation |

## Chat capabilities

- Individual and group conversations.
- Anonymous group option.
- Message history and active thread state.
- REST or realtime message sending depending on connection state.
- Typing indicators.
- Read state.
- Attachments.
- Reactions.
- Reply/edit/delete flows.
- Pinning and moderation.
- Censored words management for admins.

## Realtime behavior

`TalkRealtimeService`:

- Does not connect without a token.
- Does not connect on the server.
- Uses `TALK_CONFIG.talkWsUrl`.
- Publishes messages and typing events as JSON.
- Routes frames into conversation events, typing events or personal notifications.
- Cleans up subscriptions and connection state on disconnect.

## Floating assistant

The floating assistant lives under `features/ai-assistant`:

- `AiAssistantService` stores the local conversation and simulated assistant responses.
- `AiAssistantPanelComponent` renders history, draft, loading and submit behavior.
- The feature is currently frontend-local and can later be backed by an IA endpoint.

## Academic IA

Academic IA flows live under `core/ia` and `features/ia`:

- `IaDataService`: current user's IA data and prediction persistence.
- `IaAdminService`: admin statistics and predictions.
- `IaProfileStatusService`: profile completeness for performance/dropout datasets.
- `StudentsPredictionsComponent`: prediction screen reused by admin/tutor routes.
- `dropout-ia-fields` and `datos-ia-fields`: profile data capture.

## Responsible AI constraints

- IA should support academic decisions, not replace human review.
- Prediction outputs should remain explainable in UI copy.
- Profile data completion should be progressive and transparent.
- Admin screens should present IA data as signals for action, not final judgments.

## Quality coverage

Relevant specs:

- `features/chat/chat.service.spec.ts`
- `features/chat/talk-api.service.spec.ts`
- `features/chat/talk-realtime.service.spec.ts`
- `features/chat/users-directory.service.spec.ts`
- `features/chat/ui/*.spec.ts`
- `features/ai-assistant/ai-assistant.service.spec.ts`
- `features/ai-assistant/ai-assistant-panel.spec.ts`
- `core/ia/ia-data.service.spec.ts`
- `core/ia/ia-profile-status.service.spec.ts`

## Extension rules

- Keep REST and realtime transport separate.
- Keep chat permissions in `ChatService`.
- Add tests for any new message lifecycle event.
- Keep IA profile fields synchronized with backend models and translations.
