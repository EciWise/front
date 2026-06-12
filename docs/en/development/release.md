# Build and release

The frontend builds as an Angular SSR application. Documentation builds separately through VitePress.

## Angular build

```powershell
npm run build
```

Output:

```text
dist/ECIWISE-Front
```

Run generated SSR server:

```powershell
npm run serve:ssr:ECIWISE-Front
```

The command executes:

```text
node dist/ECIWISE-Front/server/server.mjs
```

## Angular budgets

`angular.json` defines:

| Budget | Warning | Error |
| --- | --- | --- |
| `initial` | `750kB` | `1MB` |
| `anyComponentStyle` | `8kB` | `12kB` |

If the initial bundle warning appears, inspect lazy loading and large dependencies before increasing limits.

## Documentation build

```powershell
npm run docs:build
```

Output:

```text
docs/.vitepress/dist
```

Preview:

```powershell
npm run docs:preview
```

## Release checklist

Run before release:

```powershell
npm ci
npm run lint
npm run test:ci
npm run build
npm run docs:build
```

For visual or navigation changes:

```powershell
npm run e2e
```

Manual checks:

- Landing loads.
- Auth routes load.
- Role routes are protected.
- Runtime `env.json` points to the target backend services.
- Theme, language and accessibility toggles work.
- Chat realtime uses the right `TALK_WS` endpoint.
- No 404s for hashed chunks or CSS assets.

## Deployment notes

- Serve `dist/ECIWISE-Front/browser` static files with long cache for hashed assets.
- Keep HTML and `assets/env.json` on short cache/revalidation.
- Run `server.mjs` behind HTTPS/reverse proxy.
- Use `PORT` from the environment.
- Do not bake secrets into `.env` inside a public image.
- Keep the previous artifact available for rollback.
