# Authentifizierung

AuthService handles login, register, OAuth callback, forced password change and session persistence.

## Was diese Seite abdeckt

- AuthService handles login, register, OAuth callback, forced password change and session persistence.
- JWT and user data are persisted in localStorage only in browser context.
- Guards protect authenticated routes and role-specific areas.

## Wichtige Dateien

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts`
- `src/app/features/auth`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
