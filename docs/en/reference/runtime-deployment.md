# Runtime and deployment reference

This page focuses on how the frontend runs in development, production SSR and documentation hosting.

## Build targets

| Target | Command | Output |
| --- | --- | --- |
| Dev app | `npm start` | Angular dev server |
| SSR build | `npm run build` | `dist/ECIWISE-Front` |
| SSR server | `npm run serve:ssr:ECIWISE-Front` | Node server on `PORT` |
| Docs build | `npm run docs:build` | `docs/.vitepress/dist` |
| E2E | `npm run e2e` | Playwright run |

## Runtime environment

`scripts/write-env.mjs` writes:

```json
{
  "apiBaseUrl": "...",
  "studyApiUrl": "...",
  "talkApiUrl": "...",
  "talkWsUrl": "...",
  "todoApiUrl": "..."
}
```

`EnvService` loads that file before service tokens are provided.

## Production SSR

Production server entry:

```text
dist/ECIWISE-Front/server/server.mjs
```

The server:

- Serves static files from the browser output.
- Handles SSR through Angular's `AngularNodeAppEngine`.
- Exposes `/assets/env.json`.
- Reads `PORT` from the environment.

## Cache guidance

- Cache hashed JS/CSS/assets for a long time.
- Keep HTML and `assets/env.json` on short cache/revalidation.
- Do not cache environment JSON across deployments with different backend URLs.

## Reverse proxy guidance

Run the Node SSR server behind HTTPS and a reverse proxy. Forward host/protocol headers according to the hosting platform's standards.

## Docs deployment

VitePress docs are static. Generic hosting settings:

| Setting | Value |
| --- | --- |
| Build command | `npm run docs:build` |
| Output directory | `docs/.vitepress/dist` |
| Node version | 20+ |

If deploying under a subpath, configure VitePress `base` accordingly.

## Release gates

Minimum:

```powershell
npm run lint
npm run test:ci
npm run build
npm run docs:build
```

Add `npm run e2e` when auth shell, landing, registration, layout, routing, viewport-sensitive UI or critical role flows change.
