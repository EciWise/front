import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/ui/button/button';
import { IconComponent, IconName } from '../../../../shared/ui/icon/icon';
import { AsclepioService } from '../../../../core/game/asclepio.service';
import { GameMode, PowerUpType } from '../../../../core/game/asclepio.protocol';

/** Constantes de tamaño (espejo de game/game/constants.go) para escalar el render. */
const FOOD_RADIUS = 8;
const POWERUP_RADIUS = 18;
const VIRUS_RADIUS = 30;
const INITIAL_RADIUS = 22;

interface RenderCell {
  x: number;
  y: number;
  radius: number;
}

interface ThemeColors {
  surface: string;
  surface2: string;
  border: string;
  text: string;
  accent: string;
}

const POWERUP_COLORS: Record<PowerUpType, string> = {
  speed: '#F1C40F',
  mass: '#2ECC71',
  shield: '#3498DB',
  magnet: '#E91E63',
  freeze: '#00BCD4',
  double: '#9B59B6',
};

/** Power-ups que el HUD describe en la leyenda (con icono Lucide, sin emojis). */
const POWERUP_LEGEND: readonly { type: PowerUpType; icon: IconName; labelKey: string }[] = [
  { type: 'speed', icon: 'coffee', labelKey: 'games.powerups.speed' },
  { type: 'mass', icon: 'idea', labelKey: 'games.powerups.mass' },
  { type: 'shield', icon: 'target', labelKey: 'games.powerups.shield' },
  { type: 'magnet', icon: 'magnet', labelKey: 'games.powerups.magnet' },
  { type: 'freeze', icon: 'snowflake', labelKey: 'games.powerups.freeze' },
  { type: 'double', icon: 'zap', labelKey: 'games.powerups.double' },
];

/**
 * Arena del juego Asclepio: cliente de canvas en tiempo real conectado por
 * WebSocket al servidor Go. Renderiza con interpolación suave, cámara que sigue
 * al jugador, HUD, leaderboard y controles de mouse/teclado/táctil.
 *
 * Todo el setup (canvas, listeners, RAF, conexión) corre solo en el navegador
 * vía `afterNextRender`, por lo que es seguro durante el prerender de SSR.
 */
@Component({
  selector: 'eci-asclepio-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './asclepio-game.html',
  styleUrl: './asclepio-game.css',
})
export class AsclepioGameComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  protected readonly game = inject(AsclepioService);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly mode: GameMode = this.resolveMode();
  protected readonly powerUpLegend = POWERUP_LEGEND;

  /** Tiempo restante formateado mm:ss para los modos cronometrados. */
  protected readonly timeLabel = computed(() => {
    const t = this.game.timeLeft();
    if (t == null) {
      return null;
    }
    const total = Math.max(0, Math.ceil(t));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  // ── Estado de render (no reactivo) ─────────────────────────────────────────
  private ctx: CanvasRenderingContext2D | null = null;
  private viewW = 0;
  private viewH = 0;
  private rafId = 0;
  private lastFrame = 0;
  private readonly renderById = new Map<string, RenderCell>();
  private camX = 0;
  private camY = 0;
  private scale = 0.3;
  private colors: ThemeColors = {
    surface: '#16161a',
    surface2: '#1e1e24',
    border: '#33333d',
    text: '#f2f2f5',
    accent: '#e23a52',
  };

  // Entrada.
  private pointerX = 0;
  private pointerY = 0;
  private sprintHeld = false;
  private joyActive = false;
  private joyBaseX = 0;
  private joyBaseY = 0;
  private joyVecX = 0;
  private joyVecY = 0;
  private touchSprint = false;

  private resizeObs: ResizeObserver | null = null;
  private themeObs: MutationObserver | null = null;
  private readonly controls = new AbortController();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardown());
    afterNextRender(() => this.setup());
  }

  // ── Acciones del HUD ───────────────────────────────────────────────────────

  protected respawn(): void {
    this.renderById.clear();
    this.game.connect(this.mode);
  }

  protected exit(): void {
    this.game.disconnect();
    void this.router.navigate(['/student/games']);
  }

  protected pressSplit(): void {
    this.game.sendSplit();
  }

  protected pressEject(): void {
    this.game.sendEject();
  }

  protected setTouchSprint(active: boolean): void {
    this.touchSprint = active;
  }

  // ── Setup / teardown ───────────────────────────────────────────────────────

  private resolveMode(): GameMode {
    const raw = this.route.snapshot.queryParamMap.get('mode');
    return raw === 'pomodoro' || raw === 'battleroyale' ? raw : 'classic';
  }

  private setup(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    this.ctx = ctx;
    this.sampleTheme();
    this.resize();

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.themeObs = new MutationObserver(() => this.sampleTheme());
    this.themeObs.observe(this.doc.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    this.attachInput(canvas);
    this.game.connect(this.mode);

    this.lastFrame = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  private teardown(): void {
    cancelAnimationFrame(this.rafId);
    this.controls.abort();
    this.resizeObs?.disconnect();
    this.themeObs?.disconnect();
    this.game.disconnect();
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    const dpr = Math.min(this.doc.defaultView?.devicePixelRatio ?? 1, 2);
    const rect = canvas.getBoundingClientRect();
    this.viewW = rect.width;
    this.viewH = rect.height;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.pointerX = this.viewW / 2;
    this.pointerY = this.viewH / 2;
  }

  private sampleTheme(): void {
    const root = this.doc.documentElement;
    const s = (this.doc.defaultView ?? window).getComputedStyle(root);
    const v = (name: string, fallback: string): string => s.getPropertyValue(name).trim() || fallback;
    this.colors = {
      surface: v('--surface', '#16161a'),
      surface2: v('--surface-2', '#1e1e24'),
      border: v('--border', '#33333d'),
      text: v('--text', '#f2f2f5'),
      accent: v('--accent', '#e23a52'),
    };
  }

  // ── Entrada ────────────────────────────────────────────────────────────────

  private attachInput(canvas: HTMLCanvasElement): void {
    const signal = this.controls.signal;
    const win = this.doc.defaultView ?? window;

    canvas.addEventListener(
      'mousemove',
      (e) => {
        const rect = canvas.getBoundingClientRect();
        this.pointerX = e.clientX - rect.left;
        this.pointerY = e.clientY - rect.top;
      },
      { signal },
    );
    canvas.addEventListener('mousedown', (e) => { if (e.button === 0) this.sprintHeld = true; }, { signal });
    win.addEventListener('mouseup', () => { this.sprintHeld = false; }, { signal });

    win.addEventListener(
      'keydown',
      (e) => {
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          this.sprintHeld = true;
        } else if (e.code === 'Space') {
          e.preventDefault();
          this.game.sendSplit();
        } else if (e.code === 'KeyW') {
          this.game.sendEject();
        }
      },
      { signal },
    );
    win.addEventListener(
      'keyup',
      (e) => {
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          this.sprintHeld = false;
        }
      },
      { signal },
    );

    // Joystick táctil en la mitad izquierda del canvas.
    canvas.addEventListener('touchstart', (e) => this.onTouch(e, canvas, true), { signal, passive: false });
    canvas.addEventListener('touchmove', (e) => this.onTouch(e, canvas, false), { signal, passive: false });
    canvas.addEventListener(
      'touchend',
      () => {
        this.joyActive = false;
        this.joyVecX = 0;
        this.joyVecY = 0;
      },
      { signal },
    );
  }

  private onTouch(e: TouchEvent, canvas: HTMLCanvasElement, start: boolean): void {
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (start) {
      if (x > this.viewW * 0.55) {
        return; // la mitad derecha queda para botones
      }
      this.joyActive = true;
      this.joyBaseX = x;
      this.joyBaseY = y;
    }
    if (!this.joyActive) {
      return;
    }
    e.preventDefault();
    const dx = x - this.joyBaseX;
    const dy = y - this.joyBaseY;
    const dist = Math.hypot(dx, dy);
    const max = 60;
    const mag = Math.min(1, dist / max);
    if (dist < 1) {
      this.joyVecX = 0;
      this.joyVecY = 0;
    } else {
      this.joyVecX = (dx / dist) * mag;
      this.joyVecY = (dy / dist) * mag;
    }
  }

  /** Dirección normalizada actual a partir del puntero o el joystick. */
  private currentDirection(): { dx: number; dy: number } {
    if (this.joyActive) {
      return { dx: this.joyVecX, dy: this.joyVecY };
    }
    const cx = this.viewW / 2;
    const cy = this.viewH / 2;
    let dx = this.pointerX - cx;
    let dy = this.pointerY - cy;
    const dist = Math.hypot(dx, dy);
    const dead = 14;
    if (dist <= dead) {
      return { dx: 0, dy: 0 };
    }
    const mag = Math.min(1, (dist - dead) / (Math.min(this.viewW, this.viewH) * 0.4));
    dx = (dx / dist) * mag;
    dy = (dy / dist) * mag;
    return { dx, dy };
  }

  // ── Bucle principal ─────────────────────────────────────────────────────────

  private loop(now: number): void {
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    this.syncRenderCells(dt);
    this.updateCamera(dt);

    if (this.game.status() === 'playing') {
      const { dx, dy } = this.currentDirection();
      this.game.sendMove(dx, dy, this.sprintHeld || this.touchSprint);
    }

    this.render();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  /** Interpola las posiciones de render hacia el último snapshot autoritativo. */
  private syncRenderCells(dt: number): void {
    const k = 1 - Math.exp(-14 * dt);
    const live = this.game.playersById;
    for (const [id, target] of live) {
      const cur = this.renderById.get(id);
      if (!cur) {
        this.renderById.set(id, { x: target.x, y: target.y, radius: target.radius });
      } else {
        cur.x += (target.x - cur.x) * k;
        cur.y += (target.y - cur.y) * k;
        cur.radius += (target.radius - cur.radius) * k;
      }
    }
    for (const id of this.renderById.keys()) {
      if (!live.has(id)) {
        this.renderById.delete(id);
      }
    }
  }

  private selfCenter(): { x: number; y: number; radius: number } | null {
    const me = this.game.me();
    if (!me) {
      return null;
    }
    let sx = 0;
    let sy = 0;
    let maxR = INITIAL_RADIUS;
    let n = 0;
    for (const [id, cell] of this.renderById) {
      const snap = this.game.playersById.get(id);
      if (!snap || (snap.owner ?? snap.id) !== me.playerId) {
        continue;
      }
      sx += cell.x;
      sy += cell.y;
      maxR = Math.max(maxR, cell.radius);
      n++;
    }
    return n > 0 ? { x: sx / n, y: sy / n, radius: maxR } : null;
  }

  private updateCamera(dt: number): void {
    const me = this.game.me();
    if (!me) {
      return;
    }
    const center = this.selfCenter();
    if (this.camX === 0 && this.camY === 0) {
      this.camX = center?.x ?? me.worldWidth / 2;
      this.camY = center?.y ?? me.worldHeight / 2;
    }
    if (center) {
      const k = 1 - Math.exp(-8 * dt);
      this.camX += (center.x - this.camX) * k;
      this.camY += (center.y - this.camY) * k;
    }
    const r = center?.radius ?? INITIAL_RADIUS;
    const halfExtent = 520 + r * 6;
    const targetScale = this.viewH / 2 / halfExtent;
    const clamped = Math.max(0.08, Math.min(1.4, targetScale));
    const k = 1 - Math.exp(-6 * dt);
    this.scale += (clamped - this.scale) * k;
  }

  private wx(x: number): number {
    return (x - this.camX) * this.scale + this.viewW / 2;
  }
  private wy(y: number): number {
    return (y - this.camY) * this.scale + this.viewH / 2;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  private render(): void {
    const ctx = this.ctx;
    const me = this.game.me();
    if (!ctx) {
      return;
    }
    ctx.fillStyle = this.colors.surface;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    if (!me) {
      return;
    }

    this.drawGrid(ctx, me.worldWidth, me.worldHeight);
    this.drawSafeZone(ctx);
    this.drawFood(ctx);
    this.drawPowerUps(ctx);
    this.drawViruses(ctx);
    this.drawPlayers(ctx, me.playerId);

    if (this.game.activeEvent() === 'blackout') {
      this.drawBlackout(ctx);
    }
    this.drawMinimap(ctx, me.worldWidth, me.worldHeight);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, worldW: number, worldH: number): void {
    const step = 120;
    ctx.strokeStyle = this.colors.border;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startX = Math.max(0, Math.floor((this.camX - this.viewW / 2 / this.scale) / step) * step);
    const endX = Math.min(worldW, this.camX + this.viewW / 2 / this.scale);
    for (let x = startX; x <= endX; x += step) {
      ctx.moveTo(this.wx(x), this.wy(0));
      ctx.lineTo(this.wx(x), this.wy(worldH));
    }
    const startY = Math.max(0, Math.floor((this.camY - this.viewH / 2 / this.scale) / step) * step);
    const endY = Math.min(worldH, this.camY + this.viewH / 2 / this.scale);
    for (let y = startY; y <= endY; y += step) {
      ctx.moveTo(this.wx(0), this.wy(y));
      ctx.lineTo(this.wx(worldW), this.wy(y));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Borde del mundo.
    ctx.strokeStyle = this.colors.accent;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.wx(0), this.wy(0), worldW * this.scale, worldH * this.scale);
    ctx.globalAlpha = 1;
  }

  private drawSafeZone(ctx: CanvasRenderingContext2D): void {
    const zone = this.game.safeZone;
    if (!zone) {
      return;
    }
    // Penumbra fuera de la zona (cierre tipo "semana de exámenes").
    ctx.save();
    ctx.fillStyle = 'rgba(200, 16, 46, 0.18)';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(this.wx(zone.x), this.wy(zone.y), zone.radius * this.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.wx(zone.x), this.wy(zone.y), zone.radius * this.scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawFood(ctx: CanvasRenderingContext2D): void {
    const r = Math.max(2, FOOD_RADIUS * this.scale);
    for (const f of this.game.foodById.values()) {
      const sx = this.wx(f.x);
      const sy = this.wy(f.y);
      if (sx < -r || sx > this.viewW + r || sy < -r || sy > this.viewH + r) {
        continue;
      }
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPowerUps(ctx: CanvasRenderingContext2D): void {
    const r = Math.max(6, POWERUP_RADIUS * this.scale);
    for (const pu of this.game.powerUps) {
      const sx = this.wx(pu.x);
      const sy = this.wy(pu.y);
      if (sx < -r || sx > this.viewW + r || sy < -r || sy > this.viewH + r) {
        continue;
      }
      const color = POWERUP_COLORS[pu.type] ?? this.colors.accent;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      this.roundedBadge(ctx, sx, sy, r);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      this.drawPowerUpGlyph(ctx, pu.type, sx, sy, r);
    }
  }

  private roundedBadge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Glyphs vectoriales simples por tipo (sin emojis ni texto). */
  private drawPowerUpGlyph(
    ctx: CanvasRenderingContext2D,
    type: PowerUpType,
    x: number,
    y: number,
    r: number,
  ): void {
    const s = r * 0.55;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    switch (type) {
      case 'speed': // chevrons (rapidez)
        ctx.moveTo(-s * 0.6, -s);
        ctx.lineTo(s * 0.2, 0);
        ctx.lineTo(-s * 0.6, s);
        ctx.moveTo(s * 0.1, -s);
        ctx.lineTo(s * 0.9, 0);
        ctx.lineTo(s * 0.1, s);
        break;
      case 'mass': // cruz (sumar masa)
      case 'double':
        ctx.moveTo(-s, 0);
        ctx.lineTo(s, 0);
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s);
        if (type === 'double') {
          ctx.moveTo(-s * 0.5, -s);
          ctx.lineTo(-s * 0.5, s);
        }
        break;
      case 'shield': // hexágono (concentración/escudo)
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const px = Math.cos(a) * s;
          const py = Math.sin(a) * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'magnet': // arco (imán)
        ctx.arc(0, 0, s, Math.PI * 0.15, Math.PI * 0.85, false);
        break;
      case 'freeze': // asterisco/copo (pausa)
        for (let i = 0; i < 3; i++) {
          const a = (Math.PI / 3) * i;
          ctx.moveTo(-Math.cos(a) * s, -Math.sin(a) * s);
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        }
        break;
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawViruses(ctx: CanvasRenderingContext2D): void {
    const r = VIRUS_RADIUS * this.scale;
    for (const v of this.game.viruses) {
      const sx = this.wx(v.x);
      const sy = this.wy(v.y);
      if (sx < -r || sx > this.viewW + r || sy < -r || sy > this.viewH + r) {
        continue;
      }
      // Estrella dentada = "distracción".
      const spikes = 14;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const a = (Math.PI / spikes) * i;
        const rad = i % 2 === 0 ? r : r * 0.82;
        const px = sx + Math.cos(a) * rad;
        const py = sy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#c0392b';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#7b241c';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private drawPlayers(ctx: CanvasRenderingContext2D, myId: string): void {
    // Ordenar por radio para que los grandes queden arriba; el propio al final.
    const ids = [...this.renderById.keys()].sort((a, b) => {
      const ra = this.renderById.get(a)?.radius ?? 0;
      const rb = this.renderById.get(b)?.radius ?? 0;
      return ra - rb;
    });
    for (const id of ids) {
      const cell = this.renderById.get(id);
      const snap = this.game.playersById.get(id);
      if (!cell || !snap) {
        continue;
      }
      const r = cell.radius * this.scale;
      const sx = this.wx(cell.x);
      const sy = this.wy(cell.y);
      if (sx < -r - 40 || sx > this.viewW + r + 40 || sy < -r - 40 || sy > this.viewH + r + 40) {
        continue;
      }
      const mine = (snap.owner ?? snap.id) === myId;

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = snap.color;
      ctx.globalAlpha = snap.frozen ? 0.55 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.lineWidth = mine ? 4 : 2;
      ctx.strokeStyle = mine ? '#ffffff' : 'rgba(0,0,0,0.35)';
      ctx.stroke();

      if (snap.shielded) {
        ctx.beginPath();
        ctx.arc(sx, sy, r + 5, 0, Math.PI * 2);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Nombre (texto, no emoji).
      if (r > 14) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${Math.min(22, Math.max(11, r * 0.42))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3;
        ctx.fillText(snap.name, sx, sy);
        ctx.shadowBlur = 0;
      }
    }
  }

  private drawBlackout(ctx: CanvasRenderingContext2D): void {
    const center = this.selfCenter();
    const cx = center ? this.wx(center.x) : this.viewW / 2;
    const cy = center ? this.wy(center.y) : this.viewH / 2;
    const inner = Math.max(60, this.viewH * 0.16);
    const outer = this.viewH * 0.45;
    const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  private drawMinimap(ctx: CanvasRenderingContext2D, worldW: number, worldH: number): void {
    const size = 132;
    const pad = 12;
    const x0 = this.viewW - size - pad;
    const y0 = this.viewH - size - pad;
    const sx = size / worldW;
    const sy = size / worldH;

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = this.colors.surface2;
    ctx.fillRect(x0, y0, size, size);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, size, size);

    const zone = this.game.safeZone;
    if (zone) {
      ctx.strokeStyle = this.colors.accent;
      ctx.beginPath();
      ctx.arc(x0 + zone.x * sx, y0 + zone.y * sy, zone.radius * sx, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const cell of this.renderById.values()) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x0 + cell.x * sx - 1, y0 + cell.y * sy - 1, 2, 2);
    }
    const center = this.selfCenter();
    if (center) {
      ctx.fillStyle = this.colors.accent;
      ctx.beginPath();
      ctx.arc(x0 + center.x * sx, y0 + center.y * sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
