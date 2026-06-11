# Rotas e papeis

Public routes load landing, login, register and OAuth callback.

## O que esta pagina cobre

- Public routes load landing, login, register and OAuth callback.
- Authenticated areas use AppShellComponent and roleGuard.
- Student, tutor and admin sidebars are declared in shared/layout/nav-items.ts.

## Arquivos principais

- `src/app/app.routes.ts`
- `src/app/features/*/*.routes.ts`
- `src/app/shared/layout/nav-items.ts`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
