import { HttpClient } from '@angular/common/http';
import { stripTrailingSlashes } from '../../core/config/url.util';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { STUDY_CONFIG } from '../../core/study/study.config';
import {
  Collection,
  CollectionRequest,
  Flashcard,
  FlashcardRequest,
  ReviewGrade,
  ReviewResponse,
  ReviewSummary,
  StudyCard,
  UsageSummary,
} from './study.models';

/**
 * Cliente HTTP del servicio ECIWISE-STUDY. Cubre colecciones, flashcards,
 * estudio (repetición espaciada) y estadísticas. El JWT lo adjunta el
 * authInterceptor y los errores se normalizan en el errorInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class AprendizajeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(STUDY_CONFIG);

  private get base(): string {
    return `${stripTrailingSlashes(this.config.studyApiUrl)}/api`;
  }

  // --- Colecciones ---
  collections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.base}/collections`);
  }

  createCollection(body: CollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.base}/collections`, body);
  }

  updateCollection(id: number, body: CollectionRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.base}/collections/${id}`, body);
  }

  deleteCollection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/collections/${id}`);
  }

  /**
   * Marca/desmarca una colección como favorita del usuario (aparece primero).
   * Contrato backend (ECIWISE-STUDY): `PUT /collections/{id}/favorite` con
   * cuerpo `{ favorite }`, devuelve la colección actualizada.
   */
  setFavorite(id: number, favorite: boolean): Observable<Collection> {
    return this.http.put<Collection>(`${this.base}/collections/${id}/favorite`, { favorite });
  }

  // --- Flashcards ---
  flashcards(collectionId: number): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.base}/collections/${collectionId}/flashcards`);
  }

  createFlashcard(collectionId: number, body: FlashcardRequest): Observable<Flashcard> {
    return this.http.post<Flashcard>(`${this.base}/collections/${collectionId}/flashcards`, body);
  }

  updateFlashcard(id: number, body: FlashcardRequest): Observable<Flashcard> {
    return this.http.put<Flashcard>(`${this.base}/flashcards/${id}`, body);
  }

  deleteFlashcard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/flashcards/${id}`);
  }

  // --- Estudio / repetición espaciada ---
  studyQueue(collectionId: number): Observable<StudyCard[]> {
    return this.http.get<StudyCard[]>(`${this.base}/collections/${collectionId}/study`);
  }

  review(flashcardId: number, grade: ReviewGrade): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.base}/flashcards/${flashcardId}/review`, {
      grade,
    });
  }

  // --- Estadísticas ---
  reviewsSummary(): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.base}/reviews/me`);
  }

  usageSummary(): Observable<UsageSummary> {
    return this.http.get<UsageSummary>(`${this.base}/usage/me`);
  }
}
