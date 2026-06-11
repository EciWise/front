# Arquitetura

app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.

## O que esta pagina cobre

- app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.
- core contains cross-cutting concerns, features contains domain screens and shared contains reusable UI/layout.
- Browser-only APIs are protected for SSR compatibility.

## Arquivos principais

- `src/app/app.config.ts`
- `src/app/core`
- `src/app/features`
- `src/app/shared`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
