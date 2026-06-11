# Architecture

app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.

## Ce que couvre cette page

- app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.
- core contains cross-cutting concerns, features contains domain screens and shared contains reusable UI/layout.
- Browser-only APIs are protected for SSR compatibility.

## Fichiers principaux

- `src/app/app.config.ts`
- `src/app/core`
- `src/app/features`
- `src/app/shared`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
