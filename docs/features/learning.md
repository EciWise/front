# Aprendizaje

El dominio `aprendizaje` cubre colecciones, flashcards, estudio con repeticion espaciada y estadisticas de uso.

## Servicio

`AprendizajeService` vive en `src/app/features/aprendizaje/aprendizaje.service.ts`.

## Endpoints consumidos

La base se arma como:

```ts
`${studyApiUrl}/api`
```

Metodos principales:

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

- `aprendizaje.ts`: entrada del modulo.
- `collections/`: colecciones y flashcards.
- `study/`: sesion de estudio.
- `stats/`: estadisticas.

## Contratos

Los modelos estan en `study.models.ts`.

Al modificar el backend de aprendizaje, primero actualizar los modelos y despues el servicio. Evitar adaptar DTOs dentro de templates.

