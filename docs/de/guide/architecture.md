# Architektur

app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.

## Was diese Seite abdeckt

- app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.
- core contains cross-cutting concerns, features contains domain screens and shared contains reusable UI/layout.
- Browser-only APIs are protected for SSR compatibility.

## Wichtige Dateien

- `src/app/app.config.ts`
- `src/app/core`
- `src/app/features`
- `src/app/shared`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
