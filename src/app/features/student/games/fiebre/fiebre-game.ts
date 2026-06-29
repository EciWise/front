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
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { IconComponent } from '../../../../shared/ui/icon/icon';

type GamePhase = 'idle' | 'playing' | 'finished';

interface Question {
  readonly display: string;
  readonly answer: number;
  readonly options: readonly number[];
  readonly correctIndex: number;
}

const RECORD_KEY = 'eciwise.fiebre.record';
const GAME_DURATION = 90;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestion(difficulty: 1 | 2 | 3): Question {
  let display: string;
  let answer: number;

  if (difficulty === 1) {
    const ops = ['+', '−', '×'] as const;
    const op = ops[rand(0, 2)];
    const a = rand(1, 20);
    const b = rand(1, 20);
    if (op === '+') { display = `${a} + ${b} = ?`; answer = a + b; }
    else if (op === '−') { const hi = Math.max(a, b); const lo = Math.min(a, b); display = `${hi} − ${lo} = ?`; answer = hi - lo; }
    else { display = `${a} × ${b} = ?`; answer = a * b; }
  } else if (difficulty === 2) {
    const a = rand(2, 12);
    const b = rand(2, 12);
    const c = rand(1, 10);
    const pick = rand(0, 2);
    if (pick === 0) { display = `${a} × ${b} + ${c} = ?`; answer = a * b + c; }
    else if (pick === 1) { const hi = a * b; display = `${hi} − ${c} × ${a} = ?`; answer = hi - c * a; }
    else { const sum = a + b; display = `(${a} + ${b}) × ${c} = ?`; answer = sum * c; }
  } else {
    const pick = rand(0, 2);
    if (pick === 0) { const a = rand(2, 12); display = `${a}² = ?`; answer = a * a; }
    else if (pick === 1) { const sq = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144][rand(0, 10)]; display = `√${sq} = ?`; answer = Math.round(Math.sqrt(sq)); }
    else { const a = rand(2, 8); const b = rand(2, 4); display = `${a}³ ÷ ${b} = ?`; answer = Math.round((a * a * a) / b); }
  }

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const delta = rand(1, Math.max(5, Math.ceil(Math.abs(answer) * 0.25)));
    const d = answer + (Math.random() < 0.5 ? delta : -delta);
    if (d !== answer) distractors.add(d);
  }
  const opts = shuffle([answer, ...[...distractors]]);
  return {
    display,
    answer,
    options: opts,
    correctIndex: opts.indexOf(answer),
  };
}

function loadRecord(): number {
  if (typeof localStorage === 'undefined') return 0;
  return parseInt(localStorage.getItem(RECORD_KEY) ?? '0', 10) || 0;
}

function saveRecord(score: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(RECORD_KEY, String(score));
}

@Component({
  selector: 'eci-fiebre-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './fiebre-game.html',
  styleUrl: './fiebre-game.css',
})
export class FiebreGameComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly phase = signal<GamePhase>('idle');
  protected readonly score = signal(0);
  protected readonly streak = signal(0);
  protected readonly timeLeft = signal(GAME_DURATION);
  protected readonly currentQ = signal<Question>(generateQuestion(1));
  protected readonly lastResult = signal<'correct' | 'wrong' | null>(null);
  protected readonly record = signal(loadRecord());
  protected readonly isNewRecord = signal(false);

  protected readonly difficulty = computed((): 1 | 2 | 3 => {
    const s = this.score();
    if (s >= 200) return 3;
    if (s >= 80) return 2;
    return 1;
  });

  protected readonly multiplier = computed(() => {
    const s = this.streak();
    if (s >= 8) return 5;
    if (s >= 5) return 3;
    if (s >= 3) return 2;
    return 1;
  });

  protected readonly timerWidth = computed(() =>
    Math.round((this.timeLeft() / GAME_DURATION) * 100),
  );

  protected readonly timerDanger = computed(() => this.timeLeft() <= 10);

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.clearInterval());
  }

  protected startGame(): void {
    this.score.set(0);
    this.streak.set(0);
    this.timeLeft.set(GAME_DURATION);
    this.lastResult.set(null);
    this.isNewRecord.set(false);
    this.currentQ.set(generateQuestion(1));
    this.phase.set('playing');
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  protected pick(index: number): void {
    if (this.phase() !== 'playing') return;
    const q = this.currentQ();
    if (index === q.correctIndex) {
      const pts = 10 * this.multiplier();
      this.score.update((s) => s + pts);
      this.streak.update((s) => s + 1);
      this.lastResult.set('correct');
    } else {
      this.score.update((s) => Math.max(0, s - 5));
      this.streak.set(0);
      this.lastResult.set('wrong');
    }
    setTimeout(() => {
      this.lastResult.set(null);
      this.currentQ.set(generateQuestion(this.difficulty()));
    }, 350);
  }

  private tick(): void {
    const t = this.timeLeft() - 1;
    if (t <= 0) {
      this.timeLeft.set(0);
      this.endGame();
    } else {
      this.timeLeft.set(t);
    }
  }

  private endGame(): void {
    this.clearInterval();
    this.phase.set('finished');
    const s = this.score();
    if (s > this.record()) {
      this.record.set(s);
      saveRecord(s);
      this.isNewRecord.set(true);
    }
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
