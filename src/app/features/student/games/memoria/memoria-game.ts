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

type CardState = 'hidden' | 'revealed' | 'matched';
type GamePhase = 'idle' | 'playing' | 'win' | 'timeup';

interface CardPair {
  readonly a: string;
  readonly b: string;
}

interface Card {
  readonly id: number;
  readonly pairId: number;
  readonly face: string;
  state: CardState;
}

const RECORD_KEY = 'eciwise.memoria.record';
const GAME_DURATION = 90;

const PAIR_POOL: readonly CardPair[] = [
  // Cálculo
  { a: "sin'(x)", b: 'cos(x)' },
  { a: "cos'(x)", b: '−sin(x)' },
  { a: "eˣ'", b: 'eˣ' },
  { a: "ln(x)'", b: '1/x' },
  { a: "xⁿ'", b: 'n·xⁿ⁻¹' },
  { a: '∫eˣ dx', b: 'eˣ + C' },
  { a: '∫cos(x) dx', b: 'sin(x) + C' },
  // Álgebra / lógica
  { a: 'a² − b²', b: '(a+b)(a−b)' },
  { a: 'log(ab)', b: 'log a + log b' },
  { a: 'log(a/b)', b: 'log a − log b' },
  // Algoritmos
  { a: 'O(n log n)', b: 'Quicksort (prom.)' },
  { a: 'O(1)', b: 'Acceso array [i]' },
  { a: 'O(n²)', b: 'Bubble sort' },
  { a: 'O(log n)', b: 'Búsqueda binaria' },
  { a: 'BFS', b: 'Nivel por nivel' },
  { a: 'DFS', b: 'Profundidad primero' },
  { a: 'LIFO', b: 'Stack (pila)' },
  { a: 'FIFO', b: 'Queue (cola)' },
  // Física
  { a: 'F = ma', b: '2ª Ley de Newton' },
  { a: 'E = mc²', b: 'Energía-masa' },
  { a: 'F = qE', b: 'Fuerza eléctrica' },
  { a: 'λ = h/p', b: 'De Broglie' },
  { a: 'PV = nRT', b: 'Gas ideal' },
  // Programación
  { a: 'Encapsulamiento', b: 'Oculta datos internos' },
  { a: 'Polimorfismo', b: 'Muchas formas de 1 método' },
  { a: 'Recursión', b: 'Función que se llama a sí misma' },
  { a: 'Compilado', b: 'C, C++, Rust' },
  { a: 'Interpretado', b: 'Python, JS' },
  // Estadística
  { a: 'μ (mu)', b: 'Media poblacional' },
  { a: 'σ² (sigma²)', b: 'Varianza' },
  { a: 'Correlación r=1', b: 'Relación lineal positiva perfecta' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBoard(): Card[] {
  const pairs = shuffle([...PAIR_POOL]).slice(0, 8);
  const cards: Card[] = [];
  pairs.forEach((p, idx) => {
    cards.push({ id: idx * 2,     pairId: idx, face: p.a, state: 'hidden' });
    cards.push({ id: idx * 2 + 1, pairId: idx, face: p.b, state: 'hidden' });
  });
  return shuffle(cards);
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
  selector: 'eci-memoria-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './memoria-game.html',
  styleUrl: './memoria-game.css',
})
export class MemoriaGameComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private firstFlipped: Card | null = null;
  private isChecking = false;

  protected readonly phase = signal<GamePhase>('idle');
  protected readonly cards = signal<Card[]>([]);
  protected readonly matchedPairs = signal(0);
  protected readonly timeLeft = signal(GAME_DURATION);
  protected readonly record = signal(loadRecord());
  protected readonly isNewRecord = signal(false);

  protected readonly score = computed(() => {
    const pairs = this.matchedPairs();
    const time = this.timeLeft();
    return pairs * 100 + time * 2;
  });

  protected readonly timerWidth = computed(() =>
    Math.round((this.timeLeft() / GAME_DURATION) * 100),
  );

  protected readonly timerDanger = computed(() => this.timeLeft() <= 15);

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.clearInterval());
  }

  protected startGame(): void {
    this.firstFlipped = null;
    this.isChecking = false;
    this.matchedPairs.set(0);
    this.timeLeft.set(GAME_DURATION);
    this.isNewRecord.set(false);
    this.cards.set(buildBoard());
    this.phase.set('playing');
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  protected flipCard(card: Card): void {
    if (this.phase() !== 'playing') return;
    if (this.isChecking) return;
    if (card.state !== 'hidden') return;

    this.setCardState(card, 'revealed');

    if (!this.firstFlipped) {
      this.firstFlipped = card;
      return;
    }

    const first = this.firstFlipped;
    this.firstFlipped = null;
    this.isChecking = true;

    if (first.pairId === card.pairId) {
      this.setCardState(first, 'matched');
      this.setCardState(card, 'matched');
      const pairs = this.matchedPairs() + 1;
      this.matchedPairs.set(pairs);
      this.isChecking = false;
      if (pairs === 8) {
        this.endGame('win');
      }
    } else {
      setTimeout(() => {
        this.setCardState(first, 'hidden');
        this.setCardState(card, 'hidden');
        this.isChecking = false;
      }, 800);
    }
  }

  private setCardState(card: Card, state: CardState): void {
    this.cards.update((all) =>
      all.map((c) => (c.id === card.id ? { ...c, state } : c)),
    );
    card.state = state;
  }

  private tick(): void {
    const t = this.timeLeft() - 1;
    if (t <= 0) {
      this.timeLeft.set(0);
      this.endGame('timeup');
    } else {
      this.timeLeft.set(t);
    }
  }

  private endGame(result: 'win' | 'timeup'): void {
    this.clearInterval();
    this.phase.set(result);
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
