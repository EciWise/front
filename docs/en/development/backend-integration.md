# Backend integration

Backend integration is intentionally isolated behind configuration tokens and domain services. Screens should depend on services, not raw endpoint strings.

## Runtime configuration tokens

| Token | Source key | Primary consumers |
| --- | --- | --- |
| `AUTH_CONFIG` | `apiBaseUrl` | Auth, user admin, IA profile/admin, user directory |
| `STUDY_CONFIG` | `studyApiUrl` | Learning and practice |
| `TALK_CONFIG` | `talkApiUrl`, `talkWsUrl` | Chat REST and realtime |
| `TODO_CONFIG` | `todoApiUrl` | Tasks planner |

Tokens are provided in `src/app/app.config.ts` after `EnvService.load()` resolves.

## Current service map

| Service | Backend base | Responsibility |
| --- | --- | --- |
| `AuthService` | `AUTH_CONFIG` | Login, register, password change, profile update |
| `UserAdminService` | `AUTH_CONFIG` | User list, CSV import, role/status changes |
| `IaDataService` | `AUTH_CONFIG` | Current user IA profile and predictions |
| `IaAdminService` | `AUTH_CONFIG` | Admin IA statistics and predictions |
| `UsersDirectoryService` | `AUTH_CONFIG` | Chat participant search |
| `AprendizajeService` | `STUDY_CONFIG` | Collections, flashcards, study and review summaries |
| `PracticaService` | `STUDY_CONFIG` | Subjects, questions, quiz sessions, history and leaderboard |
| `TalkApiService` | `TALK_CONFIG` | Chat REST operations |
| `TalkRealtimeService` | `TALK_CONFIG` | WebSocket/STOMP events |
| `TasksService` | `TODO_CONFIG` | Tasks, agenda, categories, achievements and stats |
| `TutoringMockService` | Local mock | Tutorship domain until backend replacement |

## Adding a new backend

1. Add an environment variable to `.env.template`.
2. Write it from `scripts/write-env.mjs`.
3. Add a typed config interface and `InjectionToken` under `src/app/core/<domain>`.
4. Provide the token in `app.config.ts`.
5. Use `normalizeServiceUrl` for base URLs.
6. Add a domain service that owns endpoints and DTO mapping.
7. Add tests for the service.
8. Document the new service in this page and the frontend inventory.

## Endpoint rules

- Keep endpoint path construction inside services.
- Keep request/response types in `*.models.ts` or service-local interfaces.
- Use `HttpParams` for query parameters.
- Use `FormData` only at the service boundary for uploads.
- Keep optimistic updates explicit and tested.

## Error handling

Shared HTTP errors are normalized through `errorInterceptor` and `AppError`.

Feature services should not convert every error to strings. Let components show translation keys or domain-specific recoverable states.

## First-party host safety

The auth interceptor only attaches tokens to known own API hosts from:

- `AUTH_CONFIG.apiBaseUrl`
- `IA_CONFIG` hosts
- `STUDY_CONFIG.studyApiUrl`
- `TALK_CONFIG.talkApiUrl`
- `TODO_CONFIG.todoApiUrl`

Do not bypass this by manually setting `Authorization` in feature code unless there is a documented reason.

## Tutorship backend replacement

`TutoringMockService` currently encodes important business rules. When replacing it:

- Keep the screen-facing service shape stable.
- Move persistence to HTTP, not component code.
- Preserve tests around overlap, capacity, cancellation, rescheduling and ratings.
- Document which validation is server-owned and which is kept client-side for UX.
