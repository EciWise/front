import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AprendizajeService } from './aprendizaje.service';
import { STUDY_CONFIG } from '../../core/study/study.config';

const BASE = 'http://localhost:8082/api';

describe('AprendizajeService', () => {
  let service: AprendizajeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: STUDY_CONFIG, useValue: { studyApiUrl: 'http://localhost:8082' } },
      ],
    });
    service = TestBed.inject(AprendizajeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las colecciones visibles', () => {
    let result: unknown;
    service.collections().subscribe((c) => (result = c));

    const req = http.expectOne(`${BASE}/collections`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Mate', visibility: 'PUBLIC' }]);

    expect(result).toEqual([{ id: 1, name: 'Mate', visibility: 'PUBLIC' }]);
  });

  it('envía la calificación de un repaso', () => {
    service.review(7, 'ACEPTABLE').subscribe();

    const req = http.expectOne(`${BASE}/flashcards/7/review`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ grade: 'ACEPTABLE' });
    req.flush({ flashcardId: 7, state: 'EN_APRENDIZAJE', intervalDays: 1 });
  });

  it('pide la cola de estudio de una colección', () => {
    service.studyQueue(3).subscribe();
    const req = http.expectOne(`${BASE}/collections/3/study`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('propaga el error cuando el backend falla', () => {
    let failed = false;
    service.reviewsSummary().subscribe({ error: () => (failed = true) });

    const req = http.expectOne(`${BASE}/reviews/me`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
