# Deployment instructions

## Build

```powershell
npm ci
npm run lint
npm run test:ci
npm run build
```

SSR output:

```text
dist/ECIWISE-Front
```

Run:

```powershell
node dist/ECIWISE-Front/server/server.mjs
```

## Environment

Required variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | SSR server port |
| `AUTH_SERVICE` | Auth/user/IA backend |
| `STUDY_SERVICE` | Learning and practice backend |
| `TALK_SERVICE` | Chat REST backend |
| `TALK_WS` | Chat WebSocket endpoint |
| `TODO_SERVICE` | Tasks backend |

## Static docs

```powershell
npm run docs:build
```

Output:

```text
docs/.vitepress/dist
```

Deploy the docs output as a static site.

## Production checklist

- Serve over HTTPS.
- Cache hashed assets long-term.
- Keep HTML and `assets/env.json` on short cache.
- Verify backend URLs in `assets/env.json`.
- Verify auth, role redirects, chat WebSocket and documentation links.
- Keep the previous artifact available for rollback.

