import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { TODO_CONFIG } from '../../../core/todo/todo.config';
import { Task, TaskMutation } from './task.model';

const BASE = 'http://localhost:8083/api';

/** Tarea mínima válida para las pruebas (rellena los campos requeridos). */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Estudiar para el parcial',
    status: 'PENDING',
    importance: 'MEDIUM',
    dayOrder: 0,
    recurrenceFreq: 'NONE',
    recurrenceInterval: 1,
    recurrenceEndType: 'NEVER',
    subtasks: [],
    tags: [],
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('TasksService', () => {
  let service: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TODO_CONFIG, useValue: { todoApiUrl: 'http://localhost:8083' } },
      ],
    });
    service = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga las tareas y las publica en el signal', () => {
    service.load().subscribe();

    const req = http.expectOne(`${BASE}/tasks`);
    expect(req.request.method).toBe('GET');
    req.flush([makeTask()]);

    expect(service.tasks().length).toBe(1);
    expect(service.tasks().at(0)?.title).toBe('Estudiar para el parcial');
  });

  it('crea una tarea y la añade al estado local con su felicitación', () => {
    const mutation: TaskMutation = {
      task: makeTask({ id: 9, title: 'Tarea nueva' }),
      achievements: [
        { id: 1, type: 'TASKS_PLANNED', milestone: 5, awardedAt: '2026-06-01T00:00:00Z' },
      ],
    };

    service.create({ title: 'Tarea nueva' }).subscribe();

    const req = http.expectOne(`${BASE}/tasks`);
    expect(req.request.method).toBe('POST');
    req.flush(mutation);

    expect(service.tasks().some((t) => t.id === 9)).toBe(true);
    expect(service.lastAchievement()?.milestone).toBe(5);
  });

  it('actualiza el estado y recalcula las pendientes', () => {
    service.load().subscribe();
    http.expectOne(`${BASE}/tasks`).flush([makeTask({ id: 3, status: 'PENDING' })]);
    expect(service.pendingCount()).toBe(1);

    service.setStatus(3, 'DONE').subscribe();
    const req = http.expectOne(`${BASE}/tasks/3/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'DONE' });
    req.flush({ task: makeTask({ id: 3, status: 'DONE' }), achievements: [] } as TaskMutation);

    expect(service.tasks().find((t) => t.id === 3)?.status).toBe('DONE');
    expect(service.pendingCount()).toBe(0);
  });

  it('propaga el error cuando el backend falla', () => {
    let failed = false;
    service.load().subscribe({ error: () => (failed = true) });

    http.expectOne(`${BASE}/tasks`).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
