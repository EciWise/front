import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TODO_CONFIG } from '../../../core/todo/todo.config';
import {
  Achievement,
  AgendaOccurrence,
  Page,
  ReorderRequest,
  StatsResponse,
  Task,
  TaskCategory,
  TaskMutation,
  TaskRequest,
  TaskSearchParams,
  TaskStatus,
} from './task.model';

/**
 * Cliente HTTP del microservicio ECIWISE-TODO. Mantiene un signal con las tareas
 * del usuario sincronizado tras cada mutación. El JWT lo adjunta el
 * authInterceptor y los errores los normaliza el errorInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TODO_CONFIG);

  private get base(): string {
    return `${this.config.todoApiUrl.replace(/\/+$/, '')}/api`;
  }

  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();
  readonly pendingCount = computed(() => this._tasks().filter((t) => t.status !== 'DONE').length);

  /** Última felicitación recibida, para que la UI muestre el toast. */
  private readonly _lastAchievement = signal<Achievement | null>(null);
  readonly lastAchievement = this._lastAchievement.asReadonly();

  clearAchievement(): void {
    this._lastAchievement.set(null);
  }

  // --- Carga ---
  load(): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${this.base}/tasks`)
      .pipe(tap((tasks) => this._tasks.set(tasks)));
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/tasks/${id}`);
  }

  // --- Mutaciones ---
  create(body: TaskRequest): Observable<TaskMutation> {
    return this.http
      .post<TaskMutation>(`${this.base}/tasks`, body)
      .pipe(tap((m) => this.onMutation(m)));
  }

  update(id: number, body: TaskRequest): Observable<TaskMutation> {
    return this.http
      .put<TaskMutation>(`${this.base}/tasks/${id}`, body)
      .pipe(tap((m) => this.onMutation(m)));
  }

  setStatus(id: number, status: TaskStatus): Observable<TaskMutation> {
    return this.http
      .patch<TaskMutation>(`${this.base}/tasks/${id}/status`, { status })
      .pipe(tap((m) => this.onMutation(m)));
  }

  reschedule(id: number, body: ReorderRequest): Observable<Task> {
    return this.http
      .put<Task>(`${this.base}/tasks/${id}/schedule`, body)
      .pipe(tap((task) => this.replaceLocal(task)));
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/tasks/${id}`)
      .pipe(tap(() => this._tasks.set(this._tasks().filter((t) => t.id !== id))));
  }

  // --- Consultas ---
  search(params: TaskSearchParams): Observable<Page<Task>> {
    let httpParams = new HttpParams();
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.importance) httpParams = httpParams.set('importance', params.importance);
    if (params.status) httpParams = httpParams.set('status', params.status);
    httpParams = httpParams.set('page', String(params.page ?? 0));
    httpParams = httpParams.set('size', String(params.size ?? 50));
    return this.http.get<Page<Task>>(`${this.base}/tasks/search`, { params: httpParams });
  }

  agenda(from: string, to: string): Observable<AgendaOccurrence[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AgendaOccurrence[]>(`${this.base}/tasks/agenda`, { params });
  }

  overdue(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/tasks/overdue`);
  }

  today(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/tasks/today`);
  }

  // --- Recursos auxiliares ---
  categories(): Observable<TaskCategory[]> {
    return this.http.get<TaskCategory[]>(`${this.base}/categories`);
  }

  achievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.base}/achievements`);
  }

  stats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.base}/stats`);
  }

  // --- Estado local ---
  private onMutation(mutation: TaskMutation): void {
    this.replaceLocal(mutation.task);
    if (mutation.achievements.length > 0) {
      this._lastAchievement.set(mutation.achievements[mutation.achievements.length - 1]);
    }
  }

  private replaceLocal(task: Task): void {
    const current = this._tasks();
    const idx = current.findIndex((t) => t.id === task.id);
    if (idx === -1) {
      this._tasks.set([...current, task]);
    } else {
      const next = [...current];
      next[idx] = task;
      this._tasks.set(next);
    }
  }
}
