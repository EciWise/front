# Configuration

scripts/write-env.mjs creates public/assets/env.json from .env.

## What this page covers

- scripts/write-env.mjs creates public/assets/env.json from .env.
- EnvService loads runtime config before domain tokens are provided.
- AUTH, STUDY, TALK and TODO services are configured from Angular injection tokens.

## Main files

- `.env.template`
- `src/app/core/config/env.service.ts`
- `src/app/app.config.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
