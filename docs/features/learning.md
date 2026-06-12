# Aprendizaje

El dominio `aprendizaje` cubre colecciones, flashcards, estudio con repetición espaciada y estadísticas de uso.

## Servicio

`AprendizajeService` vive en `src/app/features/aprendizaje/aprendizaje.service.ts`.

## Endpoints consumidos

La base se arma como:

```ts
`${studyApiUrl}/api`
```

Métodos principales:

- `collections`
- `createCollection`
- `updateCollection`
- `deleteCollection`
- `setFavorite`
- `flashcards`
- `createFlashcard`
- `updateFlashcard`
- `deleteFlashcard`
- `studyQueue`
- `review`
- `reviewsSummary`
- `usageSummary`

## Vistas

- `aprendizaje.ts`: entrada del módulo.
- `collections/`: colecciones y flashcards.
- `study/`: sesión de estudio.
- `stats/`: estadísticas.

## Contratos

Los modelos están en `study.models.ts`.

Al modificar el backend de aprendizaje, primero actualizar los modelos y despues el servicio. Evitar adaptar DTOs dentro de templates.

