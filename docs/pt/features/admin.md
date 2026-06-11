# Administracao

Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.

## O que esta pagina cobre

- Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.
- Statistics combine platform IA data and tutorship service metrics.
- User administration consumes UserAdminService and role-aware select controls.

## Arquivos principais

- `src/app/features/admin/admin.routes.ts`
- `src/app/features/admin/users`
- `src/app/features/admin/statistics`

## Notas de implementacao

- Mantenha as alteracoes limitadas ao dominio e reutilize componentes UI compartilhados antes de criar novos controles.
- Textos visiveis da aplicacao ficam nas traducoes; textos da documentacao ficam em Markdown.
