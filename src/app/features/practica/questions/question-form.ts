import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { OptionRequest, Question, QuestionRequest, QuestionType } from '../practica.models';

interface OptionDraft {
  text: string;
  correct: boolean;
}

const DEFAULT_TIME = 30;

/** Formulario de alta/edición de una pregunta (adaptado al tipo). */
@Component({
  selector: 'eci-practica-question-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent, IconComponent, SelectComponent],
  templateUrl: './question-form.html',
  styleUrl: '../practica.css',
})
export class QuestionFormComponent {
  /** Asignatura y corte del filtro activo (contexto del alta). */
  readonly subjectId = input.required<number>();
  readonly corte = input.required<number>();
  /** Pregunta a editar, o null para crear. */
  readonly editing = input<Question | null>(null);

  readonly save = output<QuestionRequest>();
  readonly cancelForm = output<void>();

  protected readonly type = signal<QuestionType>('CLOSED');
  protected readonly statement = signal('');
  protected readonly explanation = signal('');
  protected readonly correctAnswer = signal('');
  protected readonly availableForSurvival = signal(true);
  protected readonly timeLimitSeconds = signal(DEFAULT_TIME);
  protected readonly options = signal<OptionDraft[]>([
    { text: '', correct: true },
    { text: '', correct: false },
  ]);

  protected readonly typeOptions: readonly SelectOption[] = [
    { value: 'CLOSED', labelKey: 'practica.questions.type.CLOSED' },
    { value: 'OPEN', labelKey: 'practica.questions.type.OPEN' },
    { value: 'TRUE_FALSE', labelKey: 'practica.questions.type.TRUE_FALSE' },
  ];

  protected readonly boolOptions: readonly SelectOption[] = [
    { value: 'true', labelKey: 'practica.questions.true' },
    { value: 'false', labelKey: 'practica.questions.false' },
  ];

  protected readonly isClosed = computed(() => this.type() === 'CLOSED');
  protected readonly isTrueFalse = computed(() => this.type() === 'TRUE_FALSE');

  constructor() {
    effect(() => this.hydrate(this.editing()));
  }

  /** Carga los campos desde la pregunta en edición (o resetea para crear). */
  private hydrate(q: Question | null): void {
    this.type.set(q?.type ?? 'CLOSED');
    this.statement.set(q?.statement ?? '');
    this.explanation.set(q?.explanation ?? '');
    this.correctAnswer.set(q?.correctAnswer ?? '');
    this.availableForSurvival.set(q?.availableForSurvival ?? true);
    this.timeLimitSeconds.set(q?.timeLimitSeconds ?? DEFAULT_TIME);
    this.options.set(
      q && q.options.length
        ? q.options.map((o) => ({ text: o.text, correct: o.correct }))
        : [
            { text: '', correct: true },
            { text: '', correct: false },
          ],
    );
  }

  protected onType(value: SelectValue): void {
    this.type.set(value as QuestionType);
  }

  protected addOption(): void {
    this.options.update((list) => [...list, { text: '', correct: false }]);
  }

  protected removeOption(index: number): void {
    this.options.update((list) => list.filter((_, i) => i !== index));
  }

  protected setOptionText(index: number, text: string): void {
    this.options.update((list) => list.map((o, i) => (i === index ? { ...o, text } : o)));
  }

  protected toggleOptionCorrect(index: number): void {
    this.options.update((list) =>
      list.map((o, i) => (i === index ? { ...o, correct: !o.correct } : o)),
    );
  }

  protected submit(): void {
    const statement = this.statement().trim();
    if (!statement) {
      return;
    }
    this.save.emit({
      subjectId: this.subjectId(),
      corte: this.corte(),
      type: this.type(),
      statement,
      explanation: this.explanation().trim() || null,
      correctAnswer: this.isClosed() ? null : this.correctAnswer().trim() || null,
      availableForSurvival: this.availableForSurvival(),
      timeLimitSeconds: this.timeLimitSeconds(),
      options: this.isClosed() ? this.buildOptions() : null,
    });
  }

  private buildOptions(): readonly OptionRequest[] {
    return this.options()
      .filter((o) => o.text.trim())
      .map((o) => ({ text: o.text.trim(), correct: o.correct }));
  }
}
