# Primeros pasos

## Requisitos

- Node.js compatible con Angular 21.
- npm 11, definido en `packageManager`.
- Dependencias instaladas con `npm install`.

## Instalación

```powershell
npm install
```

## Variables de entorno

El proyecto usa un archivo `.env` para generar `public/assets/env.json` mediante `scripts/write-env.mjs`.

Copia `.env.template` a `.env` y ajusta los servicios:

```ini
PORT=4000
AUTH_SERVICE=http://localhost:3001
STUDY_SERVICE=http://localhost:8082
TALK_SERVICE=http://localhost:3003
TALK_WS=ws://localhost:3003/ws/chat
TODO_SERVICE=http://localhost:8083
```

## Servidor de desarrollo

```powershell
npm start
```

El script ejecuta `scripts/serve.mjs`, que prepara `assets/env.json` antes de levantar la aplicación.

Tambien se puede usar Angular CLI directamente:

```powershell
npm run ng -- serve
```

## Build de producción

```powershell
npm run build
```

La salida se genera en `dist/ECIWISE-Front`. El proyecto está configurado con `outputMode: "server"` para SSR.

## Pruebas

```powershell
npm run lint
npm run test:ci
npm run test:coverage
npm run e2e
```

## Documentación

```powershell
npm run docs:dev
npm run docs:build
npm run docs:preview
```

El sitio VitePress vive en `docs/` y usa búsqueda local.
