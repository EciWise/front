import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { STUDY_CONFIG } from '../../core/study/study.config';
import {
  Collection,
  CollectionRequest,
  Flashcard,
  FlashcardRequest,
  ReviewResponse,
  UsageSummary,
} from './study.models';
import { AprendizajeService } from './aprendizaje.service';

const BASE = 'http://localhost:8082/api';

const collection: Collection = {
  id: 1,
  name: 'Mate',
  visibility: 'PUBLIC',
  author: {
    externalId: 'u1',
    email: 'ana@escuelaing.edu.co',
    firstName: 'Ana',
    lastName: 'Diaz',
    role: 'estudiante',
  },
  flashcardCount: 2,
  favorite: false,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

const flashcard: Flashcard = {
  id: 9,
  collectionId: 1,
  title: 'Derivadas',
  description: 'Reglas basicas',
  question: 'd/dx x^2',
  answer: '2x',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

describe('AprendizajeService', () => {
  let service: AprendizajeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: STUDY_CONFIG, useValue: { studyApiUrl: 'http://localhost:8082/' } },
      ],
    });
    service = TestBed.inject(AprendizajeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las colecciones visibles', () => {
    let result: Collection[] | undefined;
    service.collections().subscribe((collections) => (result = collections));

    const req = http.expectOne(`${BASE}/collections`);
    expect(req.request.method).toBe('GET');
    req.flush([collection]);

    expect(result).toEqual([collection]);
  });

  it('crea, actualiza, marca favorito y elimina colecciones', () => {
    const body: CollectionRequest = { name: 'Fisica', visibility: 'PRIVATE' };

    service.createCollection(body).subscribe();
    let req = http.expectOne(`${BASE}/collections`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...collection, ...body });

    service.updateCollection(1, body).subscribe();
    req = http.expectOne(`${BASE}/collections/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ ...collection, ...body });

    service.setFavorite(1, true).subscribe();
    req = http.expectOne(`${BASE}/collections/1/favorite`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ favorite: true });
    req.flush({ ...collection, favorite: true });

    service.deleteCollection(1).subscribe();
    req = http.expectOne(`${BASE}/collections/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('gestiona flashcards de una coleccion', () => {
    const body: FlashcardRequest = {
      title: 'Limites',
      description: null,
      question: 'lim x->0 sin x / x',
      answer: '1',
    };

    service.flashcards(1).subscribe();
    let req = http.expectOne(`${BASE}/collections/1/flashcards`);
    expect(req.request.method).toBe('GET');
    req.flush([flashcard]);

    service.createFlashcard(1, body).subscribe();
    req = http.expectOne(`${BASE}/collections/1/flashcards`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...flashcard, ...body });

    service.updateFlashcard(9, body).subscribe();
    req = http.expectOne(`${BASE}/flashcards/9`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ ...flashcard, ...body });

    service.deleteFlashcard(9).subscribe();
    req = http.expectOne(`${BASE}/flashcards/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('envia la calificacion de un repaso', () => {
    let result: ReviewResponse | undefined;
    service.review(7, 'ACEPTABLE').subscribe((response) => (result = response));

    const req = http.expectOne(`${BASE}/flashcards/7/review`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ grade: 'ACEPTABLE' });
    req.flush({
      flashcardId: 7,
      state: 'EN_APRENDIZAJE',
      repetitions: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      lapses: 0,
      dueAt: '2026-06-02T00:00:00Z',
      lastReviewedAt: '2026-06-01T00:00:00Z',
    });

    expect(result?.intervalDays).toBe(1);
  });

  it('pide la cola de estudio de una coleccion', () => {
    service.studyQueue(3).subscribe();

    const req = http.expectOne(`${BASE}/collections/3/study`);
    expect(req.request.method).toBe('GET');
    req.flush([{ card: flashcard, state: null, dueAt: null }]);
  });

  it('consulta resumenes de repasos y uso', () => {
    service.reviewsSummary().subscribe();
    let req = http.expectOne(`${BASE}/reviews/me`);
    expect(req.request.method).toBe('GET');
    req.flush({
      total: 4,
      enAprendizaje: 1,
      repetir: 1,
      aceptable: 1,
      aprendido: 1,
      vencidas: 0,
    });

    let usage: UsageSummary | undefined;
    service.usageSummary().subscribe((response) => (usage = response));
    req = http.expectOne(`${BASE}/usage/me`);
    expect(req.request.method).toBe('GET');
    req.flush({
      totalUsed: 1,
      history: [{ flashcardId: 9, flashcardTitle: 'Derivadas', usedAt: '2026-06-01T00:00:00Z' }],
    });

    expect(usage?.totalUsed).toBe(1);
  });

  it('propaga el error cuando el backend falla', () => {
    let failed = false;
    service.reviewsSummary().subscribe({ error: () => (failed = true) });

    const req = http.expectOne(`${BASE}/reviews/me`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
