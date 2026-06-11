# Build et livraison

Production build outputs SSR artifacts to dist/ECIWISE-Front.

## Ce que couvre cette page

- Production build outputs SSR artifacts to dist/ECIWISE-Front.
- VitePress docs build into docs/.vitepress/dist and are ignored by Git.
- Check Angular budgets before increasing configured limits.

## Fichiers principaux

- `angular.json`
- `docs/.vitepress/config.mts`
- `package.json`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
