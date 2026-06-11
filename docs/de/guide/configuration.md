# Konfiguration

scripts/write-env.mjs creates public/assets/env.json from .env.

## Was diese Seite abdeckt

- scripts/write-env.mjs creates public/assets/env.json from .env.
- EnvService loads runtime config before domain tokens are provided.
- AUTH, STUDY, TALK and TODO services are configured from Angular injection tokens.

## Wichtige Dateien

- `.env.template`
- `src/app/core/config/env.service.ts`
- `src/app/app.config.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
