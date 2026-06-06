import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import {
  Achievement,
  Importance,
  ReorderRequest,
  RecurrenceFreq,
  StatsResponse,
  Task,
  TaskMutation,
  TaskRequest,
  TaskSearchParams,
  TaskStatus,
} from './task.model';
import { TasksComponent } from './tasks';
import { TasksService } from './tasks.service';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Estudiar',
    status: 'PENDING',
    importance: 'MEDIUM',
    scheduledDate: '2026-06-01',
    startTime: '08:00:00',
    color: '#3b82f6',
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

const statsResponse: StatsResponse = {
  totalTasks: 4,
  pending: 2,
  inProgress: 1,
  done: 1,
  completedThisWeek: 1,
  completedThisMonth: 1,
  completionRate: 0.25,
  currentStreakDays: 3,
  overdue: 0,
  dueToday: 1,
  completedByImportance: { LOW: 0, MEDIUM: 1, HIGH: 0, URGENT: 0 },
};

interface TasksHarness {
  readonly view: SignalLike<string>;
  readonly showBacklog: SignalLike<boolean>;
  readonly showStats: SignalLike<boolean>;
  readonly expandFullDay: SignalLike<boolean>;
  readonly currentHour: SignalLike<number>;
  readonly currentMinutePct: SignalLike<number>;
  readonly selectedDate: {
    (): string;
    set(value: string): void;
  };
  readonly visibleHours: () => number[];
  readonly unscheduled: () => { readonly task: Task; readonly virtual: boolean }[];
  readonly draftTitle: SignalLike<string>;
  readonly draftImportance: SignalLike<Importance>;
  readonly draftDate: SignalLike<string>;
  readonly draftStart: SignalLike<string>;
  readonly draftColor: SignalLike<string>;
  readonly draftFreq: SignalLike<RecurrenceFreq>;
  readonly draftTags: SignalLike<string>;
  readonly showCreate: SignalLike<boolean>;
  readonly searchTitle: SignalLike<string>;
  readonly searchImportance: SignalLike<Importance | ''>;
  readonly searchStatus: SignalLike<TaskStatus | ''>;
  readonly searchDate: SignalLike<string>;
  readonly searchResults: SignalLike<readonly Task[] | null>;
  hourTasks(hour: number): { readonly task: Task; readonly virtual: boolean }[];
  hourLabel(hour: number): string;
  toggleFullDay(): void;
  toggleStats(): void;
  add(): void;
  changeStatus(task: Task, status: TaskStatus): void;
  toggleDone(task: Task): void;
  setColor(task: Task, color: string): void;
  remove(task: Task): void;
  onDrop(event: { item: { data: Task }; currentIndex: number }, targetHour: number): void;
  shiftDay(delta: number): void;
  goToday(): void;
  runSearch(): void;
  clearSearch(): void;
  dismissAchievement(): void;
  achievementKey(): string;
  statusKey(status: TaskStatus): string;
  importanceKey(importance: Importance): string;
  freqKey(freq: RecurrenceFreq): string;
}

interface SignalLike<T> {
  (): T;
  set(value: T): void;
}

describe('TasksComponent', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let tasksSignal: ReturnType<typeof signal<Task[]>>;
  let create: ReturnType<typeof vi.fn>;
  let setStatus: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let reschedule: ReturnType<typeof vi.fn>;
  let clearAchievement: ReturnType<typeof vi.fn>;
  let search: ReturnType<typeof vi.fn>;
  let stats: ReturnType<typeof vi.fn>;

  const cmp = (): TasksHarness => fixture.componentInstance as unknown as TasksHarness;

  const setup = async (
    initialTasks: Task[] = [],
    options: { achievement?: Achievement | null } = {},
  ): Promise<void> => {
    localStorage.removeItem('eciwise.tasks.showStats');
    tasksSignal = signal<Task[]>(initialTasks);
    const lastAchievement = signal<Achievement | null>(options.achievement ?? null);
    create = vi.fn((body: TaskRequest) =>
      of({ task: makeTask({ title: body.title }), achievements: [] } as TaskMutation),
    );
    setStatus = vi.fn((id: number, status: TaskStatus) =>
      of({ task: makeTask({ id, status }), achievements: [] } as TaskMutation),
    );
    update = vi.fn((id: number, body: TaskRequest) =>
      of({
        task: makeTask({
          id,
          title: body.title,
          color: body.color,
          importance: body.importance ?? 'MEDIUM',
        }),
        achievements: [],
      } as TaskMutation),
    );
    remove = vi.fn(() => of(undefined));
    reschedule = vi.fn((id: number, body: ReorderRequest) =>
      of(
        makeTask({
          id,
          scheduledDate: body.scheduledDate ?? null,
          startTime: body.startTime ?? null,
          endTime: body.endTime ?? null,
          dayOrder: body.dayOrder ?? 0,
        }),
      ),
    );
    clearAchievement = vi.fn();
    search = vi.fn(() =>
      of({
        content: [makeTask({ id: 99, title: 'Quiz' })],
        totalElements: 1,
        totalPages: 1,
        number: 0,
      }),
    );
    stats = vi.fn(() => of(statsResponse));

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: TasksService,
          useValue: {
            tasks: tasksSignal.asReadonly(),
            pendingCount: computed(() => tasksSignal().filter((task) => task.status !== 'DONE').length),
            lastAchievement: lastAchievement.asReadonly(),
            load: vi.fn(() => of(tasksSignal())),
            stats,
            create,
            setStatus,
            search,
            update,
            remove,
            reschedule,
            clearAchievement,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
  };

  it('expande la agenda para recurrencias visibles y excluye ocurrencias vencidas por conteo', async () => {
    await setup([
      makeTask({
        id: 1,
        title: 'Repeticion valida',
        scheduledDate: '2026-06-01',
        startTime: '05:30:00',
        recurrenceFreq: 'DAILY',
        recurrenceInterval: 2,
        recurrenceEndType: 'AFTER_COUNT',
        recurrenceCount: 3,
      }),
      makeTask({
        id: 2,
        title: 'Repeticion agotada',
        scheduledDate: '2026-06-01',
        startTime: '07:00:00',
        recurrenceFreq: 'DAILY',
        recurrenceInterval: 2,
        recurrenceEndType: 'AFTER_COUNT',
        recurrenceCount: 2,
      }),
      makeTask({ id: 3, title: 'Sin hora', scheduledDate: '2026-06-05', startTime: null }),
    ]);

    cmp().selectedDate.set('2026-06-05');

    expect(cmp().hourTasks(5).map((occ) => occ.task.id)).toEqual([1]);
    expect(cmp().hourTasks(7).map((occ) => occ.task.id)).toEqual([]);
    expect(cmp().hourTasks(5)[0].virtual).toBe(true);
    expect(cmp().unscheduled().map((occ) => occ.task.id)).toEqual([3]);
    expect(cmp().visibleHours()).toContain(5);
  });

  it('resuelve recurrencias semanales y mensuales respetando intervalos y fecha final', async () => {
    await setup([
      makeTask({
        id: 11,
        title: 'Semanal valida',
        scheduledDate: '2026-06-01',
        startTime: '06:00:00',
        recurrenceFreq: 'WEEKLY',
        recurrenceInterval: 2,
      }),
      makeTask({
        id: 12,
        title: 'Semanal otro dia',
        scheduledDate: '2026-06-02',
        startTime: '07:00:00',
        recurrenceFreq: 'WEEKLY',
      }),
      makeTask({
        id: 13,
        title: 'Mensual valida',
        scheduledDate: '2026-04-15',
        startTime: '11:00:00',
        recurrenceFreq: 'MONTHLY',
        recurrenceInterval: 2,
      }),
      makeTask({
        id: 14,
        title: 'Mensual vencida',
        scheduledDate: '2026-04-15',
        startTime: '12:00:00',
        recurrenceFreq: 'MONTHLY',
        recurrenceEndType: 'ON_DATE',
        recurrenceEndDate: '2026-05-15',
      }),
      makeTask({ id: 15, title: 'Sin fecha', scheduledDate: null, startTime: null }),
    ]);

    cmp().selectedDate.set('2026-06-15');

    expect(cmp().hourTasks(6).map((occ) => occ.task.id)).toEqual([11]);
    expect(cmp().hourTasks(7)).toEqual([]);
    expect(cmp().hourTasks(11).map((occ) => occ.task.id)).toEqual([13]);
    expect(cmp().hourTasks(12)).toEqual([]);
    expect(cmp().hourLabel(6)).toBe('06:00');
  });

  it('renderiza lista con metadata y delega acciones de estado, color y borrado', async () => {
    const task = makeTask({
      id: 21,
      title: 'Entrega final',
      status: 'DONE',
      importance: 'URGENT',
      scheduledDate: '2026-06-08',
      startTime: '10:15:00',
      recurrenceFreq: 'WEEKLY',
      tags: [{ id: 1, name: 'final' }],
      color: '#ef4444',
    });
    await setup([task]);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.row--done')).not.toBeNull();
    expect(root.textContent).toContain('Entrega final');
    expect(root.textContent).toContain('#final');
    expect(root.textContent).toContain('2026-06-08');
    expect(cmp().statusKey('IN_PROGRESS')).toBe('tasks.inProgress');
    expect(cmp().importanceKey('URGENT')).toBe('tasks.importance.urgent');
    expect(cmp().freqKey('WEEKLY')).toBe('tasks.freq.weekly');

    root.querySelector<HTMLInputElement>('.row__check')!.click();
    expect(setStatus).toHaveBeenCalledWith(21, 'PENDING');

    root.querySelector<HTMLButtonElement>('[data-status="IN_PROGRESS"]')!.click();
    expect(setStatus).toHaveBeenCalledWith(21, 'IN_PROGRESS');

    cmp().setColor(task, '#22c55e');
    expect(update).toHaveBeenCalledWith(21, {
      title: 'Entrega final',
      color: '#22c55e',
      importance: 'URGENT',
    });

    root.querySelector<HTMLButtonElement>('.icon-btn')!.click();
    expect(remove).toHaveBeenCalledWith(21);
  });

  it('crea tareas con titulo, hora y tags normalizados', async () => {
    await setup();
    const task = makeTask({ id: 10, title: 'Proyecto final' });
    create.mockReturnValue(of({ task, achievements: [] } as TaskMutation));

    cmp().showCreate.set(true);
    cmp().draftTitle.set('  Proyecto final  ');
    cmp().draftImportance.set('HIGH');
    cmp().draftDate.set('2026-06-07');
    cmp().draftStart.set('09:30');
    cmp().draftColor.set('#ef4444');
    cmp().draftFreq.set('WEEKLY');
    cmp().draftTags.set(' mate, final, , urgente ');

    cmp().add();

    expect(create).toHaveBeenCalledWith({
      title: 'Proyecto final',
      importance: 'HIGH',
      scheduledDate: '2026-06-07',
      startTime: '09:30:00',
      color: '#ef4444',
      recurrenceFreq: 'WEEKLY',
      tags: ['mate', 'final', 'urgente'],
    });
    expect(cmp().draftTitle()).toBe('');
    expect(cmp().draftTags()).toBe('');
    expect(cmp().showCreate()).toBe(false);
    expect(stats).toHaveBeenCalledTimes(2);
  });

  it('ignora alta sin titulo y cubre el modal de creacion con opciones avanzadas', async () => {
    await setup();
    const root = fixture.nativeElement as HTMLElement;

    cmp().draftTitle.set('   ');
    cmp().add();
    expect(create).not.toHaveBeenCalled();

    cmp().showCreate.set(true);
    fixture.detectChanges();

    expect(root.querySelector('.modal')).not.toBeNull();
    expect(root.querySelector<HTMLButtonElement>('.creator__actions button[type="submit"]')?.disabled).toBe(
      true,
    );

    cmp().draftTitle.set('Laboratorio');
    fixture.detectChanges();

    expect(root.querySelector<HTMLButtonElement>('.creator__actions button[type="submit"]')?.disabled).toBe(
      false,
    );

    root.querySelector<HTMLButtonElement>('.eci-collapse__summary')!.click();
    fixture.detectChanges();
    expect(root.querySelector('eci-collapse')?.classList.contains('is-open')).toBe(true);

    root.querySelector<HTMLButtonElement>('.swatch')!.click();
    fixture.detectChanges();
    expect(cmp().draftColor()).toBe('#ef4444');
  });

  it('no cambia estado redundante y si refresca estadisticas al cambiarlo', async () => {
    await setup();
    const task = makeTask({ id: 7, status: 'PENDING' });

    cmp().changeStatus(task, 'PENDING');
    expect(setStatus).not.toHaveBeenCalled();

    cmp().changeStatus(task, 'DONE');
    expect(setStatus).toHaveBeenCalledWith(7, 'DONE');
    expect(stats).toHaveBeenCalledTimes(2);
  });

  it('muestra achievements, alterna estadisticas y recuerda la preferencia local', async () => {
    await setup([], {
      achievement: {
        id: 1,
        type: 'TASKS_PLANNED',
        milestone: 5,
        awardedAt: '2026-06-01T00:00:00Z',
      },
    });
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="status"]')).not.toBeNull();
    expect(cmp().achievementKey()).toBe('tasks.congratsPlanned');
    root.querySelector<HTMLButtonElement>('.toast__close')!.click();
    expect(clearAchievement).toHaveBeenCalledTimes(1);

    expect(root.querySelector('.stats')).not.toBeNull();
    cmp().toggleStats();
    fixture.detectChanges();

    expect(cmp().showStats()).toBe(false);
    expect(localStorage.getItem('eciwise.tasks.showStats')).toBe('0');
    expect(root.querySelector('.stats')).toBeNull();

    cmp().toggleStats();
    fixture.detectChanges();

    expect(cmp().showStats()).toBe(true);
    expect(localStorage.getItem('eciwise.tasks.showStats')).toBe('1');
  });

  it('renderiza agenda, backlog, linea actual y reagenda con drag drop', async () => {
    const timed = makeTask({
      id: 31,
      title: 'Clase',
      scheduledDate: '2026-06-05',
      startTime: '09:30:00',
      dayOrder: 0,
    });
    const backlog = makeTask({
      id: 32,
      title: 'Sin horario',
      scheduledDate: '2026-06-05',
      startTime: null,
      dayOrder: 1,
    });
    await setup([timed, backlog]);
    const root = fixture.nativeElement as HTMLElement;

    cmp().view.set('agenda');
    cmp().showBacklog.set(true);
    cmp().selectedDate.set('2026-06-05');
    cmp().currentHour.set(9);
    cmp().currentMinutePct.set(50);
    fixture.detectChanges();

    expect(root.querySelector('.agenda-toolbar')).not.toBeNull();
    expect(root.querySelector('.backlog')).not.toBeNull();
    expect(root.textContent).toContain('Clase');
    expect(root.textContent).toContain('Sin horario');
    expect(root.querySelector('.slot--now .now-line')?.getAttribute('style')).toContain('top: 50%');

    cmp().toggleFullDay();
    expect(cmp().expandFullDay()).toBe(true);
    expect(cmp().visibleHours()).toHaveLength(24);

    cmp().onDrop({ item: { data: timed }, currentIndex: 2 }, 9);
    expect(reschedule).toHaveBeenCalledWith(31, {
      scheduledDate: '2026-06-05',
      startTime: '09:00:00',
      endTime: null,
      dayOrder: 2,
    });

    cmp().onDrop({ item: { data: timed }, currentIndex: 0 }, -1);
    expect(reschedule).toHaveBeenCalledWith(31, {
      scheduledDate: '2026-06-05',
      startTime: null,
      endTime: null,
      dayOrder: 0,
    });

    cmp().shiftDay(1);
    expect(cmp().selectedDate()).toBe('2026-06-06');
    cmp().shiftDay(-1);
    expect(cmp().selectedDate()).toBe('2026-06-05');
    cmp().goToday();
    expect(cmp().selectedDate()).not.toBe('');
  });

  it('ejecuta busqueda con filtros y clearSearch restaura el estado local', async () => {
    await setup();
    cmp().searchTitle.set('quiz');
    cmp().searchImportance.set('URGENT');
    cmp().searchStatus.set('IN_PROGRESS');
    cmp().searchDate.set('2026-06-09');

    cmp().runSearch();

    expect(search).toHaveBeenCalledWith({
      title: 'quiz',
      importance: 'URGENT',
      status: 'IN_PROGRESS',
      date: '2026-06-09',
    } satisfies TaskSearchParams);
    expect(cmp().searchResults()?.[0]?.title).toBe('Quiz');

    cmp().clearSearch();

    expect(cmp().searchTitle()).toBe('');
    expect(cmp().searchImportance()).toBe('');
    expect(cmp().searchStatus()).toBe('');
    expect(cmp().searchDate()).toBe('');
    expect(cmp().searchResults()).toBeNull();
  });
});
