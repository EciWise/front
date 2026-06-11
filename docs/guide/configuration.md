# Configuracion runtime

## Flujo de configuracion

1. `.env` define URLs de servicios.
2. `scripts/write-env.mjs` genera `public/assets/env.json`.
3. `EnvService` carga `assets/env.json` durante el bootstrap.
4. `app.config.ts` expone tokens de configuracion por dominio.
5. Los servicios consumen esos tokens mediante `inject()`.

## Variables soportadas

| Variable | Uso | Default en codigo |
| --- | --- | --- |
| `AUTH_SERVICE` | Servicio de auth, usuarios, IA admin | `http://localhost:3001` |
| `STUDY_SERVICE` | Servicio de aprendizaje | `http://localhost:8082` |
| `TALK_SERVICE` | API REST de chat | `http://localhost:3003` |
| `TALK_WS` | WebSocket/STOMP de chat | `ws://localhost:3003/ws/chat` |
| `TODO_SERVICE` | Servicio de tareas | `http://localhost:8083` |
| `PORT` | Servidor SSR o dev wrapper | `4000` |

## Tokens Angular

| Token | Archivo | Consumidores |
| --- | --- | --- |
| `AUTH_CONFIG` | `core/auth/auth.config.ts` | Auth, usuarios, IA admin |
| `STUDY_CONFIG` | `core/study/study.config.ts` | Aprendizaje |
| `TALK_CONFIG` | `core/talk/talk.config.ts` | Chat REST y realtime |
| `TODO_CONFIG` | `core/todo/todo.config.ts` | Tareas |

## Reglas

- No leer `.env` directamente desde componentes.
- No hardcodear URLs dentro de servicios.
- Para un nuevo backend, crear un token de configuracion en `core/<dominio>`.
- Normalizar URLs con helpers de `core/config/url.util.ts`.

