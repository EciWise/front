import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GAMIFICATION_CONFIG } from './gamification.config';

export interface UserRanking {
  readonly userId: string;
  readonly position: number;
  readonly score: number;
}

export interface GamificationAchievement {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly unlockedAt: string;
}

/** Logro recién desbloqueado devuelto por los endpoints de acción (juego, práctica, estudio). */
export interface UnlockedAchievement {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly unlockedAt: string;
}

/** Respuesta común de los endpoints de acción de gamificación. */
export interface ActionReward {
  readonly rewarded: boolean;
  readonly unlockedAchievements: readonly UnlockedAchievement[];
}

export interface UserSummary {
  readonly userId: string;
  readonly totalPoints: number;
  readonly levelName: string;
  readonly reputationScore: number;
  readonly currentLevelMinPoints: number;
  readonly nextLevelName: string | null;
  readonly nextLevelMinPoints: number | null;
}

export interface GamificationLevel {
  readonly name: string;
  readonly minPoints: number;
}

/** Vista agregada para la página de gamificación. */
export interface GamificationOverview {
  readonly summary: UserSummary | null;
  readonly ranking: UserRanking | null;
  readonly achievements: readonly GamificationAchievement[];
  readonly levels: readonly GamificationLevel[];
}

export type RankingType = 'GlobalPorPuntos';

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(GAMIFICATION_CONFIG);

  private get base(): string {
    return this.config.gamificationApiUrl;
  }

  getUserRanking(userId: string, type: RankingType = 'GlobalPorPuntos'): Observable<UserRanking> {
    return this.http.get<UserRanking>(`${this.base}/api/Gamification/users/${userId}/ranking`, {
      params: { type },
    });
  }

  getUserAchievements(userId: string): Observable<GamificationAchievement[]> {
    return this.http.get<GamificationAchievement[]>(
      `${this.base}/api/Gamification/users/${userId}/achievements`,
    );
  }

  getUserSummary(userId: string): Observable<UserSummary> {
    return this.http.get<UserSummary>(
      `${this.base}/api/Gamification/users/${userId}/summary`,
    );
  }

  getLevels(): Observable<GamificationLevel[]> {
    return this.http.get<GamificationLevel[]>(`${this.base}/api/Gamification/levels`);
  }

  /**
   * Registra que el usuario jugó un mini-juego. El backend otorga 10 puntos y
   * desbloquea el logro "Buscador de aventuras" solo la primera vez; las jugadas
   * siguientes son idempotentes. Devuelve los logros recién desbloqueados.
   */
  registerGamePlayed(userId: string, gameId: string): Observable<ActionReward> {
    return this.http.post<ActionReward>(
      `${this.base}/api/Gamification/users/${userId}/games/played`,
      { gameId },
    );
  }

  /**
   * Registra que el usuario completó un quiz de práctica (otorga puntos cada vez).
   * Devuelve los logros recién desbloqueados para mostrarlos en un toast.
   */
  registerPracticeCompleted(userId: string): Observable<ActionReward> {
    return this.http.post<ActionReward>(
      `${this.base}/api/Gamification/users/${userId}/practice/completed`,
      {},
    );
  }

  /**
   * Registra que el usuario completó una sesión de estudio (otorga puntos cada vez).
   * Devuelve los logros recién desbloqueados para mostrarlos en un toast.
   */
  registerStudyCompleted(userId: string): Observable<ActionReward> {
    return this.http.post<ActionReward>(
      `${this.base}/api/Gamification/users/${userId}/study/completed`,
      {},
    );
  }

  /**
   * Registra que el usuario completó su perfil de IA en la sección de perfil. El
   * backend otorga 10 puntos y desbloquea el logro "La IA ya sabe dónde vives"
   * solo la primera vez; las llamadas siguientes son idempotentes. Devuelve los
   * logros recién desbloqueados para mostrarlos en un toast.
   */
  registerAiProfileCompleted(userId: string): Observable<ActionReward> {
    return this.http.post<ActionReward>(
      `${this.base}/api/Gamification/users/${userId}/ai-profile/completed`,
      {},
    );
  }

  /**
   * Registra que el usuario abrió una pregunta del Centro de Ayuda. El backend
   * desbloquea el logro "Perdidasss, andamos perdidasss!" solo la primera vez (sin
   * puntos); las llamadas siguientes son idempotentes. Devuelve los logros recién
   * desbloqueados para mostrarlos en un toast.
   */
  registerHelpQuestionOpened(userId: string): Observable<ActionReward> {
    return this.http.post<ActionReward>(
      `${this.base}/api/Gamification/users/${userId}/help/opened`,
      {},
    );
  }

  /**
   * Vista agregada y tolerante a fallos: cada fuente cae a un valor vacío si su
   * llamada falla, para que la página nunca se rompa por un microservicio caído.
   */
  getOverview(userId: string): Observable<GamificationOverview> {
    return forkJoin({
      summary: this.getUserSummary(userId).pipe(catchError(() => of(null))),
      ranking: this.getUserRanking(userId).pipe(catchError(() => of(null))),
      achievements: this.getUserAchievements(userId).pipe(
        catchError(() => of([] as GamificationAchievement[])),
      ),
      levels: this.getLevels().pipe(catchError(() => of([] as GamificationLevel[]))),
    });
  }
}
