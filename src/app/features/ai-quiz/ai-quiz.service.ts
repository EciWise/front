import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IA_CONFIG } from '../../core/ia/ia.config';

export type AiQuizDifficulty = 'easy' | 'medium' | 'hard';

export interface AiQuizStartRequest {
  readonly topic: string;
  readonly numQuestions: number;
  readonly difficulty: AiQuizDifficulty;
}

export interface AiQuizOption {
  readonly id: string;
  readonly text: string;
}

export interface AiQuizQuestion {
  readonly questionText: string;
  readonly type: 'closed' | 'open';
  readonly options?: readonly AiQuizOption[];
}

export interface AiQuizStartResponse {
  readonly sessionId: string;
  readonly totalQuestions: number;
  readonly currentQuestion: number;
  readonly question: AiQuizQuestion;
}

export interface AiQuizAnswerRequest {
  readonly sessionId: string;
  readonly answer: string;
}

export interface AiQuizAnswerResponse {
  readonly isCorrect: boolean;
  readonly explanation: string;
  readonly correctAnswer?: string;
  readonly isFinished: boolean;
  readonly currentQuestion?: number;
  readonly totalQuestions?: number;
  readonly nextQuestion?: AiQuizQuestion;
  readonly score?: number;
}

export interface AiQuizResult {
  readonly sessionId: string;
  readonly score: number;
  readonly totalQuestions: number;
  readonly correctAnswers: number;
  readonly details: readonly AiQuizResultDetail[];
}

export interface AiQuizResultDetail {
  readonly questionText: string;
  readonly userAnswer: string;
  readonly correctAnswer: string;
  readonly isCorrect: boolean;
  readonly explanation: string;
}

@Injectable({ providedIn: 'root' })
export class AiQuizService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(IA_CONFIG);

  private get base(): string {
    return this.config.ragApiUrl;
  }

  startQuiz(req: AiQuizStartRequest): Observable<AiQuizStartResponse> {
    return this.http.post<AiQuizStartResponse>(`${this.base}/api/quiz/start`, req);
  }

  answerQuestion(req: AiQuizAnswerRequest): Observable<AiQuizAnswerResponse> {
    return this.http.post<AiQuizAnswerResponse>(`${this.base}/api/quiz/answer`, req);
  }

  getResult(sessionId: string): Observable<AiQuizResult> {
    return this.http.get<AiQuizResult>(`${this.base}/api/quiz/result/${sessionId}`);
  }
}
