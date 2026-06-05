import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { AprendizajeService } from '../aprendizaje.service';
import { Collection, ReviewGrade, StudyCard } from '../study.models';
import { StudySessionComponent } from './study-session';

interface StudyHarness {
  readonly index: () => number;
  readonly revealed: () => boolean;
  readonly grading: () => boolean;
  readonly finished: () => boolean;
  select(id: number): void;
  reveal(): void;
  grade(grade: ReviewGrade): void;
  restart(): void;
}

const author = {
  externalId: 'u1',
  email: 'ana@test.com',
  firstName: 'Ana',
  lastName: 'Diaz',
  role: 'STUDENT',
};

const collections: Collection[] = [
  {
    id: 1,
    name: 'Calculo',
    visibility: 'PUBLIC',
    author,
    flashcardCount: 1,
    favorite: true,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Sin fijar',
    visibility: 'PUBLIC',
    author,
    flashcardCount: 4,
    favorite: false,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

const queue: StudyCard[] = [
  {
    card: {
      id: 7,
      collectionId: 1,
      title: 'Derivadas',
      description: null,
      question: 'd/dx x^2',
      answer: '2x',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    },
    state: null,
    dueAt: null,
  },
];

describe('StudySessionComponent', () => {
  let fixture: ComponentFixture<StudySessionComponent>;
  let studyQueue: ReturnType<typeof vi.fn>;
  let review: ReturnType<typeof vi.fn>;

  const cmp = (): StudyHarness => fixture.componentInstance as unknown as StudyHarness;
  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    studyQueue = vi.fn(() => of(queue));
    review = vi.fn(() =>
      of({
        flashcardId: 7,
        state: 'APRENDIDO',
        repetitions: 1,
        intervalDays: 2,
        easeFactor: 2.5,
        lapses: 0,
        dueAt: '2026-06-03T00:00:00Z',
        lastReviewedAt: null,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [StudySessionComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: AprendizajeService,
          useValue: {
            collections: vi.fn(() => of(collections)),
            studyQueue,
            review,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudySessionComponent);
    fixture.detectChanges();
  });

  it('muestra solo colecciones favoritas y carga su cola al seleccionar', () => {
    expect(el().querySelectorAll('.study-picker__card').length).toBe(1);
    expect(el().textContent).toContain('Calculo');
    expect(el().textContent).not.toContain('Sin fijar');

    (el().querySelector('.study-picker__card') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(studyQueue).toHaveBeenCalledWith(1);
    expect(el().textContent).toContain('d/dx x^2');
  });

  it('revela la respuesta, califica y avanza hasta completar la cola', () => {
    cmp().select(1);
    fixture.detectChanges();

    cmp().reveal();
    fixture.detectChanges();

    expect(cmp().revealed()).toBe(true);
    expect(el().textContent).toContain('2x');

    cmp().grade('APRENDIDO');

    expect(review).toHaveBeenCalledWith(7, 'APRENDIDO');
    expect(cmp().index()).toBe(1);
    expect(cmp().grading()).toBe(false);
    expect(cmp().finished()).toBe(true);
  });

  it('si falla la calificacion conserva la tarjeta actual y limpia el estado de guardado', () => {
    review.mockReturnValue(throwError(() => new Error('review failed')));
    cmp().select(1);
    cmp().reveal();

    cmp().grade('REPETIR');

    expect(review).toHaveBeenCalledWith(7, 'REPETIR');
    expect(cmp().index()).toBe(0);
    expect(cmp().grading()).toBe(false);
    expect(cmp().revealed()).toBe(true);
  });

  it('restart vuelve al selector de colecciones', () => {
    cmp().select(1);
    cmp().restart();
    fixture.detectChanges();

    expect(cmp().index()).toBe(0);
    expect(cmp().revealed()).toBe(false);
    expect(el().querySelector('.study-picker__card')).not.toBeNull();
  });
});
