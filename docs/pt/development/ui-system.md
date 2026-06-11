# Sistema UI

The UI system is based on global CSS tokens and shared eci-* components.

## O que esta pagina cobre

- The UI system is based on global CSS tokens and shared eci-* components.
- Theme and accessibility modes are global and must be respected by feature CSS.
- eci-select receives explicit options from each page.

## Arquivos principais

- `src/styles.css`
- `src/app/shared/ui`
- `src/app/shared/layout`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
