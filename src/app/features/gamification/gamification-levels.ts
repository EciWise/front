import { IconName } from '../../shared/ui/icon/icon';

/**
 * Presentación visual (insignia) de cada nivel. La escalera real (nombres y
 * umbrales) llega del backend; aquí solo mapeamos nombre → icono + acento para
 * las insignias festivas. Hay un fallback por si el backend añade niveles nuevos.
 */
export interface LevelBadge {
  readonly icon: IconName;
  /** Gradiente CSS del anillo/insignia. */
  readonly gradient: string;
}

const BADGES: Record<string, LevelBadge> = {
  Inicial: { icon: 'star', gradient: 'linear-gradient(135deg, #34d399, #0ea5e9)' },
  Aprendiz: { icon: 'flame', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  Colaborador: { icon: 'target', gradient: 'linear-gradient(135deg, #c084fc, #7c3aed)' },
  Experto: { icon: 'trophy', gradient: 'linear-gradient(135deg, #fcd34d, #c8102e)' },
};

const FALLBACK: LevelBadge = {
  icon: 'star',
  gradient: 'linear-gradient(135deg, #94a3b8, #475569)',
};

export function levelBadge(levelName: string): LevelBadge {
  return BADGES[levelName] ?? FALLBACK;
}
