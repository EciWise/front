# Getting started

Install dependencies with npm and configure runtime services through .env.

## What this page covers

- Install dependencies with npm and configure runtime services through .env.
- Use npm start for development and npm run build for production SSR output.
- Documentation runs with VitePress through the docs:* scripts.

## Main files

- `package.json`
- `.env.template`
- `scripts/write-env.mjs`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
