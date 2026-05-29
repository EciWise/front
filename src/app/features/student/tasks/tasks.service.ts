import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task, TaskStatus } from './task.model';

const STORAGE_KEY = 'eciwise.tasks';

const SEED: readonly Task[] = [
  { id: 't1', title: 'Entregar taller de Cálculo', status: 'pending', subject: 'Cálculo', dueDate: '2026-06-02' },
  { id: 't2', title: 'Preparar exposición de Física', status: 'in-progress', subject: 'Física', dueDate: '2026-06-05' },
  { id: 't3', title: 'Leer capítulo 4 de Programación', status: 'done', subject: 'Programación' },
];

/**
 * Gestiona las tareas pendientes del estudiante. Estado en memoria persistido
 * en localStorage. Reemplazable por API real sin tocar la UI.
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _tasks = signal<Task[]>(this.restore());
  readonly tasks = this._tasks.asReadonly();
  readonly pendingCount = computed(
    () => this._tasks().filter((t) => t.status !== 'done').length,
  );

  add(title: string, subject?: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const task: Task = { id: `t-${Date.now()}`, title: trimmed, status: 'pending', subject };
    this.update([...this._tasks(), task]);
  }

  setStatus(id: string, status: TaskStatus): void {
    this.update(this._tasks().map((t) => (t.id === id ? { ...t, status } : t)));
  }

  remove(id: string): void {
    this.update(this._tasks().filter((t) => t.id !== id));
  }

  private update(tasks: Task[]): void {
    this._tasks.set(tasks);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }

  private restore(): Task[] {
    if (!this.isBrowser) {
      return [...SEED];
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...SEED];
    }
    try {
      return JSON.parse(raw) as Task[];
    } catch {
      return [...SEED];
    }
  }
}
