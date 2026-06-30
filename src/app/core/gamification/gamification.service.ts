import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GAMIFICATION_CONFIG } from './gamification.config';

export interface UserRanking {
  readonly userId: string;
  readonly position: number;
  readonly score: number;
}

export interface GamificationAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly unlockedAt: string;
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
}
