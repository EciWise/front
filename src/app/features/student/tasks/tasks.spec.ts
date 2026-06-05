import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import {
  Importance,
  RecurrenceFreq,
  StatsResponse,
  Task,
  TaskMutation,
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
  add(): void;
  changeStatus(task: Task, status: TaskStatus): void;
  runSearch(): void;
  clearSearch(): void;
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
  let search: ReturnType<typeof vi.fn>;
  let stats: ReturnType<typeof vi.fn>;

  const cmp = (): TasksHarness => fixture.componentInstance as unknown as TasksHarness;

  const setup = async (initialTasks: Task[] = []): Promise<void> => {
    tasksSignal = signal<Task[]>(initialTasks);
    const lastAchievement = signal(null);
    create = vi.fn((task: Task) => of({ task, achievements: [] } as TaskMutation));
    setStatus = vi.fn((id: number, status: TaskStatus) =>
      of({ task: makeTask({ id, status }), achievements: [] } as TaskMutation),
    );
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
            update: vi.fn(() => of({})),
            remove: vi.fn(() => of(undefined)),
            reschedule: vi.fn(() => of(makeTask())),
            clearAchievement: vi.fn(),
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

  it('no cambia estado redundante y si refresca estadisticas al cambiarlo', async () => {
    await setup();
    const task = makeTask({ id: 7, status: 'PENDING' });

    cmp().changeStatus(task, 'PENDING');
    expect(setStatus).not.toHaveBeenCalled();

    cmp().changeStatus(task, 'DONE');
    expect(setStatus).toHaveBeenCalledWith(7, 'DONE');
    expect(stats).toHaveBeenCalledTimes(2);
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
