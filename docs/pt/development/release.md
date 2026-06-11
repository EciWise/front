# Build e entrega

Production build outputs SSR artifacts to dist/ECIWISE-Front.

## O que esta pagina cobre

- Production build outputs SSR artifacts to dist/ECIWISE-Front.
- VitePress docs build into docs/.vitepress/dist and are ignored by Git.
- Check Angular budgets before increasing configured limits.

## Arquivos principais

- `angular.json`
- `docs/.vitepress/config.mts`
- `package.json`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
