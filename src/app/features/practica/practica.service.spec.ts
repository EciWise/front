import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { STUDY_CONFIG } from '../../core/study/study.config';
import { PracticaService } from './practica.service';
import {
  AnswerRequest,
  QuestionRequest,
  StartSessionRequest,
  SubjectRequest,
} from './practica.models';

const BASE = 'http://localhost:8082/api';

describe('PracticaService', () => {
  let service: PracticaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: STUDY_CONFIG, useValue: { studyApiUrl: 'http://localhost:8082/' } },
      ],
    });
    service = TestBed.inject(PracticaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('crea, actualiza y elimina asignaturas', () => {
    const body: SubjectRequest = { name: 'Cálculo', description: null };

    service.createSubject(body).subscribe();
    let req = http.expectOne(`${BASE}/subjects`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, ...body, createdAt: '', updatedAt: '' });

    service.updateSubject(1, body).subscribe();
    req = http.expectOne(`${BASE}/subjects/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, ...body, createdAt: '', updatedAt: '' });

    service.deleteSubject(1).subscribe();
    req = http.expectOne(`${BASE}/subjects/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('lista preguntas por asignatura y corte y consulta estadísticas', () => {
    service.questions(5, 2).subscribe();
    let req = http.expectOne(`${BASE}/questions?subjectId=5&corte=2`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.questions(5).subscribe();
    req = http.expectOne(`${BASE}/questions?subjectId=5`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.questionStats(9).subscribe();
    req = http.expectOne(`${BASE}/questions/9/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ questionId: 9, timesAnswered: 0, correct: 0, incorrect: 0, correctRate: 0 });
  });

  it('crea una pregunta cerrada con opciones', () => {
    const body: QuestionRequest = {
      subjectId: 5,
      corte: 1,
      type: 'CLOSED',
      statement: '¿2 + 2?',
      explanation: null,
      correctAnswer: null,
      availableForSurvival: true,
      timeLimitSeconds: 30,
      options: [
        { text: '4', correct: true },
        { text: '5', correct: false },
      ],
    };

    service.createQuestion(body).subscribe();
    const req = http.expectOne(`${BASE}/questions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1 });
  });

  it('inicia una sesión, responde y finaliza', () => {
    const start: StartSessionRequest = { mode: 'SUPERVIVENCIA' };
    service.startSession(start).subscribe();
    let req = http.expectOne(`${BASE}/quiz/sessions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(start);
    req.flush({ id: 7, mode: 'SUPERVIVENCIA', status: 'IN_PROGRESS', questions: [] });

    const answer: AnswerRequest = { questionId: 1, selectedOptionId: 3, timeTakenMs: 1200 };
    service.answer(7, answer).subscribe();
    req = http.expectOne(`${BASE}/quiz/sessions/7/answers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(answer);
    req.flush({ correct: true });

    service.finishSession(7).subscribe();
    req = http.expectOne(`${BASE}/quiz/sessions/7/finish`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 7 });
  });

  it('consulta historial y ranking paginados', () => {
    service.history(0, 20).subscribe();
    let req = http.expectOne(`${BASE}/quiz/history?page=0&size=20`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });

    service.survivalLeaderboard(0, 20).subscribe();
    req = http.expectOne(`${BASE}/quiz/survival/leaderboard?page=0&size=20`);
    expect(req.request.method).toBe('GET');
    req.flush({
      table: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
      myRank: null,
      myBestScore: null,
    });
  });

  it('propaga el error cuando el backend falla', () => {
    let failed = false;
    service.subjects().subscribe({ error: () => (failed = true) });

    const req = http.expectOne(`${BASE}/subjects`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
