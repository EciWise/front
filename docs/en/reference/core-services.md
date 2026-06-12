# Core services reference

Core services provide application-wide behavior and should remain independent from feature modules.

## Auth

Files:

- `core/auth/auth.service.ts`
- `core/auth/auth.guard.ts`
- `core/auth/auth.interceptor.ts`
- `core/auth/auth.config.ts`

Responsibilities:

- Login, registration and password change.
- Session restoration and persistence.
- JWT expiration checks.
- Role normalization and route fallback.
- Bearer token attachment for own API hosts.
- Role and auth guards.

SSR rule: storage is accessed only in browser context.

## Runtime configuration

Files:

- `core/config/env.service.ts`
- `core/config/url.util.ts`
- `core/config/api-hosts.ts`

Responsibilities:

- Load `assets/env.json`.
- Provide runtime values to Angular tokens.
- Normalize service URLs.
- Compute own API hosts for token safety.

## Error handling

Files:

- `core/errors/app-error.ts`
- `core/http/error.interceptor.ts`

Responsibilities:

- Map HTTP/network failures to translation keys.
- Wrap failures in `AppError`.
- Redirect/logout on expired own-API tokens.
- Avoid logging out for valid-token permission denials.

## Preferences

| Service | Purpose | Storage |
| --- | --- | --- |
| `ThemeService` | Light/dark mode | Browser storage and `data-theme` |
| `I18nService` | Active language | Browser storage and TranslateService |
| `A11yService` | Accessibility mode | Browser storage and `a11y-mode` class |

All three are initialized from `provideAppInitializer` in `app.config.ts`.

## Notifications

`NotificationsService` owns the notification list and unread counters. The current implementation is local/frontend state and is rendered through `NotificationsBellComponent`.

## IA services

| Service | Purpose |
| --- | --- |
| `IaDataService` | Current user's IA data, partial save and prediction persistence |
| `IaAdminService` | Admin IA data, statistics and prediction workflows |
| `IaProfileStatusService` | Completeness checks for performance and dropout profile fields |

IA field definitions and models live in `core/ia`.

## Config tokens

| Token | Interface | Default |
| --- | --- | --- |
| `AUTH_CONFIG` | `{ apiBaseUrl: string }` | Provided by app config |
| `STUDY_CONFIG` | `{ studyApiUrl: string }` | `http://localhost:8082` fallback |
| `TALK_CONFIG` | `{ talkApiUrl: string; talkWsUrl: string }` | `http://localhost:3003`, `ws://localhost:3003/ws/chat` |
| `TODO_CONFIG` | `{ todoApiUrl: string }` | `http://localhost:8083` |

## Extension checklist

- Do not import from `features` into `core`.
- Add unit tests for all cross-cutting behavior.
- Keep browser APIs guarded.
- Update backend integration docs if a token or service host changes.
