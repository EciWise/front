/**
 * JWT de juguete para tests: `jwt-decode` no verifica la firma, así que basta un
 * payload codificado en base64url. Útil para simular tokens vigentes/vencidos.
 */
export function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}
