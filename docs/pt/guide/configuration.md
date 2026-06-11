# Configuracao

scripts/write-env.mjs creates public/assets/env.json from .env.

## O que esta pagina cobre

- scripts/write-env.mjs creates public/assets/env.json from .env.
- EnvService loads runtime config before domain tokens are provided.
- AUTH, STUDY, TALK and TODO services are configured from Angular injection tokens.

## Arquivos principais

- `.env.template`
- `src/app/core/config/env.service.ts`
- `src/app/app.config.ts`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
