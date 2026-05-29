import { Role } from '../../core/models/role.enum';
import { IconName } from '../ui/icon/icon';

/** Ítem de navegación lateral. */
export interface NavItem {
  readonly labelKey: string;
  readonly route: string;
  readonly icon: IconName;
  /** true si la ruta debe coincidir de forma exacta (índice del área). */
  readonly exact?: boolean;
}

const STUDENT_NAV: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', route: '/student', icon: 'dashboard', exact: true },
  { labelKey: 'nav.monitorias', route: '/student/monitorias', icon: 'monitorias' },
  { labelKey: 'nav.materials', route: '/student/materials', icon: 'materials' },
  { labelKey: 'nav.games', route: '/student/games', icon: 'games' },
  { labelKey: 'nav.study', route: '/student/study', icon: 'study' },
  { labelKey: 'nav.tasks', route: '/student/tasks', icon: 'tasks' },
  { labelKey: 'nav.profile', route: '/student/profile', icon: 'profile' },
];

const TUTOR_NAV: readonly NavItem[] = [
  { labelKey: 'nav.controlCenter', route: '/tutor', icon: 'dashboard', exact: true },
  { labelKey: 'nav.schedule', route: '/tutor/schedule', icon: 'schedule' },
  { labelKey: 'nav.availability', route: '/tutor/availability', icon: 'availability' },
  { labelKey: 'nav.requests', route: '/tutor/requests', icon: 'requests' },
  { labelKey: 'nav.history', route: '/tutor/history', icon: 'history' },
];

const ADMIN_NAV: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', route: '/admin', icon: 'dashboard', exact: true },
  { labelKey: 'nav.users', route: '/admin/users', icon: 'users' },
];

const NAV_BY_ROLE: Record<Role, readonly NavItem[]> = {
  [Role.Student]: STUDENT_NAV,
  [Role.Tutor]: TUTOR_NAV,
  [Role.Admin]: ADMIN_NAV,
};

/** Devuelve los ítems de navegación correspondientes a un rol. */
export function navItemsFor(role: Role | null): readonly NavItem[] {
  return role ? NAV_BY_ROLE[role] : [];
}
