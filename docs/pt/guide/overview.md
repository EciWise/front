# Visao geral

ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.

## O que esta pagina cobre

- ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.
- The app groups public, student, tutor and administrator experiences.
- Cross-cutting services manage authentication, theme, accessibility, i18n, notifications and runtime configuration.

## Arquivos principais

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/shared/layout/app-shell/app-shell.ts`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
