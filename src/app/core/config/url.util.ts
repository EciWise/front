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

/** Normaliza URLs de servicios que pueden venir como host, URL completa o valor vacío. */
export function normalizeServiceUrl(value: string | undefined, fallback: string): string {
  const raw = (value ?? fallback).trim() || fallback;
  const url = raw.startsWith('https://http://') ? raw.slice('https://'.length) : raw;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('ws://') ||
    url.startsWith('wss://')
  ) {
    return stripTrailingSlashes(url);
  }

  const protocol =
    url.startsWith('localhost') || url.startsWith('127.0.0.1') ? 'http://' : 'https://';
  return stripTrailingSlashes(`${protocol}${url}`);
}
