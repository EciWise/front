# Primeiros passos

Install dependencies with npm and configure runtime services through .env.

## O que esta pagina cobre

- Install dependencies with npm and configure runtime services through .env.
- Use npm start for development and npm run build for production SSR output.
- Documentation runs with VitePress through the docs:* scripts.

## Arquivos principais

- `package.json`
- `.env.template`
- `scripts/write-env.mjs`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
