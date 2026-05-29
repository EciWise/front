export type TaskStatus = 'pending' | 'in-progress' | 'done';

/** Tarea pendiente del estudiante. */
export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly subject?: string;
  readonly dueDate?: string;
}
