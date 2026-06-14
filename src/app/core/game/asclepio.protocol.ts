/**
 * Tipos del protocolo WebSocket del servidor de juego Asclepio (Go/Fiber).
 * Refleja `game/game/message.go`. Los campos marcados como opcionales con el
 * comentario "(fase C/D/E)" aún no los emite el servidor base; se declaran ya
 * para que el cliente no requiera reescritura al incorporarlos.
 */

/** Modos de juego soportados. Llega como `?mode=` al conectar. */
export type GameMode = 'classic' | 'pomodoro' | 'battleroyale';

/** Tipos de power-up. `magnet|freeze|double` se incorporan en la fase E. */
export type PowerUpType = 'speed' | 'mass' | 'shield' | 'magnet' | 'freeze' | 'double';

/** Eventos de sala (fase E). */
export type GameEvent = 'idea-rain' | 'blackout';

export interface PlayerSnapshot {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly color: string;
  readonly score: number;
  readonly sprinting?: boolean;
  readonly shielded?: boolean;
  readonly speedBoosted?: boolean;
  readonly sprintStamina?: number;
  /** Jugador dueño de la celda (fase C, multi-célula). Ausente = id propio. */
  readonly owner?: string;
  readonly magnet?: boolean;
  readonly frozen?: boolean;
  readonly doubled?: boolean;
}

export interface FoodSnapshot {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
}

export interface PowerUpSnapshot {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly type: PowerUpType;
}

export interface VirusSnapshot {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

export interface LeaderboardEntry {
  readonly rank: number;
  readonly name: string;
  readonly score: number;
  readonly color: string;
}

/** Zona segura del modo Battle Royale (fase D). */
export interface SafeZone {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

export interface InitMsg {
  readonly type: 'init';
  readonly playerId: string;
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly color: string;
  readonly name: string;
  readonly food: readonly FoodSnapshot[];
  readonly powerUps?: readonly PowerUpSnapshot[];
  readonly viruses?: readonly VirusSnapshot[];
  readonly mode?: GameMode;
  readonly roundSeconds?: number;
}

export interface StateMsg {
  readonly type: 'state';
  readonly tick: number;
  readonly players: readonly PlayerSnapshot[];
  readonly foodAdded?: readonly FoodSnapshot[];
  readonly foodRemoved?: readonly number[];
  readonly leaderboard?: readonly LeaderboardEntry[];
  readonly powerUps?: readonly PowerUpSnapshot[];
  readonly viruses?: readonly VirusSnapshot[];
  /** Segundos restantes de la ronda (fase D, pomodoro/battleroyale). */
  readonly timeLeft?: number;
  readonly safeZone?: SafeZone;
  readonly activeEvent?: GameEvent | null;
}

export interface DiedMsg {
  readonly type: 'died';
  readonly killedBy: string;
  readonly finalScore: number;
}

/** Fin de partida en modos cronometrados (pomodoro / supervivencia). */
export interface GameOverMsg {
  readonly type: 'gameover';
  readonly reason: string;
  readonly leaderboard: readonly LeaderboardEntry[];
  readonly yourScore: number;
  readonly yourRank: number;
}

export interface ErrorMsg {
  readonly type: 'error';
  readonly message: string;
}

export type ServerMessage = InitMsg | StateMsg | DiedMsg | GameOverMsg | ErrorMsg;

/** Mensajes cliente → servidor. */
export interface MoveMsg {
  readonly type: 'move';
  readonly dx: number;
  readonly dy: number;
  readonly sprint?: boolean;
}
export interface SplitMsg {
  readonly type: 'split';
}
export interface EjectMsg {
  readonly type: 'eject';
}
export type ClientMessage = MoveMsg | SplitMsg | EjectMsg;
