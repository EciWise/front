import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TODO_CONFIG } from '../../../core/todo/todo.config';
import {
  Achievement,
  AgendaOccurrence,
  Page,
  StatsResponse,
  Task,
  TaskCategory,
  TaskMutation,
} from './task.model';
import { TasksService } from './tasks.service';

const BASE = 'http://localhost:8083/api';

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

function makeMutation(task: Task, achievements: readonly Achievement[] = []): TaskMutation {
  return { task, achievements };
}

describe('TasksService', () => {
  let service: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TODO_CONFIG, useValue: { todoApiUrl: 'http://localhost:8083/' } },
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

    expect(service.tasks()).toHaveLength(1);
    expect(service.tasks().at(0)?.title).toBe('Estudiar para el parcial');
    expect(service.pendingCount()).toBe(1);
  });

  it('obtiene una tarea por id sin modificar el estado local', () => {
    let result: Task | undefined;
    service.get(7).subscribe((task) => (result = task));

    const req = http.expectOne(`${BASE}/tasks/7`);
    expect(req.request.method).toBe('GET');
    req.flush(makeTask({ id: 7 }));

    expect(result?.id).toBe(7);
    expect(service.tasks()).toEqual([]);
  });

  it('crea una tarea y la agrega al estado local con su felicitacion', () => {
    const achievement: Achievement = {
      id: 1,
      type: 'TASKS_PLANNED',
      milestone: 5,
      awardedAt: '2026-06-01T00:00:00Z',
    };

    service.create({ title: 'Tarea nueva' }).subscribe();

    const req = http.expectOne(`${BASE}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Tarea nueva' });
    req.flush(makeMutation(makeTask({ id: 9, title: 'Tarea nueva' }), [achievement]));

    expect(service.tasks().some((task) => task.id === 9)).toBe(true);
    expect(service.lastAchievement()).toEqual(achievement);
  });

  it('actualiza una tarea existente y conserva la ultima felicitacion si no hay nuevas', () => {
    service.load().subscribe();
    http.expectOne(`${BASE}/tasks`).flush([makeTask({ id: 1, title: 'Original' })]);

    service.create({ title: 'Otra' }).subscribe();
    http.expectOne(`${BASE}/tasks`).flush(
      makeMutation(makeTask({ id: 2, title: 'Otra' }), [
        { id: 1, type: 'TASKS_PLANNED', milestone: 5, awardedAt: '2026-06-01T00:00:00Z' },
      ]),
    );

    service.update(1, { title: 'Editada' }).subscribe();
    const req = http.expectOne(`${BASE}/tasks/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Editada' });
    req.flush(makeMutation(makeTask({ id: 1, title: 'Editada' })));

    expect(service.tasks().map((task) => task.title)).toEqual(['Editada', 'Otra']);
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
    req.flush(makeMutation(makeTask({ id: 3, status: 'DONE' })));

    expect(service.tasks().find((task) => task.id === 3)?.status).toBe('DONE');
    expect(service.pendingCount()).toBe(0);
  });

  it('reprograma una tarea agregandola si no existe y reemplazandola si existe', () => {
    service.reschedule(8, { scheduledDate: '2026-06-03', dayOrder: 2 }).subscribe();
    let req = http.expectOne(`${BASE}/tasks/8/schedule`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ scheduledDate: '2026-06-03', dayOrder: 2 });
    req.flush(makeTask({ id: 8, scheduledDate: '2026-06-03', dayOrder: 2 }));
    expect(service.tasks().find((task) => task.id === 8)?.dayOrder).toBe(2);

    service.reschedule(8, { scheduledDate: '2026-06-04', dayOrder: 0 }).subscribe();
    req = http.expectOne(`${BASE}/tasks/8/schedule`);
    req.flush(makeTask({ id: 8, scheduledDate: '2026-06-04', dayOrder: 0 }));

    expect(service.tasks().filter((task) => task.id === 8)).toHaveLength(1);
    expect(service.tasks().find((task) => task.id === 8)?.scheduledDate).toBe('2026-06-04');
  });

  it('elimina una tarea localmente despues de borrar en backend', () => {
    service.load().subscribe();
    http.expectOne(`${BASE}/tasks`).flush([makeTask({ id: 1 }), makeTask({ id: 2 })]);

    service.remove(1).subscribe();
    const req = http.expectOne(`${BASE}/tasks/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.tasks().map((task) => task.id)).toEqual([2]);
  });

  it('busca tareas con filtros explicitos y valores por defecto de paginacion', () => {
    let page: Page<Task> | undefined;
    service
      .search({
        date: '2026-06-01',
        title: 'parcial',
        importance: 'HIGH',
        status: 'PENDING',
      })
      .subscribe((result) => (page = result));

    const req = http.expectOne((request) => request.url === `${BASE}/tasks/search`);
    expect(req.request.params.get('date')).toBe('2026-06-01');
    expect(req.request.params.get('title')).toBe('parcial');
    expect(req.request.params.get('importance')).toBe('HIGH');
    expect(req.request.params.get('status')).toBe('PENDING');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('50');
    req.flush({ content: [makeTask()], totalElements: 1, totalPages: 1, number: 0 });

    expect(page?.totalElements).toBe(1);
  });

  it('busca tareas sin filtros opcionales y respeta page/size custom', () => {
    service.search({ page: 2, size: 5 }).subscribe();

    const req = http.expectOne((request) => request.url === `${BASE}/tasks/search`);
    expect(req.request.params.has('date')).toBe(false);
    expect(req.request.params.has('title')).toBe(false);
    expect(req.request.params.has('importance')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 2 });
  });

  it('consulta agenda, listados auxiliares y estadisticas', () => {
    let agenda: AgendaOccurrence[] | undefined;
    service.agenda('2026-06-01', '2026-06-07').subscribe((result) => (agenda = result));
    let req = http.expectOne((request) => request.url === `${BASE}/tasks/agenda`);
    expect(req.request.params.get('from')).toBe('2026-06-01');
    expect(req.request.params.get('to')).toBe('2026-06-07');
    req.flush([{ date: '2026-06-01', virtual: false, task: makeTask() }]);
    expect(agenda?.at(0)?.date).toBe('2026-06-01');

    service.overdue().subscribe();
    req = http.expectOne(`${BASE}/tasks/overdue`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.today().subscribe();
    req = http.expectOne(`${BASE}/tasks/today`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    let categories: TaskCategory[] | undefined;
    service.categories().subscribe((result) => (categories = result));
    req = http.expectOne(`${BASE}/categories`);
    req.flush([{ id: 1, name: 'Academico', color: '#3b82f6' }]);
    expect(categories?.at(0)?.name).toBe('Academico');

    let achievements: Achievement[] | undefined;
    service.achievements().subscribe((result) => (achievements = result));
    req = http.expectOne(`${BASE}/achievements`);
    req.flush([
      { id: 1, type: 'TASKS_COMPLETED', milestone: 10, awardedAt: '2026-06-01T00:00:00Z' },
    ]);
    expect(achievements?.at(0)?.type).toBe('TASKS_COMPLETED');

    let stats: StatsResponse | undefined;
    service.stats().subscribe((result) => (stats = result));
    req = http.expectOne(`${BASE}/stats`);
    req.flush({
      totalTasks: 10,
      pending: 3,
      inProgress: 2,
      done: 5,
      completedThisWeek: 2,
      completedThisMonth: 5,
      completionRate: 50,
      currentStreakDays: 4,
      overdue: 1,
      dueToday: 2,
      completedByImportance: { LOW: 1, MEDIUM: 2, HIGH: 1, URGENT: 1 },
    });
    expect(stats?.currentStreakDays).toBe(4);
  });

  it('limpia la ultima felicitacion publicada', () => {
    service.create({ title: 'Tarea nueva' }).subscribe();
    http.expectOne(`${BASE}/tasks`).flush(
      makeMutation(makeTask({ id: 6 }), [
        { id: 2, type: 'TASKS_COMPLETED', milestone: 1, awardedAt: '2026-06-01T00:00:00Z' },
      ]),
    );

    expect(service.lastAchievement()).not.toBeNull();
    service.clearAchievement();
    expect(service.lastAchievement()).toBeNull();
  });

  it('propaga el error cuando el backend falla', () => {
    let failed = false;
    service.load().subscribe({ error: () => (failed = true) });

    http.expectOne(`${BASE}/tasks`).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
