/** Modelos del planificador de tareas (espejo de los DTOs de ECIWISE-TODO). */

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';
export type Importance = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceFreq = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RecurrenceEndType = 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';
export type AchievementType = 'TASKS_COMPLETED' | 'TASKS_PLANNED';

export interface Subtask {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
  readonly position: number;
}

export interface Tag {
  readonly id: number;
  readonly name: string;
}

export interface TaskCategory {
  readonly id: number;
  readonly name: string;
  readonly color?: string | null;
}

export interface Task {
  readonly id: number;
  readonly title: string;
  readonly description?: string | null;
  readonly notes?: string | null;
  readonly status: TaskStatus;
  readonly importance: Importance;
  readonly categoryId?: number | null;
  readonly categoryName?: string | null;
  /** Fecha ISO (yyyy-MM-dd). */
  readonly scheduledDate?: string | null;
  /** Hora HH:mm[:ss]. */
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly color?: string | null;
  readonly dayOrder: number;
  readonly recurrenceFreq: RecurrenceFreq;
  readonly recurrenceInterval: number;
  readonly recurrenceEndType: RecurrenceEndType;
  readonly recurrenceEndDate?: string | null;
  readonly recurrenceCount?: number | null;
  readonly completedAt?: string | null;
  readonly subtasks: readonly Subtask[];
  readonly tags: readonly Tag[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Achievement {
  readonly id: number;
  readonly type: AchievementType;
  readonly milestone: number;
  readonly awardedAt: string;
}

/** Respuesta de una mutación: la tarea + felicitaciones recién otorgadas. */
export interface TaskMutation {
  readonly task: Task;
  readonly achievements: readonly Achievement[];
}

export interface AgendaOccurrence {
  readonly date: string;
  readonly virtual: boolean;
  readonly task: Task;
}

export interface StatsResponse {
  readonly totalTasks: number;
  readonly pending: number;
  readonly inProgress: number;
  readonly done: number;
  readonly completedThisWeek: number;
  readonly completedThisMonth: number;
  readonly completionRate: number;
  readonly currentStreakDays: number;
  readonly overdue: number;
  readonly dueToday: number;
  readonly completedByImportance: Record<Importance, number>;
}

/** Página de Spring Data (subconjunto de campos usados). */
export interface Page<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly number: number;
}

/** Cuerpo para crear/actualizar una tarea. */
export interface TaskRequest {
  title: string;
  description?: string | null;
  notes?: string | null;
  importance?: Importance;
  categoryId?: number | null;
  scheduledDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  color?: string | null;
  dayOrder?: number | null;
  recurrenceFreq?: RecurrenceFreq;
  recurrenceInterval?: number;
  recurrenceEndType?: RecurrenceEndType;
  recurrenceEndDate?: string | null;
  recurrenceCount?: number | null;
  tags?: string[];
  subtasks?: { title: string; done?: boolean; position?: number }[];
}

export interface ReorderRequest {
  scheduledDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  dayOrder?: number | null;
}

export interface TaskSearchParams {
  date?: string | null;
  title?: string | null;
  importance?: Importance | null;
  status?: TaskStatus | null;
  page?: number;
  size?: number;
}

/** Paleta de colores sugeridos para las tarjetas. */
export const TASK_COLORS: readonly string[] = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];
