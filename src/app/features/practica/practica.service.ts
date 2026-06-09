import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { stripTrailingSlashes } from '../../core/config/url.util';
import { STUDY_CONFIG } from '../../core/study/study.config';
import {
  AnswerRequest,
  AnswerResult,
  LeaderboardResponse,
  PagedResponse,
  Question,
  QuestionCollection,
  QuestionCollectionRequest,
  QuestionRequest,
  QuestionStats,
  SessionResponse,
  SessionSummary,
  StartSessionRequest,
  Subject,
  SubjectRequest,
} from './practica.models';

/**
 * Cliente HTTP del sistema de quiz de ECIWISE-STUDY. Cubre asignaturas, banco de
 * preguntas (+estadísticas), colecciones de repaso, motor de sesiones (Parcial /
 * Repaso / Supervivencia), historial y ranking de supervivencia. El JWT lo adjunta
 * el authInterceptor y los errores se normalizan en el errorInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class PracticaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(STUDY_CONFIG);

  private get base(): string {
    return `${stripTrailingSlashes(this.config.studyApiUrl)}/api`;
  }

  // ── Asignaturas (escritura: solo admin en el backend) ──
  subjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.base}/subjects`);
  }

  createSubject(body: SubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(`${this.base}/subjects`, body);
  }

  updateSubject(id: number, body: SubjectRequest): Observable<Subject> {
    return this.http.put<Subject>(`${this.base}/subjects/${id}`, body);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/subjects/${id}`);
  }

  // ── Banco de preguntas (escritura: tutor/admin) ──
  questions(subjectId: number, corte?: number | null): Observable<Question[]> {
    let params = new HttpParams().set('subjectId', subjectId);
    if (corte != null) {
      params = params.set('corte', corte);
    }
    return this.http.get<Question[]>(`${this.base}/questions`, { params });
  }

  createQuestion(body: QuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.base}/questions`, body);
  }

  updateQuestion(id: number, body: QuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${this.base}/questions/${id}`, body);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${id}`);
  }

  questionStats(id: number): Observable<QuestionStats> {
    return this.http.get<QuestionStats>(`${this.base}/questions/${id}/stats`);
  }

  // ── Colecciones de preguntas (modo Repaso) ──
  questionCollections(): Observable<QuestionCollection[]> {
    return this.http.get<QuestionCollection[]>(`${this.base}/question-collections`);
  }

  createQuestionCollection(body: QuestionCollectionRequest): Observable<QuestionCollection> {
    return this.http.post<QuestionCollection>(`${this.base}/question-collections`, body);
  }

  updateQuestionCollection(
    id: number,
    body: QuestionCollectionRequest,
  ): Observable<QuestionCollection> {
    return this.http.put<QuestionCollection>(`${this.base}/question-collections/${id}`, body);
  }

  deleteQuestionCollection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/question-collections/${id}`);
  }

  // ── Motor de sesiones de quiz ──
  startSession(body: StartSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.base}/quiz/sessions`, body);
  }

  answer(sessionId: number, body: AnswerRequest): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`${this.base}/quiz/sessions/${sessionId}/answers`, body);
  }

  finishSession(sessionId: number): Observable<SessionSummary> {
    return this.http.post<SessionSummary>(`${this.base}/quiz/sessions/${sessionId}/finish`, {});
  }

  session(sessionId: number): Observable<SessionSummary> {
    return this.http.get<SessionSummary>(`${this.base}/quiz/sessions/${sessionId}`);
  }

  // ── Historial y ranking ──
  history(page: number, size: number): Observable<PagedResponse<SessionSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<SessionSummary>>(`${this.base}/quiz/history`, { params });
  }

  survivalLeaderboard(page: number, size: number): Observable<LeaderboardResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<LeaderboardResponse>(`${this.base}/quiz/survival/leaderboard`, { params });
  }
}
