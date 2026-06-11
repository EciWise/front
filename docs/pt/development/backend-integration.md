# Integracao backend

New backends should expose models, config tokens and dedicated services.

## O que esta pagina cobre

- New backends should expose models, config tokens and dedicated services.
- Components should call domain services rather than HttpClient directly.
- Tutorships currently use a mock service designed to be replaced by an HTTP facade.

## Arquivos principais

- `src/app/app.config.ts`
- `src/app/core/config`
- `src/app/features/*/*.service.ts`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
