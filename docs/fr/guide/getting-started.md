# Premiers pas

Install dependencies with npm and configure runtime services through .env.

## Ce que couvre cette page

- Install dependencies with npm and configure runtime services through .env.
- Use npm start for development and npm run build for production SSR output.
- Documentation runs with VitePress through the docs:* scripts.

## Fichiers principaux

- `package.json`
- `.env.template`
- `scripts/write-env.mjs`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
