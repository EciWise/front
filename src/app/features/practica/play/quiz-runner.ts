import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ConfettiComponent } from '../../../shared/ui/confetti/confetti';
import { PracticaService } from '../practica.service';
import { AnswerRequest, AnswerResult, SessionResponse, SessionSummary } from '../practica.models';

/** Bucle de juego: sirve preguntas, registra respuestas y muestra el resumen final. */
@Component({
  selector: 'eci-practica-quiz-runner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    TranslatePipe,
    CardComponent,
    ButtonComponent,
    IconComponent,
    ConfettiComponent,
  ],
  templateUrl: './quiz-runner.html',
  styleUrl: '../practica.css',
})
export class QuizRunnerComponent {
  private readonly service = inject(PracticaService);

  readonly session = input.required<SessionResponse>();
  readonly finished = output<void>();

  protected readonly index = signal(0);
  protected readonly selectedOptionId = signal<number | null>(null);
  protected readonly givenAnswer = signal('');
  protected readonly result = signal<AnswerResult | null>(null);
  protected readonly answering = signal(false);
  protected readonly finishing = signal(false);
  protected readonly summary = signal<SessionSummary | null>(null);
  protected readonly lives = signal<number | null>(null);

  private questionStart = 0;

  protected readonly questions = computed(() => this.session().questions);
  protected readonly total = computed(() => this.questions().length);
  protected readonly current = computed(() => this.questions()[this.index()] ?? null);
  protected readonly answered = computed(() => this.result() !== null);
  protected readonly isLast = computed(() => this.index() + 1 >= this.total());
  protected readonly isSurvival = computed(() => this.session().mode === 'SUPERVIVENCIA');
  /** La sesión terminó por el backend (p. ej. sin vidas en Supervivencia). */
  protected readonly sessionEnded = computed(
    () => this.result()?.status != null && this.result()?.status !== 'IN_PROGRESS',
  );

  constructor() {
    // Vidas iniciales del modo Supervivencia.
    effect(() => this.lives.set(this.session().livesRemaining));
    // Reinicia el cronómetro de respuesta al cambiar de pregunta.
    effect(() => {
      this.index();
      this.questionStart = performance.now();
    });
  }

  protected selectOption(id: number): void {
    if (this.answered()) {
      return;
    }
    this.selectedOptionId.set(id);
  }

  protected setBool(value: string): void {
    if (this.answered()) {
      return;
    }
    this.givenAnswer.set(value);
  }

  /** ¿Hay respuesta suficiente para enviar según el tipo de pregunta? */
  protected get hasInput(): boolean {
    const q = this.current();
    if (!q) {
      return false;
    }
    return q.type === 'CLOSED'
      ? this.selectedOptionId() != null
      : this.givenAnswer().trim().length > 0;
  }

  protected submit(): void {
    const q = this.current();
    if (!q || this.answering() || this.answered() || !this.hasInput) {
      return;
    }
    this.answering.set(true);
    const body: AnswerRequest = {
      questionId: q.id,
      selectedOptionId: q.type === 'CLOSED' ? this.selectedOptionId() : null,
      givenAnswer: q.type === 'CLOSED' ? null : this.givenAnswer().trim(),
      timeTakenMs: Math.max(0, Math.round(performance.now() - this.questionStart)),
    };
    this.service.answer(this.session().id, body).subscribe({
      next: (res) => {
        this.result.set(res);
        this.lives.set(res.livesRemaining);
        this.answering.set(false);
      },
      error: () => this.answering.set(false),
    });
  }

  protected next(): void {
    if (this.sessionEnded() || this.isLast()) {
      this.finish();
      return;
    }
    this.index.update((i) => i + 1);
    this.selectedOptionId.set(null);
    this.givenAnswer.set('');
    this.result.set(null);
  }

  protected leave(): void {
    this.finished.emit();
  }

  /** Clase visual de una opción una vez respondida (correcta / elegida-incorrecta). */
  protected optionClass(optionId: number): string {
    const res = this.result();
    if (!res) {
      return this.selectedOptionId() === optionId ? 'pr-option--selected' : '';
    }
    if (res.correctOptionId === optionId) {
      return 'pr-option--correct';
    }
    if (this.selectedOptionId() === optionId) {
      return 'pr-option--wrong';
    }
    return '';
  }

  /** Clase visual de un botón Verdadero/Falso (compara contra correctAnswer). */
  protected boolClass(value: string): string {
    const res = this.result();
    if (!res) {
      return this.givenAnswer() === value ? 'pr-option--selected' : '';
    }
    if (res.correctAnswer === value) {
      return 'pr-option--correct';
    }
    if (this.givenAnswer() === value) {
      return 'pr-option--wrong';
    }
    return '';
  }

  private finish(): void {
    if (this.finishing()) {
      return;
    }
    this.finishing.set(true);
    this.service.finishSession(this.session().id).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.finishing.set(false);
      },
      error: () => this.finishing.set(false),
    });
  }
}
