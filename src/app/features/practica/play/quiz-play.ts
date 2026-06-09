import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { PracticaService } from '../practica.service';
import {
  QuestionCollection,
  QuizMode,
  SessionResponse,
  StartSessionRequest,
  Subject,
} from '../practica.models';
import { QuizRunnerComponent } from './quiz-runner';

/** Configuración e inicio de una sesión de quiz (Parcial / Repaso / Supervivencia). */
@Component({
  selector: 'eci-practica-play',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    CardComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    QuizRunnerComponent,
  ],
  templateUrl: './quiz-play.html',
  styleUrl: '../practica.css',
})
export class QuizPlayComponent {
  private readonly service = inject(PracticaService);

  protected readonly subjects = signal<Subject[]>([]);
  protected readonly collections = signal<QuestionCollection[]>([]);
  protected readonly mode = signal<QuizMode | null>(null);
  protected readonly starting = signal(false);
  protected readonly session = signal<SessionResponse | null>(null);

  // Parámetros por modo.
  protected readonly subjectId = signal<number | null>(null);
  protected readonly corte = signal<number>(1);
  protected readonly collectionId = signal<number | null>(null);
  protected readonly daysUntilExam = signal(7);
  protected readonly preparedness = signal(3);
  protected readonly targetGrade = signal(4);

  protected readonly modes: readonly { id: QuizMode; icon: 'chart' | 'repeat' | 'flame' }[] = [
    { id: 'PARCIAL', icon: 'chart' },
    { id: 'REPASO', icon: 'repeat' },
    { id: 'SUPERVIVENCIA', icon: 'flame' },
  ];

  protected readonly subjectOptions = computed<readonly SelectOption[]>(() =>
    this.subjects().map((s) => ({ value: s.id, label: s.name })),
  );
  protected readonly collectionOptions = computed<readonly SelectOption[]>(() =>
    this.collections().map((c) => ({ value: c.id, label: c.name })),
  );
  protected readonly corteOptions: readonly SelectOption[] = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];

  /** El botón de iniciar se habilita cuando el modo tiene sus datos mínimos. */
  protected readonly canStart = computed(() => {
    switch (this.mode()) {
      case 'PARCIAL':
        return this.subjectId() != null;
      case 'REPASO':
        return this.collectionId() != null;
      case 'SUPERVIVENCIA':
        return true;
      default:
        return false;
    }
  });

  constructor() {
    this.service.subjects().subscribe((list) => this.subjects.set(list));
    this.service.questionCollections().subscribe((list) => this.collections.set(list));
  }

  protected pickMode(mode: QuizMode): void {
    this.mode.set(mode);
  }

  protected start(): void {
    const mode = this.mode();
    if (!mode || !this.canStart() || this.starting()) {
      return;
    }
    this.starting.set(true);
    this.service.startSession(this.buildRequest(mode)).subscribe({
      next: (session) => {
        this.session.set(session);
        this.starting.set(false);
      },
      error: () => this.starting.set(false),
    });
  }

  protected onFinished(): void {
    this.session.set(null);
    this.mode.set(null);
  }

  private buildRequest(mode: QuizMode): StartSessionRequest {
    if (mode === 'PARCIAL') {
      return {
        mode,
        subjectId: this.subjectId(),
        corte: this.corte(),
        parcial: {
          daysUntilExam: this.daysUntilExam(),
          preparedness: this.preparedness(),
          targetGrade: this.targetGrade(),
        },
      };
    }
    if (mode === 'REPASO') {
      return { mode, collectionId: this.collectionId() };
    }
    return { mode };
  }

  protected onSubject(value: SelectValue): void {
    this.subjectId.set(value == null || value === '' ? null : Number(value));
  }

  protected onCollection(value: SelectValue): void {
    this.collectionId.set(value == null || value === '' ? null : Number(value));
  }

  protected onCorte(value: SelectValue): void {
    this.corte.set(Number(value));
  }
}
