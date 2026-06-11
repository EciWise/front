# Convencoes de desenvolvimento

New Angular components should be standalone, OnPush and use inject().

## O que esta pagina cobre

- New Angular components should be standalone, OnPush and use inject().
- Prefer signals and modern control flow for new UI state.
- Keep text translated and styling based on global tokens.

## Arquivos principais

- `src/app/features`
- `src/app/shared/ui`
- `src/app/core/i18n/translations`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
