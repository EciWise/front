# Configuration

scripts/write-env.mjs creates public/assets/env.json from .env.

## Ce que couvre cette page

- scripts/write-env.mjs creates public/assets/env.json from .env.
- EnvService loads runtime config before domain tokens are provided.
- AUTH, STUDY, TALK and TODO services are configured from Angular injection tokens.

## Fichiers principaux

- `.env.template`
- `src/app/core/config/env.service.ts`
- `src/app/app.config.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
