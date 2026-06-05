import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { CollapseComponent } from '../../../shared/ui/collapse/collapse';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { DatePickerComponent } from '../../../shared/ui/date-picker/date-picker';
import { TimePickerComponent } from '../../../shared/ui/time-picker/time-picker';
import { SectionTabsComponent, SectionTab } from '../../../shared/ui/section-tabs/section-tabs';
import { StatusSwitcherComponent } from '../../../shared/ui/status-switcher/status-switcher';
import { TasksService } from './tasks.service';
import {
  Importance,
  RecurrenceFreq,
  StatsResponse,
  TASK_COLORS,
  Task,
  TaskRequest,
  TaskStatus,
} from './task.model';

/** Una aparición de una tarea en un día concreto de la agenda. */
interface Occurrence {
  readonly task: Task;
  /** `true` si es una repetición generada por recurrencia (no la fecha base). */
  readonly virtual: boolean;
}

/** Clave en localStorage para recordar si la tira de estadísticas está visible. */
const SHOW_STATS_KEY = 'eciwise.tasks.showStats';

/** Planificador de tareas: lista con búsqueda y agenda diaria con arrastre por horas. */
@Component({
  selector: 'eci-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
    InfoTooltipComponent,
    CollapseComponent,
    ModalComponent,
    DatePickerComponent,
    TimePickerComponent,
    SectionTabsComponent,
    StatusSwitcherComponent,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  protected readonly tasks = this.tasksService.tasks;
  protected readonly pendingCount = this.tasksService.pendingCount;
  protected readonly lastAchievement = this.tasksService.lastAchievement;

  /** Sección activa (string para enlazar con eci-section-tabs). */
  protected readonly view = signal<string>('list');
  /** Modal de alta de tarea abierto/cerrado. */
  protected readonly showCreate = signal(false);
  /** Bandeja "Sin agendar" desplegada en la vista agenda. */
  protected readonly showBacklog = signal(false);
  /** Tira de estadísticas visible (preferencia recordada por dispositivo). */
  protected readonly showStats = signal<boolean>(
    typeof localStorage === 'undefined' || localStorage.getItem(SHOW_STATS_KEY) !== '0',
  );
  protected readonly viewTabs: readonly SectionTab[] = [
    { id: 'list', labelKey: 'tasks.viewList', icon: 'tasks' },
    { id: 'agenda', labelKey: 'tasks.viewAgenda', icon: 'schedule' },
  ];
  protected readonly stats = signal<StatsResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly colors = TASK_COLORS;
  protected readonly importances: Importance[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  protected readonly statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
  protected readonly freqs: RecurrenceFreq[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];

  // --- Rango de horas de la agenda ---
  /** Hora de inicio/fin del rango base mostrado en la agenda. */
  protected readonly dayStartHour = signal(6);
  protected readonly dayEndHour = signal(22);
  /** Fuerza mostrar las 24 horas del día. */
  protected readonly expandFullDay = signal(false);
  /** Hora y minuto actuales para dibujar la línea "Ahora". */
  protected readonly currentHour = signal(new Date().getHours());
  protected readonly currentMinutePct = signal((new Date().getMinutes() / 60) * 100);

  /** Día seleccionado en la vista agenda (ISO yyyy-MM-dd). */
  protected readonly selectedDate = signal<string>(this.todayIso());

  /** ¿El día mostrado en la agenda es hoy? */
  protected readonly isToday = computed(() => this.selectedDate() === this.todayIso());

  // --- Formulario de nueva tarea ---
  protected readonly draftTitle = signal('');
  protected readonly draftImportance = signal<Importance>('MEDIUM');
  protected readonly draftDate = signal<string>('');
  protected readonly draftStart = signal<string>('');
  protected readonly draftColor = signal<string>(TASK_COLORS[5]);
  protected readonly draftFreq = signal<RecurrenceFreq>('NONE');
  protected readonly draftTags = signal<string>('');

  // --- Búsqueda ---
  protected readonly searchTitle = signal('');
  protected readonly searchImportance = signal<Importance | ''>('');
  protected readonly searchStatus = signal<TaskStatus | ''>('');
  protected readonly searchDate = signal<string>('');
  protected readonly searchResults = signal<Task[] | null>(null);

  /**
   * Apariciones del día seleccionado agrupadas por hora de inicio, incluyendo
   * las repeticiones generadas por recurrencia (apariciones "virtuales"). La
   * hora -1 agrupa las tareas sin hora asignada (bandeja).
   */
  protected readonly tasksByHour = computed(() => {
    const day = this.selectedDate();
    const map = new Map<number, Occurrence[]>();
    for (const task of this.tasks()) {
      const occursToday = this.occursOn(task, day);
      if (!occursToday) {
        continue;
      }
      const virtual = task.scheduledDate !== day;
      const hour = task.startTime ? Number(task.startTime.slice(0, 2)) : -1;
      const bucket = map.get(hour) ?? [];
      bucket.push({ task, virtual });
      map.set(hour, bucket);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.task.dayOrder - b.task.dayOrder);
    }
    return map;
  });

  protected readonly unscheduled = computed(() => this.tasksByHour().get(-1) ?? []);

  /**
   * Horas a renderizar en la agenda. Por defecto un rango cómodo (6–22) que se
   * amplía automáticamente para incluir cualquier hora con tareas, de modo que
   * nunca se oculte una tarea ni falte su zona de arrastre. Con `expandFullDay`
   * se muestran las 24 horas.
   */
  protected readonly visibleHours = computed(() => {
    if (this.expandFullDay()) {
      return Array.from({ length: 24 }, (_, h) => h);
    }
    let start = this.dayStartHour();
    let end = this.dayEndHour();
    for (const hour of this.tasksByHour().keys()) {
      if (hour < 0) {
        continue;
      }
      start = Math.min(start, hour);
      end = Math.max(end, hour);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.tasksService.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.tasksService.stats().subscribe((s) => this.stats.set(s));
  }

  /** Alterna entre el rango cómodo (6–22) y las 24 horas del día. */
  toggleFullDay(): void {
    this.expandFullDay.update((v) => !v);
  }

  /** Muestra u oculta la tira de estadísticas y recuerda la preferencia. */
  toggleStats(): void {
    const next = !this.showStats();
    this.showStats.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SHOW_STATS_KEY, next ? '1' : '0');
    }
  }

  hourTasks(hour: number): Occurrence[] {
    return this.tasksByHour().get(hour) ?? [];
  }

  hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  // --- Alta ---
  add(): void {
    const title = this.draftTitle().trim();
    if (!title) {
      return;
    }
    const tags = this.draftTags()
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const body: TaskRequest = {
      title,
      importance: this.draftImportance(),
      scheduledDate: this.draftDate() || null,
      startTime: this.draftStart() ? `${this.draftStart()}:00` : null,
      color: this.draftColor(),
      recurrenceFreq: this.draftFreq(),
      tags,
    };
    this.tasksService.create(body).subscribe(() => {
      this.draftTitle.set('');
      this.draftTags.set('');
      this.showCreate.set(false);
      this.tasksService.stats().subscribe((s) => this.stats.set(s));
    });
  }

  // --- Estado ---
  /** Fija directamente el estado elegido en el control segmentado. */
  changeStatus(task: Task, status: TaskStatus): void {
    if (status === task.status) {
      return;
    }
    this.tasksService.setStatus(task.id, status).subscribe(() => {
      this.tasksService.stats().subscribe((s) => this.stats.set(s));
    });
  }

  toggleDone(task: Task): void {
    const next: TaskStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
    this.tasksService.setStatus(task.id, next).subscribe(() => {
      this.tasksService.stats().subscribe((s) => this.stats.set(s));
    });
  }

  setColor(task: Task, color: string): void {
    this.tasksService
      .update(task.id, { title: task.title, color, importance: task.importance })
      .subscribe();
  }

  remove(task: Task): void {
    this.tasksService.remove(task.id).subscribe();
  }

  // --- Arrastre entre horas ---
  onDrop(event: CdkDragDrop<Occurrence[]>, targetHour: number): void {
    const task = event.item.data as Task;
    const startTime = targetHour < 0 ? null : `${String(targetHour).padStart(2, '0')}:00:00`;
    const dayOrder = event.currentIndex;
    this.tasksService
      .reschedule(task.id, {
        scheduledDate: this.selectedDate(),
        startTime,
        endTime: null,
        dayOrder,
      })
      .subscribe();
  }

  // --- Navegación de día ---
  shiftDay(delta: number): void {
    const d = this.parseLocal(this.selectedDate());
    d.setDate(d.getDate() + delta);
    this.selectedDate.set(this.toIso(d));
  }

  goToday(): void {
    this.selectedDate.set(this.todayIso());
  }

  // --- Búsqueda ---
  runSearch(): void {
    this.tasksService
      .search({
        title: this.searchTitle() || null,
        importance: this.searchImportance() || null,
        status: this.searchStatus() || null,
        date: this.searchDate() || null,
      })
      .subscribe((page) => this.searchResults.set([...page.content]));
  }

  clearSearch(): void {
    this.searchTitle.set('');
    this.searchImportance.set('');
    this.searchStatus.set('');
    this.searchDate.set('');
    this.searchResults.set(null);
  }

  dismissAchievement(): void {
    this.tasksService.clearAchievement();
  }

  achievementKey(): string {
    return this.lastAchievement()?.type === 'TASKS_PLANNED'
      ? 'tasks.congratsPlanned'
      : 'tasks.congratsCompleted';
  }

  statusKey(status: TaskStatus): string {
    switch (status) {
      case 'DONE':
        return 'tasks.done';
      case 'IN_PROGRESS':
        return 'tasks.inProgress';
      default:
        return 'tasks.pending';
    }
  }

  importanceKey(importance: Importance): string {
    return `tasks.importance.${importance.toLowerCase()}`;
  }

  freqKey(freq: RecurrenceFreq): string {
    return `tasks.freq.${freq.toLowerCase()}`;
  }

  private todayIso(): string {
    return this.toIso(new Date());
  }

  /** Formatea una fecha como yyyy-MM-dd en hora local (sin desfase UTC). */
  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** Interpreta un yyyy-MM-dd como fecha local a medianoche. */
  private parseLocal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  /**
   * Indica si una tarea aparece en el día `iso`, ya sea por su fecha base o por
   * su patrón de recurrencia (diaria/semanal/mensual), respetando el intervalo
   * y la condición de fin (nunca / en fecha / tras N repeticiones).
   */
  private occursOn(task: Task, iso: string): boolean {
    if (!task.scheduledDate) {
      return false;
    }
    if (task.scheduledDate === iso) {
      return true;
    }
    if (task.recurrenceFreq === 'NONE') {
      return false;
    }

    const start = this.parseLocal(task.scheduledDate);
    const target = this.parseLocal(iso);
    if (target <= start) {
      return false;
    }

    const interval = Math.max(1, task.recurrenceInterval || 1);
    let occurrenceIndex: number;

    switch (task.recurrenceFreq) {
      case 'DAILY': {
        const days = this.diffDays(start, target);
        if (days % interval !== 0) {
          return false;
        }
        occurrenceIndex = days / interval;
        break;
      }
      case 'WEEKLY': {
        if (start.getDay() !== target.getDay()) {
          return false;
        }
        const weeks = this.diffDays(start, target) / 7;
        if (!Number.isInteger(weeks) || weeks % interval !== 0) {
          return false;
        }
        occurrenceIndex = weeks / interval;
        break;
      }
      case 'MONTHLY': {
        if (start.getDate() !== target.getDate()) {
          return false;
        }
        const months =
          (target.getFullYear() - start.getFullYear()) * 12 +
          (target.getMonth() - start.getMonth());
        if (months % interval !== 0) {
          return false;
        }
        occurrenceIndex = months / interval;
        break;
      }
      default:
        return false;
    }

    if (
      task.recurrenceEndType === 'ON_DATE' &&
      task.recurrenceEndDate &&
      iso > task.recurrenceEndDate
    ) {
      return false;
    }
    if (
      task.recurrenceEndType === 'AFTER_COUNT' &&
      task.recurrenceCount != null &&
      occurrenceIndex >= task.recurrenceCount
    ) {
      return false;
    }
    return true;
  }

  /** Días enteros entre dos fechas locales (target - start). */
  private diffDays(start: Date, target: Date): number {
    const ms = target.getTime() - start.getTime();
    return Math.round(ms / 86_400_000);
  }
}
