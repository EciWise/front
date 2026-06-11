# Build and release

Production build outputs SSR artifacts to dist/ECIWISE-Front.

## What this page covers

- Production build outputs SSR artifacts to dist/ECIWISE-Front.
- VitePress docs build into docs/.vitepress/dist and are ignored by Git.
- Check Angular budgets before increasing configured limits.

## Main files

- `angular.json`
- `docs/.vitepress/config.mts`
- `package.json`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
