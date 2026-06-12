# Instrucciones de despliegue

## Alcance

Este documento cubre el despliegue del frontend ECIWISE+ con Angular SSR y de la documentación VitePress. No reemplaza los pipelines de infraestructura, pero define los pasos y verificaciones que debe cumplir cada ambiente.

## Artefactos generados

| Artefacto | Comando | Salida |
| --- | --- | --- |
| Aplicación Angular SSR | `npm run build` | `dist/ECIWISE-Front` |
| Servidor SSR | `npm run serve:ssr:ECIWISE-Front` | Ejecuta `server.mjs` generado |
| Documentación VitePress | `npm run docs:build` | `docs/.vitepress/dist` |

## Variables de entorno

El despliegue debe definir estas variables:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto del servidor SSR | `4000` |
| `AUTH_SERVICE` | Base URL del backend auth/API | `https://api.eciwise.edu/auth` |
| `STUDY_SERVICE` | Base URL de estudio/práctica | `https://api.eciwise.edu/study` |
| `TALK_SERVICE` | Base URL REST de chat | `https://api.eciwise.edu/talk` |
| `TALK_WS` | WebSocket de chat | `wss://api.eciwise.edu/ws/chat` |
| `TODO_SERVICE` | Base URL de tareas | `https://api.eciwise.edu/todo` |

El script `scripts/write-env.mjs` convierte estas variables en `public/assets/env.json` antes de build/start. Ese archivo es el contrato runtime que lee Angular.

## Checklist previo a despliegue

Ejecutar en CI o local antes de publicar:

```powershell
npm ci
npm run lint
npm run test:ci
npm run build
npm run docs:build
```

Validar:

- No hay errores de TypeScript.
- No hay errores de lint.
- Tests pasan.
- Build SSR genera `dist/ECIWISE-Front/server/server.mjs`.
- `public/assets/env.json` contiene URLs del ambiente correcto.
- El presupuesto de bundle no supera error budget.
- Las rutas públicas y autenticadas cargan sin errores.

## Despliegue SSR con Node

Proceso recomendado:

1. Instalar dependencias con `npm ci`.
2. Generar env runtime con `npm run build`.
3. Publicar carpeta `dist/ECIWISE-Front`.
4. Ejecutar servidor:

```powershell
npm run serve:ssr:ECIWISE-Front
```

En infraestructura Linux, el comando final normalmente equivale a:

```bash
node dist/ECIWISE-Front/server/server.mjs
```

Requisitos:

- Exponer `PORT`.
- Configurar health check HTTP.
- Configurar reverse proxy con HTTPS.
- Pasar headers de proxy si aplica.
- Mantener logs stdout/stderr capturados por la plataforma.

## Despliegue en contenedor

Flujo sugerido:

```text
builder:
  npm ci
  npm run build

runtime:
  copiar dist/ECIWISE-Front
  copiar package.json/package-lock si el runtime instala deps
  ejecutar node dist/ECIWISE-Front/server/server.mjs
```

Buenas prácticas:

- No copiar `node_modules` de desarrollo al runtime si la imagen puede instalar solo producción.
- Definir `NODE_ENV=production`.
- No incluir `.env` con secretos en la imagen.
- Inyectar variables por ambiente.
- Usar imagen Node LTS compatible con Angular 21.

## Despliegue de documentación

Build:

```powershell
npm run docs:build
```

Salida:

```text
docs/.vitepress/dist
```

La documentación puede servirse como sitio estático en GitHub Pages, Netlify, Vercel, Cloudflare Pages, Nginx o cualquier hosting de archivos estáticos.

Configuración genérica:

| Setting | Valor |
| --- | --- |
| Build command | `npm run docs:build` |
| Output directory | `docs/.vitepress/dist` |
| Node version | 20 o superior |

Para Nginx con URLs limpias, usar una estrategia tipo:

```nginx
location / {
  root /app;
  try_files $uri $uri.html $uri/ =404;
}
```

## Caché y assets

Recomendaciones:

- Assets versionados/hash: `Cache-Control: public, max-age=31536000, immutable`.
- HTML y `env.json`: caché corto o revalidación.
- No cachear agresivamente `public/assets/env.json`, porque cambia por ambiente.
- Servir todo por HTTPS.

## Validación post-despliegue

Revisar:

- Landing pública carga.
- Login carga y redirige correctamente.
- Rutas `/student`, `/tutor`, `/admin` protegen por rol.
- Tema claro/oscuro persiste.
- Idioma cambia sin romper layout.
- Chat y WebSocket conectan si el servicio está activo.
- No hay errores 404 para chunks JS/CSS.
- No hay mismatch visible de hidratación SSR.

## Rollback

Mantener al menos el artefacto anterior disponible.

Estrategia:

- Desplegar por versión o commit SHA.
- Cambiar alias/tráfico al artefacto anterior si hay fallo.
- Limpiar caché de HTML y `env.json`.
- Mantener assets hash viejos mientras existan usuarios con HTML anterior.

## Riesgos comunes

| Riesgo | Síntoma | Mitigación |
| --- | --- | --- |
| URL de API incorrecta | Login o datos fallan | Revisar `.env` y `env.json` |
| WebSocket mal configurado | Chat sin realtime | Validar `TALK_WS` y HTTPS/WSS |
| Caché de `env.json` | Ambiente apunta a servicios viejos | Caché corto para `env.json` |
| SSR usa API de navegador | Error en server render | Proteger `window`, `document`, `localStorage` |
| Base path incorrecto en docs | Links rotos | Configurar `base` si se despliega en subruta |

