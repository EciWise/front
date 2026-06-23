import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { IconComponent } from '../../../../shared/ui/icon/icon';

type Direction = 'up' | 'down' | 'left' | 'right';
type GamePhase = 'idle' | 'playing' | 'gameover';

interface Segment {
  x: number;
  y: number;
}

interface FoodItem {
  x: number;
  y: number;
  label: string;
  isTarget: boolean;
}

interface Category {
  readonly label: string;
  readonly items: readonly string[];
  readonly decoys: readonly string[];
}

const RECORD_KEY = 'eciwise.serpiente.record';
const COLS = 20;
const ROWS = 16;
const BASE_SPEED = 160;
const MIN_SPEED = 80;
const FOOD_COUNT = 6;

const CATEGORIES: readonly Category[] = [
  {
    label: 'Derivadas trig.',
    items: ["sin'", "cos'", "tan'", "sec'", "csc'"],
    decoys: ['sin', 'cos', 'tan', 'log', '√x'],
  },
  {
    label: 'Complejidades O()',
    items: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'O(n!)'],
    decoys: ['O(∞)', 'O(x)', 'O(2n)', 'O(n·m)', 'O(k)'],
  },
  {
    label: 'Constantes matemáticas',
    items: ['π', 'e', 'φ', '√2', 'ln 2'],
    decoys: ['∞', 'i', '0', '1', 'σ'],
  },
  {
    label: 'Álgebra booleana',
    items: ['AND', 'OR', 'NOT', 'XOR', 'NAND'],
    decoys: ['IF', 'THEN', 'ELSE', 'LOOP', 'GOTO'],
  },
  {
    label: 'Integrales',
    items: ['∫sin dx', '∫eˣ dx', '∫1/x dx', '∫cos dx', '∫xⁿ dx'],
    decoys: ['∂/∂x', '∑xₙ', '∇f', 'Δx', 'd/dt'],
  },
];

function loadRecord(): number {
  if (typeof localStorage === 'undefined') return 0;
  return parseInt(localStorage.getItem(RECORD_KEY) ?? '0', 10) || 0;
}

function saveRecord(s: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(RECORD_KEY, String(s));
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickCategory(): Category {
  return CATEGORIES[randInt(CATEGORIES.length)];
}

function spawnFood(snake: Segment[], existing: FoodItem[], category: Category): FoodItem[] {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  existing.forEach((f) => occupied.add(`${f.x},${f.y}`));
  const food: FoodItem[] = [];
  let attempts = 0;
  while (food.length < FOOD_COUNT && attempts < 500) {
    attempts++;
    const x = randInt(COLS);
    const y = randInt(ROWS);
    const key = `${x},${y}`;
    if (occupied.has(key)) continue;
    occupied.add(key);
    const isTarget = food.filter((f) => f.isTarget).length < 3;
    const pool = isTarget ? category.items : category.decoys;
    const label = pool[randInt(pool.length)];
    food.push({ x, y, label, isTarget });
  }
  return food;
}

@Component({
  selector: 'eci-serpiente-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './serpiente-game.html',
  styleUrl: './serpiente-game.css',
})
export class SerpienteGameComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('gameCanvas');

  protected readonly phase = signal<GamePhase>('idle');
  protected readonly score = signal(0);
  protected readonly record = signal(loadRecord());
  protected readonly categoryLabel = signal('');
  protected readonly isNewRecord = signal(false);

  // Game state (mutable, not reactive — updated per frame)
  private snake: Segment[] = [];
  private dir: Direction = 'right';
  private nextDir: Direction = 'right';
  private food: FoodItem[] = [];
  private category: Category = CATEGORIES[0];
  private correctInRow = 0;
  private rafId = 0;
  private lastMove = 0;
  private speed = BASE_SPEED;
  private controls = new AbortController();

  private resizeObs: ResizeObserver | null = null;

  constructor() {
    afterNextRender(() => this.initListeners());
    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.rafId);
      this.controls.abort();
      this.resizeObs?.disconnect();
    });
  }

  private initListeners(): void {
    window.addEventListener('keydown', (e) => this.onKey(e), { signal: this.controls.signal });
    const canvas = this.canvasRef()?.nativeElement;
    if (canvas) {
      this.resizeObs = new ResizeObserver((entries) => {
        for (const entry of entries) this.onCanvasResize(entry);
      });
      this.resizeObs.observe(canvas);
    }
  }

  protected startGame(): void {
    this.controls.abort();
    this.controls = new AbortController();
    this.initListeners();

    const midX = Math.floor(COLS / 2);
    const midY = Math.floor(ROWS / 2);
    this.snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    this.dir = 'right';
    this.nextDir = 'right';
    this.correctInRow = 0;
    this.speed = BASE_SPEED;
    this.score.set(0);
    this.isNewRecord.set(false);

    this.category = pickCategory();
    this.categoryLabel.set(this.category.label);
    this.food = spawnFood(this.snake, [], this.category);

    this.phase.set('playing');
    cancelAnimationFrame(this.rafId);
    this.lastMove = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  private loop(ts: number): void {
    if (this.phase() !== 'playing') return;
    this.rafId = requestAnimationFrame((t) => this.loop(t));

    if (ts - this.lastMove >= this.speed) {
      this.lastMove = ts;
      this.moveSnake();
    }

    this.draw();
  }

  private moveSnake(): void {
    this.dir = this.nextDir;
    const head = { ...this.snake[0] };
    if (this.dir === 'right') head.x++;
    else if (this.dir === 'left') head.x--;
    else if (this.dir === 'up') head.y--;
    else head.y++;

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      this.endGame();
      return;
    }
    // Self collision
    if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this.endGame();
      return;
    }

    const eaten = this.food.find((f) => f.x === head.x && f.y === head.y);
    this.snake.unshift(head);

    if (eaten) {
      this.food = this.food.filter((f) => f !== eaten);
      if (eaten.isTarget) {
        this.score.update((s) => s + 10);
        this.correctInRow++;
        // Speed up slightly
        this.speed = Math.max(MIN_SPEED, BASE_SPEED - this.correctInRow * 4);
        // Rotate category every 5 correct
        if (this.correctInRow % 5 === 0) {
          this.category = pickCategory();
          this.categoryLabel.set(this.category.label);
          this.food = [];
        }
        // Grow: don't pop tail
      } else {
        // Wrong item: shrink (remove last 2 segments if possible)
        this.correctInRow = 0;
        if (this.snake.length > 2) {
          this.snake.pop();
          this.snake.pop();
        }
        if (this.snake.length <= 1) { this.endGame(); return; }
        // pop tail normally too
        this.snake.pop();
      }
      // Refill food
      while (this.food.length < FOOD_COUNT) {
        const newItems = spawnFood(this.snake, this.food, this.category);
        this.food.push(...newItems.slice(0, FOOD_COUNT - this.food.length));
      }
    } else {
      this.snake.pop();
    }
  }

  private endGame(): void {
    cancelAnimationFrame(this.rafId);
    this.phase.set('gameover');
    const s = this.score();
    if (s > this.record()) {
      this.record.set(s);
      saveRecord(s);
      this.isNewRecord.set(true);
    }
  }

  private draw(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Logical (CSS) dimensions: canvas.width/height are physical, divide by DPR
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const cw = W / COLS;
    const ch = H / ROWS;

    ctx.clearRect(0, 0, W, H);

    // Grid background
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#16161a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx <= COLS; gx++) {
      ctx.beginPath(); ctx.moveTo(gx * cw, 0); ctx.lineTo(gx * cw, H); ctx.stroke();
    }
    for (let gy = 0; gy <= ROWS; gy++) {
      ctx.beginPath(); ctx.moveTo(0, gy * ch); ctx.lineTo(W, gy * ch); ctx.stroke();
    }

    // Food
    for (const f of this.food) {
      const fx = f.x * cw + cw / 2;
      const fy = f.y * ch + ch / 2;
      const r = Math.min(cw, ch) * 0.42;
      ctx.beginPath();
      ctx.arc(fx, fy, r, 0, Math.PI * 2);
      ctx.fillStyle = f.isTarget
        ? (isDark ? '#22c55e' : '#16a34a')
        : (isDark ? '#ef4444' : '#dc2626');
      ctx.globalAlpha = f.isTarget ? 1 : 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = '#fff';
      const fontSize = Math.max(8, Math.min(11, cw * 0.38));
      ctx.font = `bold ${fontSize}px 'STIX Two Math', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label, fx, fy);
    }

    // Snake
    for (let i = 0; i < this.snake.length; i++) {
      const seg = this.snake[i];
      const sx = seg.x * cw + 2;
      const sy = seg.y * ch + 2;
      const sw = cw - 4;
      const sh = ch - 4;
      const radius = 5;

      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, radius);
      ctx.fillStyle = i === 0
        ? '#c8102e'
        : `hsl(${220 + i * 2}, 70%, ${isDark ? 55 : 45}%)`;
      ctx.fill();
    }
  }

  private onKey(e: KeyboardEvent): void {
    const map: Record<string, Direction> = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
    };
    const d = map[e.key];
    if (!d) return;
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    };
    if (opposites[d] !== this.dir) {
      this.nextDir = d;
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }

  // Touch D-pad
  protected onSwipe(dir: Direction): void {
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    };
    if (opposites[dir] !== this.dir) {
      this.nextDir = dir;
    }
  }

  protected onCanvasResize(entry: ResizeObserverEntry): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = entry.contentRect;
    // Physical pixel size for sharp rendering on HiDPI screens
    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);
    // Scale once so all draw calls use logical (CSS) coordinates
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  }
}
