# Build und Release

Production build outputs SSR artifacts to dist/ECIWISE-Front.

## Was diese Seite abdeckt

- Production build outputs SSR artifacts to dist/ECIWISE-Front.
- VitePress docs build into docs/.vitepress/dist and are ignored by Git.
- Check Angular budgets before increasing configured limits.

## Wichtige Dateien

- `angular.json`
- `docs/.vitepress/config.mts`
- `package.json`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
