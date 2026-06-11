# Estrutura do projeto

src/app/core contains auth, i18n, theme, a11y, config and shared models.

## O que esta pagina cobre

- src/app/core contains auth, i18n, theme, a11y, config and shared models.
- src/app/features contains business domains such as auth, student, tutor, admin, learning and chat.
- src/app/shared contains layout and reusable UI primitives.

## Arquivos principais

- `src/app/core`
- `src/app/features`
- `src/app/shared`
- `src/styles.css`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
