import { IconName } from '../../shared/ui/icon/icon';

/** Representación visual de un logro: icono (Lucide) y color de acento. */
export interface AchievementVisual {
  readonly icon: IconName;
  readonly color: string;
}

/**
 * Mapa determinista de `code` (StrategyKey del backend) → icono + color, para
 * que el toast y la insignia del logro sean coherentes con su temática. Si el
 * código no está mapeado, cae a un trofeo institucional.
 */
const VISUALS: Readonly<Record<string, AchievementVisual>> = {
  // Juegos
  FIRST_GAME: { icon: 'games', color: '#6366f1' },
  // Tutorías (estudiante asiste)
  FIRST_LESSON_ATTENDED: { icon: 'tutorias', color: '#3b82f6' },
  DEDICATED_LEARNER: { icon: 'tutorias', color: '#2563eb' },
  // Materiales
  FIRST_MATERIAL: { icon: 'materials', color: '#10b981' },
  ACTIVE_COLLABORATOR: { icon: 'materials', color: '#059669' },
  // Tutorías (tutor dicta / calificación)
  FIRST_TUTORING: { icon: 'tutorias', color: '#0ea5e9' },
  EXPERIENCED_TUTOR: { icon: 'tutorias', color: '#0284c7' },
  FIRST_RATING: { icon: 'star', color: '#f59e0b' },
  OUTSTANDING_TUTOR: { icon: 'star', color: '#d97706' },
  // Práctica (quizzes)
  FIRST_QUIZ: { icon: 'quiz', color: '#f97316' },
  QUIZ_MASTER: { icon: 'quiz', color: '#ea580c' },
  // Aprendizaje (estudio)
  FIRST_STUDY: { icon: 'aprendizaje', color: '#8b5cf6' },
  CONSISTENT_STUDENT: { icon: 'aprendizaje', color: '#7c3aed' },
  // Hitos por puntos
  POINTS_100: { icon: 'trophy', color: '#c8102e' },
  POINTS_500: { icon: 'trophy', color: '#eab308' },
  // Perfil de IA
  AI_PROFILE_COMPLETED: { icon: 'assistant', color: '#14b8a6' },
  // Centro de ayuda
  HELP_QUESTION_OPENED: { icon: 'help', color: '#f43f5e' },
};

const FALLBACK: AchievementVisual = { icon: 'trophy', color: '#c8102e' };

/** Devuelve el icono y color asociados a un logro por su código. */
export function achievementVisual(code: string | null | undefined): AchievementVisual {
  return (code && VISUALS[code]) || FALLBACK;
}
