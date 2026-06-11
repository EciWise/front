# Autenticacion

## Responsabilidades

El dominio `auth` cubre:

- Login por email.
- Registro de estudiante.
- Inicio de sesion con Google mediante redireccion al backend.
- Callback OAuth.
- Cambio forzado de contrasena para cuentas importadas por CSV.
- Captura de datos de IA durante registro o cambio forzado.

## Servicio principal

`AuthService` vive en `src/app/core/auth/auth.service.ts`.

Funciones relevantes:

- `loginWithEmail(credentials)`
- `register(payload)`
- `changePassword(newPassword, datosIa?)`
- `startGoogleLogin()`
- `completeSession(token, apiUser)`
- `logout()`
- `updateProfile(changes)`

## Persistencia local

El servicio guarda:

- JWT en `eciwise.token`.
- Usuario serializado en `eciwise.session`.

El token se valida con `jwtDecode`; si esta expirado o corrupto se limpia la sesion.

## Guards

- `authGuard`: requiere usuario autenticado.
- `roleGuard`: requiere rol especifico en `data.role`.

## Modelos

Los modelos viven en `src/app/core/models/user.model.ts` y `src/app/core/models/role.enum.ts`.

`roleFromApi` normaliza el rol recibido desde backend al enum interno.

## Formularios de IA

Los campos de IA se reutilizan entre registro y cambio forzado:

- `datos-ia-form.ts`
- `datos-ia-fields/`
- `dropout-ia-form.ts`
- `dropout-ia-fields/`
- `wizard-fields.base.ts`
- `wizard-chrome/`

