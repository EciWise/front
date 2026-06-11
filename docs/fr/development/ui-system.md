# Systeme UI

The UI system is based on global CSS tokens and shared eci-* components.

## Ce que couvre cette page

- The UI system is based on global CSS tokens and shared eci-* components.
- Theme and accessibility modes are global and must be respected by feature CSS.
- eci-select receives explicit options from each page.

## Fichiers principaux

- `src/styles.css`
- `src/app/shared/ui`
- `src/app/shared/layout`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
