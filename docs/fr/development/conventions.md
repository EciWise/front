# Conventions de developpement

New Angular components should be standalone, OnPush and use inject().

## Ce que couvre cette page

- New Angular components should be standalone, OnPush and use inject().
- Prefer signals and modern control flow for new UI state.
- Keep text translated and styling based on global tokens.

## Fichiers principaux

- `src/app/features`
- `src/app/shared/ui`
- `src/app/core/i18n/translations`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
