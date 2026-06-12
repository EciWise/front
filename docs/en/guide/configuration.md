# Configuration

ECIWISE+ Front uses runtime configuration so the same frontend build can point to different backend services per environment.

## Sources

Configuration flows through:

```text
.env
  -> scripts/write-env.mjs
  -> public/assets/env.json
  -> EnvService
  -> Angular injection tokens
  -> domain services
```

## Environment variables

| Variable | Frontend key | Used by | Local default |
| --- | --- | --- | --- |
| `AUTH_SERVICE` | `apiBaseUrl` | Auth, users, IA profile/admin endpoints | `http://localhost:3001` |
| `STUDY_SERVICE` | `studyApiUrl` | Learning and practice | `http://localhost:8082` |
| `TALK_SERVICE` | `talkApiUrl` | Chat REST API | `http://localhost:3003` |
| `TALK_WS` | `talkWsUrl` | Chat realtime WebSocket/STOMP | `ws://localhost:3003/ws/chat` |
| `TODO_SERVICE` | `todoApiUrl` | Tasks and planner | `http://localhost:8083` |
| `PORT` | Server port | SSR server and dev helper | `4000` |

## Angular providers

`app.config.ts` maps runtime values into tokens:

- `AUTH_CONFIG`
- `STUDY_CONFIG`
- `TALK_CONFIG`
- `TODO_CONFIG`

Domain services inject these tokens and build their own endpoints. Components should not read `.env` or `env.json` directly.

## URL normalization

`normalizeServiceUrl` accepts complete URLs or host-like values and strips trailing slashes. It also adds `http://` for local hosts and `https://` for non-local host strings.

Use it when introducing new service configuration. Avoid manual slash trimming in feature services.

## SSR note

`src/server.ts` exposes `/assets/env.json` for the SSR Express server. The build/start script also writes `public/assets/env.json`. Keep both paths aligned when adding new runtime keys.

At the moment, `scripts/write-env.mjs` writes auth, study, talk, talk WS and todo keys; the Express route currently exposes `apiBaseUrl`. If server-rendered deployments rely on the Express route, update that route when new runtime keys are required.

## Local setup

Copy the template and adjust backend URLs:

```powershell
Copy-Item .env.template .env
```

Then run:

```powershell
npm start
```

or:

```powershell
npm run build
```

Both commands run `scripts/write-env.mjs` first.

## Main files

- `.env.template`
- `scripts/write-env.mjs`
- `src/app/core/config/env.service.ts`
- `src/app/core/config/url.util.ts`
- `src/app/app.config.ts`
- `src/server.ts`
