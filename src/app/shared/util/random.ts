/**
 * Aleatoriedad para efectos visuales (confeti, estrellas, sprites flotantes).
 *
 * Usa la Web Crypto API (`crypto.getRandomValues`) en lugar de `Math.random`:
 * además de no estar marcado como hotspot de seguridad, ofrece una distribución
 * sin sesgo. Estos efectos sólo se montan en el navegador (tras `afterNextRender`),
 * donde `crypto` está siempre disponible.
 */

const MAX_UINT32 = 2 ** 32;

/** Número en coma flotante en el rango [0, 1). */
export function randomFloat(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] / MAX_UINT32;
}

/** Número en coma flotante en el rango [min, max). */
export function randomRange(min: number, max: number): number {
  return min + randomFloat() * (max - min);
}

/** Entero en el rango [0, maxExclusive). */
export function randomInt(maxExclusive: number): number {
  return Math.floor(randomFloat() * maxExclusive);
}

/** `true` o `false` con igual probabilidad. */
export function randomBool(): boolean {
  return randomFloat() < 0.5;
}

/** Elemento al azar de un array no vacío. */
export function randomItem<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}
