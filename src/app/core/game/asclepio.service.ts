import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { GAME_CONFIG } from './game.config';
import {
  DiedMsg,
  FoodSnapshot,
  GameEvent,
  GameMode,
  GameOverMsg,
  InitMsg,
  LeaderboardEntry,
  PlayerSnapshot,
  PowerUpSnapshot,
  SafeZone,
  ServerMessage,
  StateMsg,
  VirusSnapshot,
} from './asclepio.protocol';

export type GameStatus = 'idle' | 'connecting' | 'playing' | 'dead' | 'finished' | 'error';

/** Información del jugador local recibida en `init`. */
export interface MeInfo {
  readonly playerId: string;
  readonly name: string;
  readonly color: string;
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly mode: GameMode;
  readonly roundSeconds: number | null;
}

/** Estado del jugador local para el HUD (puntaje, energía, buffs). */
export interface SelfHud {
  readonly score: number;
  readonly sprintStamina: number;
  readonly shielded: boolean;
  readonly speedBoosted: boolean;
  readonly magnet: boolean;
  readonly frozen: boolean;
  readonly doubled: boolean;
}

const MOVE_INTERVAL_MS = 33; // ~30 Hz de envío de input
const SPRINT_MAX_STAMINA = 3; // espejo de game/game/constants.go (SprintMaxStamina)

/**
 * Cliente WebSocket del juego Asclepio. Mantiene los datos de render de alta
 * frecuencia en estructuras planas (leídas directamente desde el bucle
 * `requestAnimationFrame` del componente, sin reactividad para no disparar
 * detección de cambios a 30 fps) y el estado de UI en signals.
 *
 * Seguro en SSR: nunca abre el socket fuera del navegador.
 */
@Injectable({ providedIn: 'root' })
export class AsclepioService {
  private readonly config = inject(GAME_CONFIG);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private socket: WebSocket | null = null;
  private lastMoveSent = 0;

  // ── Datos de render (no reactivos a propósito; se leen desde el RAF) ──────
  /** Celdas/jugadores por id de snapshot. */
  readonly playersById = new Map<string, PlayerSnapshot>();
  /** Comida por id (sembrada en `init`, actualizada por deltas en `state`). */
  readonly foodById = new Map<number, FoodSnapshot>();
  powerUps: readonly PowerUpSnapshot[] = [];
  viruses: readonly VirusSnapshot[] = [];
  safeZone: SafeZone | null = null;

  // ── Estado de UI (signals) ───────────────────────────────────────────────
  private readonly _status = signal<GameStatus>('idle');
  readonly status = this._status.asReadonly();

  private readonly _me = signal<MeInfo | null>(null);
  readonly me = this._me.asReadonly();

  private readonly _self = signal<SelfHud | null>(null);
  readonly self = this._self.asReadonly();

  private readonly _leaderboard = signal<readonly LeaderboardEntry[]>([]);
  readonly leaderboard = this._leaderboard.asReadonly();

  private readonly _died = signal<DiedMsg | null>(null);
  readonly died = this._died.asReadonly();

  private readonly _results = signal<GameOverMsg | null>(null);
  readonly results = this._results.asReadonly();

  private readonly _timeLeft = signal<number | null>(null);
  readonly timeLeft = this._timeLeft.asReadonly();

  private readonly _activeEvent = signal<GameEvent | null>(null);
  readonly activeEvent = this._activeEvent.asReadonly();

  /** Clave i18n del último error de conexión, o null. */
  private readonly _errorKey = signal<string | null>(null);
  readonly errorKey = this._errorKey.asReadonly();

  /** Abre la conexión al servidor de juego en el modo indicado. */
  connect(mode: GameMode): void {
    if (!this.isBrowser) {
      return;
    }
    this.disconnect();
    const token = this.auth.token;
    if (!token) {
      this._status.set('error');
      this._errorKey.set('games.status.error');
      return;
    }
    this.resetState();
    this._status.set('connecting');

    const url =
      `${this.config.gameWsUrl}?token=${encodeURIComponent(token)}` +
      `&mode=${encodeURIComponent(mode)}`;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this._status.set('error');
      this._errorKey.set('games.status.offline');
      return;
    }
    this.socket = ws;
    ws.onmessage = (ev) => this.onMessage(ev.data);
    ws.onerror = () => {
      this._status.set('error');
      this._errorKey.set('games.status.error');
    };
    ws.onclose = () => {
      if (this._status() === 'connecting') {
        this._status.set('error');
        this._errorKey.set('games.status.offline');
      }
    };
  }

  /** Cierra la conexión y silencia los manejadores. */
  disconnect(): void {
    const ws = this.socket;
    this.socket = null;
    if (ws) {
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  }

  /** Envía la dirección de movimiento (throttle ~30 Hz). */
  sendMove(dx: number, dy: number, sprint: boolean): void {
    const now = this.isBrowser ? performance.now() : 0;
    if (now - this.lastMoveSent < MOVE_INTERVAL_MS) {
      return;
    }
    this.lastMoveSent = now;
    this.send({ type: 'move', dx, dy, sprint });
  }

  /** Divide las celdas del jugador (fase C en el servidor). */
  sendSplit(): void {
    this.send({ type: 'split' });
  }

  /** Expulsa una porción de masa (fase C en el servidor). */
  sendEject(): void {
    this.send({ type: 'eject' });
  }

  private send(message: { type: string; [key: string]: unknown }): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private onMessage(data: unknown): void {
    if (typeof data !== 'string') {
      return;
    }
    let msg: ServerMessage;
    try {
      msg = JSON.parse(data) as ServerMessage;
    } catch {
      return;
    }
    switch (msg.type) {
      case 'init':
        this.applyInit(msg);
        break;
      case 'state':
        this.applyState(msg);
        break;
      case 'died':
        this._died.set(msg);
        this._status.set('dead');
        break;
      case 'gameover':
        this._results.set(msg);
        this._status.set('finished');
        break;
      case 'error':
        this._status.set('error');
        this._errorKey.set('games.status.error');
        break;
    }
  }

  private applyInit(msg: InitMsg): void {
    this.foodById.clear();
    for (const f of msg.food) {
      this.foodById.set(f.id, f);
    }
    this.powerUps = msg.powerUps ?? [];
    this.viruses = msg.viruses ?? [];
    this._me.set({
      playerId: msg.playerId,
      name: msg.name,
      color: msg.color,
      worldWidth: msg.worldWidth,
      worldHeight: msg.worldHeight,
      mode: msg.mode ?? 'classic',
      roundSeconds: msg.roundSeconds ?? null,
    });
    this._status.set('playing');
  }

  private applyState(msg: StateMsg): void {
    // Comida: deltas.
    if (msg.foodRemoved) {
      for (const id of msg.foodRemoved) {
        this.foodById.delete(id);
      }
    }
    if (msg.foodAdded) {
      for (const f of msg.foodAdded) {
        this.foodById.set(f.id, f);
      }
    }

    // Jugadores/celdas: snapshot completo cada tick.
    this.playersById.clear();
    for (const p of msg.players) {
      this.playersById.set(p.id, p);
    }

    if (msg.powerUps) {
      this.powerUps = msg.powerUps;
    }
    if (msg.viruses) {
      this.viruses = msg.viruses;
    }
    this.safeZone = msg.safeZone ?? null;

    if (msg.leaderboard) {
      this._leaderboard.set(msg.leaderboard);
    }
    this._timeLeft.set(msg.timeLeft ?? null);
    this._activeEvent.set(msg.activeEvent ?? null);

    this.updateSelf(msg.players);
  }

  /** Agrega las celdas propias en un único estado para el HUD. */
  private updateSelf(players: readonly PlayerSnapshot[]): void {
    const me = this._me();
    if (!me) {
      return;
    }
    let score = 0;
    let stamina = SPRINT_MAX_STAMINA;
    let shielded = false;
    let speedBoosted = false;
    let magnet = false;
    let frozen = false;
    let doubled = false;
    let found = false;
    for (const p of players) {
      if ((p.owner ?? p.id) !== me.playerId) {
        continue;
      }
      found = true;
      score += p.score;
      stamina = Math.min(stamina, p.sprintStamina ?? SPRINT_MAX_STAMINA);
      shielded ||= p.shielded ?? false;
      speedBoosted ||= p.speedBoosted ?? false;
      magnet ||= p.magnet ?? false;
      frozen ||= p.frozen ?? false;
      doubled ||= p.doubled ?? false;
    }
    this._self.set(
      found ? { score, sprintStamina: stamina, shielded, speedBoosted, magnet, frozen, doubled } : null,
    );
  }

  private resetState(): void {
    this.playersById.clear();
    this.foodById.clear();
    this.powerUps = [];
    this.viruses = [];
    this.safeZone = null;
    this._me.set(null);
    this._self.set(null);
    this._leaderboard.set([]);
    this._died.set(null);
    this._results.set(null);
    this._timeLeft.set(null);
    this._activeEvent.set(null);
    this._errorKey.set(null);
    this.lastMoveSent = 0;
  }
}
