import { Role } from '../../core/models/role.enum';

/** Fila de usuario extraída de un CSV. */
export interface CsvUserRow {
  readonly name: string;
  readonly email: string;
  readonly role: Role;
}

const ROLE_VALUES = new Set<string>(Object.values(Role));

/**
 * Parsea un CSV de usuarios con columnas: nombre, correo, rol.
 * Ignora una fila de encabezado si la primera celda no parece un correo y
 * descarta filas con rol inválido o correo vacío. Función pura.
 */
export function parseUsersCsv(text: string): CsvUserRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const rows: CsvUserRow[] = [];
  for (const [index, line] of lines.entries()) {
    const cells = line.split(',').map((c) => c.trim());
    if (cells.length < 3) {
      continue;
    }
    const [name, email, rawRole] = cells;
    // Salta el encabezado: primera fila sin '@' en el correo.
    if (index === 0 && !email.includes('@')) {
      continue;
    }
    const role = rawRole.toUpperCase();
    if (!email.includes('@') || !ROLE_VALUES.has(role)) {
      continue;
    }
    rows.push({ name, email, role: role as Role });
  }
  return rows;
}
