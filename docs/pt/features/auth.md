# Autenticacao

AuthService handles login, register, OAuth callback, forced password change and session persistence.

## O que esta pagina cobre

- AuthService handles login, register, OAuth callback, forced password change and session persistence.
- JWT and user data are persisted in localStorage only in browser context.
- Guards protect authenticated routes and role-specific areas.

## Arquivos principais

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts`
- `src/app/features/auth`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
