import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { AprendizajeService } from '../aprendizaje.service';
import { Collection, ReviewGrade, StudyCard } from '../study.models';
import { StudySessionComponent } from './study-session';

interface StudyHarness {
  readonly collections: SignalLike<Collection[]>;
  readonly selectedId: SignalLike<number | null>;
  readonly queue: SignalLike<StudyCard[]>;
  readonly index: SignalLike<number>;
  readonly revealed: () => boolean;
  readonly loading: SignalLike<boolean>;
  readonly grading: SignalLike<boolean>;
  readonly dragging: () => boolean;
  readonly dragX: SignalLike<number>;
  readonly dragY: SignalLike<number>;
  readonly intent: () => ReviewGrade | null;
  readonly cardTransform: () => string | null;
  readonly cardOpacity: () => number | null;
  readonly finished: () => boolean;
  select(id: number): void;
  reveal(): void;
  grade(grade: ReviewGrade): void;
  onPointerDown(event: PointerEvent): void;
  onPointerMove(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;
  restart(): void;
}

interface SignalLike<T> {
  (): T;
  set(value: T): void;
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
  const el = (): HTMLElement => fixture.nativeElement;

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

    el().querySelector<HTMLButtonElement>('.study-picker__card')!.click();
    fixture.detectChanges();

    expect(studyQueue).toHaveBeenCalledWith(1);
    expect(el().textContent).toContain('d/dx x^2');
  });

  it('muestra estado sin favoritas, loading y cola vacia seleccionada', () => {
    cmp().collections.set([collections[1]!]);
    fixture.detectChanges();

    expect(el().querySelector('.study-picker__card')).toBeNull();
    expect(el().querySelector('.study-msg')).not.toBeNull();

    cmp().collections.set(collections);
    cmp().selectedId.set(1);
    cmp().loading.set(true);
    fixture.detectChanges();

    expect(el().querySelector('.study-back')).not.toBeNull();
    expect(el().querySelector('.study-msg')?.textContent).not.toBe('');

    cmp().loading.set(false);
    cmp().queue.set([]);
    fixture.detectChanges();

    expect(el().querySelector('.study-done')).not.toBeNull();
    expect(el().querySelector('.study-done--celebrate')).toBeNull();
  });

  it('revela la respuesta, califica y avanza hasta completar la cola', () => {
    cmp().select(1);
    fixture.detectChanges();

    el().querySelector<HTMLButtonElement>('.study-actions button')!.click();
    fixture.detectChanges();

    expect(cmp().revealed()).toBe(true);
    expect(el().textContent).toContain('2x');
    expect(el().querySelectorAll<HTMLButtonElement>('.grade')).toHaveLength(3);

    el().querySelector<HTMLButtonElement>('.grade--aprendido')!.click();
    fixture.detectChanges();

    expect(review).toHaveBeenCalledWith(7, 'APRENDIDO');
    expect(cmp().index()).toBe(1);
    expect(cmp().grading()).toBe(false);
    expect(cmp().finished()).toBe(true);
    expect(el().querySelector('.study-done--celebrate')).not.toBeNull();
    expect(el().querySelectorAll('.confetti__piece')).toHaveLength(90);
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

  it('ignora calificaciones sin tarjeta o durante guardado', () => {
    review.mockClear();
    cmp().queue.set([]);

    cmp().grade('APRENDIDO');
    expect(review).not.toHaveBeenCalled();

    cmp().queue.set(queue);
    cmp().grading.set(true);
    cmp().grade('APRENDIDO');
    expect(review).not.toHaveBeenCalled();
  });

  it('resuelve gestos de arrastre para repetir, aceptable y arrastres cortos', () => {
    const target = document.createElement('div');
    Object.defineProperty(target, 'setPointerCapture', { configurable: true, value: vi.fn() });
    const pointer = (event: Partial<PointerEvent>) =>
      ({
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        target,
        ...event,
      }) as PointerEvent;

    cmp().select(1);
    fixture.detectChanges();

    cmp().onPointerDown(pointer({ clientX: 10, clientY: 10 }));
    expect(cmp().dragging()).toBe(false);

    cmp().reveal();
    cmp().onPointerDown(pointer({ clientX: 100, clientY: 100 }));
    cmp().onPointerMove(pointer({ pointerId: 99, clientX: 0, clientY: 0 }));
    expect(cmp().dragX()).toBe(0);

    cmp().onPointerMove(pointer({ clientX: -20, clientY: 120 }));
    fixture.detectChanges();

    expect(cmp().intent()).toBe('REPETIR');
    expect(cmp().cardTransform()).toContain('translate');
    expect(cmp().cardOpacity()).toBeLessThan(1);
    expect(el().querySelector('.flashcard--repetir')).not.toBeNull();

    cmp().onPointerUp(pointer({ clientX: -20, clientY: 120 }));
    expect(review).toHaveBeenCalledWith(7, 'REPETIR');

    review.mockClear();
    cmp().queue.set(queue);
    cmp().index.set(0);
    cmp().reveal();
    cmp().onPointerDown(pointer({ clientX: 100, clientY: 100 }));
    cmp().onPointerMove(pointer({ clientX: 120, clientY: 230 }));
    expect(cmp().intent()).toBe('ACEPTABLE');
    cmp().onPointerUp(pointer({ clientX: 120, clientY: 230 }));
    expect(review).toHaveBeenCalledWith(7, 'ACEPTABLE');

    review.mockClear();
    cmp().queue.set(queue);
    cmp().index.set(0);
    cmp().reveal();
    cmp().onPointerDown(pointer({ clientX: 100, clientY: 100 }));
    cmp().onPointerMove(pointer({ clientX: 130, clientY: 120 }));
    expect(cmp().intent()).toBeNull();
    cmp().onPointerUp(pointer({ clientX: 130, clientY: 120 }));
    expect(review).not.toHaveBeenCalled();
    expect(cmp().dragging()).toBe(false);
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
