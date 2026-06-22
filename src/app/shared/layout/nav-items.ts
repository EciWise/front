import { Role } from '../../core/models/role.enum';
import { IconName } from '../ui/icon/icon';

/** Ítem de navegación lateral. */
export interface NavItem {
  readonly labelKey: string;
  readonly route: string;
  readonly icon: IconName;
  /** true si la ruta debe coincidir de forma exacta (índice del área). */
  readonly exact?: boolean;
  /** Clave de traducción para la descripción (se muestra en las tarjetas de acceso rápido). */
  readonly descKey?: string;
}

/** Grupo de ítems en el menú lateral con un label de sección. */
export interface NavGroup {
  readonly labelKey: string;
  readonly items: readonly NavItem[];
}

const STUDENT_NAV: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', route: '/student', icon: 'dashboard', exact: true },
  { labelKey: 'nav.tutorias', route: '/student/tutorias', icon: 'tutorias' },
  { labelKey: 'nav.materials', route: '/student/materials', icon: 'materials' },
  { labelKey: 'nav.games', route: '/student/games', icon: 'games' },
  { labelKey: 'nav.practica', route: '/student/practica', icon: 'quiz' },
  { labelKey: 'nav.aprendizaje', route: '/student/aprendizaje', icon: 'aprendizaje' },
  { labelKey: 'nav.tasks', route: '/student/tasks', icon: 'tasks' },
  { labelKey: 'nav.achievements', route: '/student/logros', icon: 'trophy' },
  { labelKey: 'nav.forums', route: '/student/foros', icon: 'chat' },
];

const TUTOR_NAV: readonly NavItem[] = [
  { labelKey: 'nav.controlCenter', route: '/tutor', icon: 'dashboard', exact: true },
  { labelKey: 'nav.students', route: '/tutor/estudiantes', icon: 'users' },
  { labelKey: 'nav.schedule', route: '/tutor/schedule', icon: 'schedule' },
  { labelKey: 'nav.availability', route: '/tutor/availability', icon: 'availability' },
  { labelKey: 'nav.requests', route: '/tutor/requests', icon: 'requests' },
  { labelKey: 'nav.history', route: '/tutor/history', icon: 'history' },
  { labelKey: 'nav.aprendizaje', route: '/tutor/aprendizaje', icon: 'aprendizaje' },
  { labelKey: 'nav.practica', route: '/tutor/practica', icon: 'quiz' },
];

const ADMIN_NAV: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', route: '/admin', icon: 'dashboard', exact: true },
  { labelKey: 'nav.users', route: '/admin/users', icon: 'users', descKey: 'nav.desc.users' },
  { labelKey: 'nav.statistics', route: '/admin/estadisticas', icon: 'trophy', descKey: 'nav.desc.statistics' },
  { labelKey: 'nav.predictions', route: '/admin/predicciones', icon: 'assistant', descKey: 'nav.desc.predictions' },
  { labelKey: 'nav.assignments', route: '/admin/asignaciones', icon: 'add-user', descKey: 'nav.desc.assignments' },
  { labelKey: 'nav.aprendizaje', route: '/admin/aprendizaje', icon: 'aprendizaje' },
  { labelKey: 'nav.practica', route: '/admin/practica', icon: 'quiz' },
];

const NAV_BY_ROLE: Record<Role, readonly NavItem[]> = {
  [Role.Student]: STUDENT_NAV,
  [Role.Tutor]: TUTOR_NAV,
  [Role.Admin]: ADMIN_NAV,
};

// ── Grupos por rol ──────────────────────────────────────────────────────────

const STUDENT_GROUPS: readonly NavGroup[] = [
  { labelKey: 'nav.grp.principal', items: [STUDENT_NAV[0]] },
  { labelKey: 'nav.grp.learn', items: [STUDENT_NAV[4], STUDENT_NAV[5], STUDENT_NAV[2], STUDENT_NAV[3]] },
  { labelKey: 'nav.grp.accompany', items: [STUDENT_NAV[1]] },
  { labelKey: 'nav.grp.community', items: [STUDENT_NAV[8], STUDENT_NAV[6], STUDENT_NAV[7]] },
];

const TUTOR_GROUPS: readonly NavGroup[] = [
  { labelKey: 'nav.grp.principal', items: [TUTOR_NAV[0]] },
  { labelKey: 'nav.grp.students', items: [TUTOR_NAV[1]] },
  { labelKey: 'nav.grp.tutorias', items: [TUTOR_NAV[2], TUTOR_NAV[3], TUTOR_NAV[4], TUTOR_NAV[5]] },
  { labelKey: 'nav.grp.content', items: [TUTOR_NAV[6], TUTOR_NAV[7]] },
];

const ADMIN_GROUPS: readonly NavGroup[] = [
  { labelKey: 'nav.grp.principal', items: [ADMIN_NAV[0]] },
  { labelKey: 'nav.grp.manage', items: [ADMIN_NAV[1]] },
  { labelKey: 'nav.grp.analytics', items: [ADMIN_NAV[2], ADMIN_NAV[3]] },
  { labelKey: 'nav.grp.content', items: [ADMIN_NAV[4], ADMIN_NAV[5], ADMIN_NAV[6]] },
];

const GROUPS_BY_ROLE: Record<Role, readonly NavGroup[]> = {
  [Role.Student]: STUDENT_GROUPS,
  [Role.Tutor]: TUTOR_GROUPS,
  [Role.Admin]: ADMIN_GROUPS,
};

/** Devuelve los ítems de navegación correspondientes a un rol (lista plana). */
export function navItemsFor(role: Role | null): readonly NavItem[] {
  return role ? NAV_BY_ROLE[role] : [];
}

// ── Entradas de búsqueda global (secciones + sub-secciones) ─────────────────

/** Entrada buscable: extiende NavItem con un padre opcional para mostrar la jerarquía. */
export interface SearchEntry extends NavItem {
  readonly parentLabelKey?: string;
}

const STUDENT_SUBSECTIONS: readonly SearchEntry[] = [
  { labelKey: 'tutorias.tabs.search',           route: '/student/tutorias',    icon: 'tutorias',    parentLabelKey: 'nav.tutorias' },
  { labelKey: 'tutorias.tabs.reservations',      route: '/student/tutorias',    icon: 'tutorias',    parentLabelKey: 'nav.tutorias' },
  { labelKey: 'tutorias.tabs.recommendations',   route: '/student/tutorias',    icon: 'tutorias',    parentLabelKey: 'nav.tutorias' },
  { labelKey: 'tutorias.tabs.history',           route: '/student/tutorias',    icon: 'tutorias',    parentLabelKey: 'nav.tutorias' },
  { labelKey: 'practica.tab.play',               route: '/student/practica',    icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.history',            route: '/student/practica',    icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.leaderboard',        route: '/student/practica',    icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'aprendizaje.tab.collections',     route: '/student/aprendizaje', icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.study',           route: '/student/aprendizaje', icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.stats',           route: '/student/aprendizaje', icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
];

const TUTOR_SUBSECTIONS: readonly SearchEntry[] = [
  { labelKey: 'practica.tab.play',               route: '/tutor/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.questions',          route: '/tutor/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.collections',        route: '/tutor/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.subjects',           route: '/tutor/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'aprendizaje.tab.collections',     route: '/tutor/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.study',           route: '/tutor/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.stats',           route: '/tutor/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
];

const ADMIN_SUBSECTIONS: readonly SearchEntry[] = [
  { labelKey: 'admin.users.tabList',             route: '/admin/users',         icon: 'users',       parentLabelKey: 'nav.users' },
  { labelKey: 'admin.users.tabImport',           route: '/admin/users',         icon: 'users',       parentLabelKey: 'nav.users' },
  { labelKey: 'admin.statistics.tabSummary',     route: '/admin/estadisticas',  icon: 'trophy',      parentLabelKey: 'nav.statistics' },
  { labelKey: 'admin.statistics.tabPlatform',    route: '/admin/estadisticas',  icon: 'trophy',      parentLabelKey: 'nav.statistics' },
  { labelKey: 'admin.statistics.tabIa',          route: '/admin/estadisticas',  icon: 'trophy',      parentLabelKey: 'nav.statistics' },
  { labelKey: 'admin.statistics.tabTutoring',    route: '/admin/estadisticas',  icon: 'trophy',      parentLabelKey: 'nav.statistics' },
  { labelKey: 'practica.tab.play',               route: '/admin/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.questions',          route: '/admin/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'practica.tab.collections',        route: '/admin/practica',      icon: 'quiz',        parentLabelKey: 'nav.practica' },
  { labelKey: 'aprendizaje.tab.collections',     route: '/admin/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.study',           route: '/admin/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
  { labelKey: 'aprendizaje.tab.stats',           route: '/admin/aprendizaje',   icon: 'aprendizaje', parentLabelKey: 'nav.aprendizaje' },
];

const SEARCH_ENTRIES_BY_ROLE: Record<Role, readonly SearchEntry[]> = {
  [Role.Student]: [...STUDENT_NAV, ...STUDENT_SUBSECTIONS],
  [Role.Tutor]:   [...TUTOR_NAV,   ...TUTOR_SUBSECTIONS],
  [Role.Admin]:   [...ADMIN_NAV,   ...ADMIN_SUBSECTIONS],
};

/** Todas las entradas buscables (secciones + sub-secciones) para un rol. */
export function searchEntriesFor(role: Role | null): readonly SearchEntry[] {
  return role ? SEARCH_ENTRIES_BY_ROLE[role] : [];
}

/** Devuelve los grupos de navegación (con label de sección) para un rol. */
export function navGroupsFor(role: Role | null): readonly NavGroup[] {
  return role ? GROUPS_BY_ROLE[role] : [];
}
