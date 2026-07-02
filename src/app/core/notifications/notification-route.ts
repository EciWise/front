import { Role, ROLE_HOME } from '../models/role.enum';

/** Sección de la app a la que pertenece una notificación. */
export type NotificationCategory =
  | 'achievement'
  | 'tutoring'
  | 'material'
  | 'chat'
  | 'forum'
  | 'account'
  | 'general';

/**
 * Deriva la categoría a partir del `type` (severidad) y el `asunto`. Los asuntos
 * son cadenas estables del catálogo de plantillas del backend (`TemplateEnum`),
 * independientes del idioma del usuario, por lo que sirven como discriminante.
 */
export function categoryFromApi(asunto: string, type: string): NotificationCategory {
  if (type === 'achievement') return 'achievement';

  const a = (asunto ?? '').trim();
  if (a.startsWith('Hay un nuevo mensaje')) return 'chat';
  if (
    a.startsWith('Hay una nueva respuesta en el foro') ||
    a.startsWith('Has sido mencionado') ||
    a.startsWith('Se ha creado un nuevo hilo')
  ) {
    return 'forum';
  }
  if (a.startsWith('Se ha subido un nuevo material')) return 'material';
  if (a.startsWith('Has desbloqueado') || a.startsWith('Has subido de nivel')) {
    return 'achievement';
  }
  if (a.startsWith('Su rol') || a.startsWith('Su cuenta') || a.startsWith('Nuevo usuario')) {
    return 'account';
  }
  if (a.toLowerCase().includes('tutoría')) return 'tutoring';

  return 'general';
}

/** Sección concreta por categoría y rol. Vacío = sin sección propia para el rol. */
const SECTION_BY_ROLE: Record<NotificationCategory, Partial<Record<Role, string>>> = {
  achievement: { [Role.Student]: 'gamificacion', [Role.Tutor]: 'gamificacion' },
  tutoring: { [Role.Student]: 'tutorias', [Role.Tutor]: 'schedule', [Role.Admin]: 'monitorias' },
  material: { [Role.Student]: 'materials', [Role.Tutor]: 'aprendizaje', [Role.Admin]: 'materiales' },
  forum: { [Role.Student]: 'foros' },
  account: { [Role.Student]: 'profile', [Role.Tutor]: 'profile' },
  chat: {},
  general: {},
};

/** Categorías con destino conocido: si el rol no tiene sección, cae a su inicio. */
const NAVIGABLE: ReadonlySet<NotificationCategory> = new Set([
  'achievement',
  'tutoring',
  'material',
  'forum',
  'account',
]);

/**
 * Comandos de router para navegar a la sección de una notificación según el rol
 * del usuario. Devuelve `null` cuando no corresponde navegar (chat/general o sin
 * rol conocido).
 */
export function routeForNotification(
  category: NotificationCategory,
  role: Role | null,
): string[] | null {
  if (!role) return null;

  const section = SECTION_BY_ROLE[category][role];
  if (section) return [ROLE_HOME[role], section];
  if (NAVIGABLE.has(category)) return [ROLE_HOME[role]];

  return null;
}
