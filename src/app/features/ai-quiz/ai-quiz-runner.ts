import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { IconComponent } from '../../shared/ui/icon/icon';
import { SelectComponent, SelectOption } from '../../shared/ui/select/select';
import {
  AiQuizService,
  AiQuizDifficulty,
  AiQuizQuestion,
  AiQuizAnswerResponse,
  AiQuizResult,
} from './ai-quiz.service';

type QuizState = 'idle' | 'asking' | 'feedback' | 'results';

/** Runner del quiz generado por IA: flujo idle → asking → feedback → results. */
@Component({
  selector: 'eci-ai-quiz-runner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, CardComponent, ButtonComponent, IconComponent, SelectComponent],
  templateUrl: './ai-quiz-runner.html',
  styleUrl: '../../features/practica/practica.css',
})
export class AiQuizRunnerComponent {
  private readonly service = inject(AiQuizService);

  /** Emitido cuando el usuario quiere cerrar el runner desde la pantalla de resultados. */
  readonly finished = output<void>();

  protected readonly state = signal<QuizState>('idle');
  protected readonly loading = signal(false);

  // Configuración
  protected readonly topic = signal('');
  protected readonly numQuestions = signal(5);
  protected readonly difficulty = signal<AiQuizDifficulty>('medium');

  // Sesión activa
  protected readonly sessionId = signal<string | null>(null);
  protected readonly totalQuestions = signal(0);
  protected readonly currentQuestionIndex = signal(0);
  protected readonly question = signal<AiQuizQuestion | null>(null);

  // Respuesta en curso
  protected readonly selectedOption = signal<string | null>(null);
  protected readonly openAnswer = signal('');

  // Feedback
  protected readonly feedback = signal<AiQuizAnswerResponse | null>(null);

  // Resultados finales
  protected readonly results = signal<AiQuizResult | null>(null);

  protected readonly difficultyOptions: readonly SelectOption[] = [
    { value: 'easy',   label: 'aiQuiz.difficultyEasy' },
    { value: 'medium', label: 'aiQuiz.difficultyMedium' },
    { value: 'hard',   label: 'aiQuiz.difficultyHard' },
  ];

  protected readonly questionCountOptions: readonly SelectOption[] = [3, 5, 7, 10, 15].map(
    (n) => ({ value: n, label: String(n) }),
  );

  protected canStart(): boolean {
    return this.topic().trim().length > 0 && !this.loading();
  }

  protected startQuiz(): void {
    if (!this.canStart()) return;
    this.loading.set(true);
    this.service.startQuiz({
      topic: this.topic().trim(),
      numQuestions: this.numQuestions(),
      difficulty: this.difficulty(),
    }).subscribe({
      next: (res) => {
        this.sessionId.set(res.sessionId);
        this.totalQuestions.set(res.totalQuestions);
        this.currentQuestionIndex.set(res.currentQuestion ?? 1);
        this.question.set(res.question);
        this.selectedOption.set(null);
        this.openAnswer.set('');
        this.state.set('asking');
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected submitAnswer(): void {
    const sid = this.sessionId();
    if (!sid || this.loading()) return;
    const answer = this.question()?.type === 'closed'
      ? (this.selectedOption() ?? '')
      : this.openAnswer().trim();
    if (!answer) return;

    this.loading.set(true);
    this.service.answerQuestion({ sessionId: sid, answer }).subscribe({
      next: (res) => {
        this.feedback.set(res);
        this.loading.set(false);
        this.state.set('feedback');
      },
      error: () => this.loading.set(false),
    });
  }

  protected nextQuestion(): void {
    const fb = this.feedback();
    if (!fb) return;

    if (fb.isFinished) {
      this.loadResults();
      return;
    }

    if (fb.nextQuestion) {
      this.question.set(fb.nextQuestion);
      this.currentQuestionIndex.update((n) => n + 1);
      this.selectedOption.set(null);
      this.openAnswer.set('');
      this.feedback.set(null);
      this.state.set('asking');
    }
  }

  private loadResults(): void {
    const sid = this.sessionId();
    if (!sid) return;
    this.loading.set(true);
    this.service.getResult(sid).subscribe({
      next: (res) => {
        this.results.set(res);
        this.state.set('results');
        this.loading.set(false);
      },
      error: () => {
        this.state.set('results');
        this.loading.set(false);
      },
    });
  }

  protected resetQuiz(): void {
    this.state.set('idle');
    this.sessionId.set(null);
    this.question.set(null);
    this.feedback.set(null);
    this.results.set(null);
    this.selectedOption.set(null);
    this.openAnswer.set('');
  }

  protected onDifficulty(value: string | number | null): void {
    if (value) this.difficulty.set(value as AiQuizDifficulty);
  }

  protected onNumQuestions(value: string | number | null): void {
    if (value) this.numQuestions.set(Number(value));
  }
}
