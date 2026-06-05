/**
 * Quita las barras finales de una URL base sin usar expresiones regulares.
 *
 * Evita el patrón `url.replace(/\/+$/, '')` que SonarQube marca como hotspot de
 * ReDoS (S5852) y centraliza la construcción de URLs base que antes estaba
 * repetida en cada servicio de API.
 */
export function stripTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url.charAt(end - 1) === '/') {
    end--;
  }
  return url.slice(0, end);
}
