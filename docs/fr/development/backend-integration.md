# Integration backend

New backends should expose models, config tokens and dedicated services.

## Ce que couvre cette page

- New backends should expose models, config tokens and dedicated services.
- Components should call domain services rather than HttpClient directly.
- Tutorships currently use a mock service designed to be replaced by an HTTP facade.

## Fichiers principaux

- `src/app/app.config.ts`
- `src/app/core/config`
- `src/app/features/*/*.service.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
