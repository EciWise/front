# Erste Schritte

Install dependencies with npm and configure runtime services through .env.

## Was diese Seite abdeckt

- Install dependencies with npm and configure runtime services through .env.
- Use npm start for development and npm run build for production SSR output.
- Documentation runs with VitePress through the docs:* scripts.

## Wichtige Dateien

- `package.json`
- `.env.template`
- `scripts/write-env.mjs`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
