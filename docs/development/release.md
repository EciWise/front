# Build y despliegue

## Build Angular

```powershell
npm run build
```

La salida va a:

```text
dist/ECIWISE-Front
```

El proyecto usa SSR, por lo que el servidor generado se ejecuta con:

```powershell
npm run serve:ssr:ECIWISE-Front
```

## Presupuestos

`angular.json` define:

| Tipo | Warning | Error |
| --- | --- | --- |
| `initial` | `750kB` | `1MB` |
| `anyComponentStyle` | `8kB` | `12kB` |

Si el build advierte por presupuesto inicial, revisar chunks, dependencias y lazy loading antes de subir el límite.

## Documentación

Build de documentación:

```powershell
npm run docs:build
```

Preview local:

```powershell
npm run docs:preview
```

La salida por defecto de VitePress queda en:

```text
docs/.vitepress/dist
```

## Checklist previo a entrega

- `npm run lint`
- `npm run test:ci`
- `npm run build`
- `npm run docs:build`
- Revisar rutas críticas en navegador.
- Confirmar que `.env` de ambiente apunta a servicios correctos.
- Confirmar que no hay textos visibles sin i18n en cambios nuevos.

