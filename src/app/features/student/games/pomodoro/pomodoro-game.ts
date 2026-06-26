import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { IconComponent } from '../../../../shared/ui/icon/icon';

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';
type PomodoroStatus = 'idle' | 'running' | 'paused';

interface Plant {
  readonly x: number;
  readonly hue: number;
  readonly scale: number;
  readonly type: 0 | 1 | 2;
}

const STORAGE_KEY = 'eciwise.pomodoro';
const DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
const TIPS: Record<PomodoroPhase, string> = {
  work: 'games.pomodoro.tipFocus',
  shortBreak: 'games.pomodoro.tipShort',
  longBreak: 'games.pomodoro.tipLong',
};
const RING_R = 88;
const RING_CIRC = 2 * Math.PI * RING_R;

function loadPlants(): Plant[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Plant[];
  } catch {
    return [];
  }
}

function savePlants(plants: Plant[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

function randomPlant(): Plant {
  return {
    x: 4 + Math.random() * 92,
    hue: Math.floor(Math.random() * 120) + 90,
    scale: 0.7 + Math.random() * 0.6,
    type: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
  };
}

@Component({
  selector: 'eci-pomodoro-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './pomodoro-game.html',
  styleUrl: './pomodoro-game.css',
})
export class PomodoroGameComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(TranslateService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly phase = signal<PomodoroPhase>('work');
  protected readonly status = signal<PomodoroStatus>('idle');
  protected readonly secondsLeft = signal(DURATIONS.work);
  protected readonly cyclePosition = signal(0);
  protected readonly plants = signal<Plant[]>(loadPlants());

  protected readonly totalDuration = computed(() => DURATIONS[this.phase()]);
  protected readonly tipKey = computed(() => TIPS[this.phase()]);

  protected readonly phaseKey = computed(() => {
    const p = this.phase();
    if (p === 'work') return 'games.pomodoro.focus';
    if (p === 'shortBreak') return 'games.pomodoro.shortBreak';
    return 'games.pomodoro.longBreak';
  });

  protected readonly timeLabel = computed(() => {
    const s = this.secondsLeft();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });

  protected readonly ringOffset = computed(() => {
    const ratio = this.secondsLeft() / this.totalDuration();
    return RING_CIRC * (1 - ratio);
  });

  protected readonly ringCirc = RING_CIRC;

  protected readonly todayCount = computed(() => this.plants().length);

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.clearInterval());
  }

  protected start(): void {
    this.status.set('running');
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  protected pause(): void {
    this.status.set('paused');
    this.clearInterval();
  }

  protected resume(): void {
    this.start();
  }

  protected reset(): void {
    this.clearInterval();
    this.status.set('idle');
    this.secondsLeft.set(DURATIONS[this.phase()]);
  }

  protected skip(): void {
    this.clearInterval();
    this.status.set('idle');
    this.advancePhase();
  }

  private tick(): void {
    const remaining = this.secondsLeft() - 1;
    if (remaining <= 0) {
      this.secondsLeft.set(0);
      this.clearInterval();
      this.onPhaseComplete();
    } else {
      this.secondsLeft.set(remaining);
    }
  }

  private onPhaseComplete(): void {
    if (this.phase() === 'work') {
      const plant = randomPlant();
      const updated = [...this.plants(), plant];
      this.plants.set(updated);
      savePlants(updated);
    }
    this.status.set('idle');
    this.advancePhase();
  }

  private advancePhase(): void {
    const current = this.phase();
    if (current === 'work') {
      const pos = (this.cyclePosition() + 1) % 4;
      this.cyclePosition.set(pos);
      const next: PomodoroPhase = pos === 0 ? 'longBreak' : 'shortBreak';
      this.phase.set(next);
    } else {
      this.phase.set('work');
    }
    this.secondsLeft.set(DURATIONS[this.phase()]);
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  protected cycles(): number[] {
    return [0, 1, 2, 3];
  }

  protected isCycleDone(i: number): boolean {
    return i < this.cyclePosition();
  }
}
