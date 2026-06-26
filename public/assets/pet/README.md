# Assets — Mascota por sección

Cada sección de la landing tiene su propio watermark configurado mediante variables
CSS. Cambiar imagen o posición es una sola línea en el CSS.

## Secciones activas

| ID CSS     | Sección                          | Posición actual  |
|-----------|----------------------------------|------------------|
| `#about`    | Acerca de                        | Superior-izquierda |
| `#features` | Todo tu semestre en un solo lugar | Inferior-derecha  |
| `#gallery`  | Galería                          | Superior-derecha  |
| `#team`     | Equipo                           | Inferior-izquierda |

## Cómo cambiar la imagen de una sección

Abre `src/app/features/landing/landing.css` y busca el bloque que empieza con
`/* ── Pet watermark por sección`. Cada sección tiene su propio bloque:

```css
#about {
  --section-pet: url('/assets/pet/eciwise-pet-standar.svg');  ← cambia aquí
  --pet-pos: left -4% top -5%;
}
```

Reemplaza la URL por el archivo SVG que quieras colocar en esta carpeta.

## Cómo cambiar la posición

Edita `--pet-pos` en el bloque de la sección. Usa sintaxis de `background-position`:

```css
#gallery {
  --section-pet: url('/assets/pet/eciwise-pet-galeria.svg');
  --pet-pos: center bottom -5%;   ← posición personalizada
}
```

## Requisitos del SVG

- Usar `viewBox` sin `width`/`height` fijos para que escale bien
- El watermark se renderiza al **36 % del ancho** de la sección (`background-size`)
- La opacidad está fijada en **0.07** en `.landing__band::before { opacity }`
- El `z-index: 1` del `::before` lo coloca por encima del contenido de la sección

## Convención de nombres

| Archivo                        | Uso sugerido        |
|-------------------------------|---------------------|
| `eciwise-pet-standar.svg`     | Default / Hero      |
| `eciwise-pet-about.svg`       | Sección Acerca de   |
| `eciwise-pet-features.svg`    | Sección Funcionalidades |
| `eciwise-pet-gallery.svg`     | Sección Galería     |
| `eciwise-pet-team.svg`        | Sección Equipo      |
