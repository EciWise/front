import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { PracticaService } from '../practica.service';
import { Question, QuestionRequest, QuestionStats, Subject } from '../practica.models';
import { QuestionFormComponent } from './question-form';

/** Gestión del banco de preguntas por asignatura y corte (tutor/admin). */
@Component({
  selector: 'eci-practica-questions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    CardComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    QuestionFormComponent,
  ],
  templateUrl: './questions-admin.html',
  styleUrls: ['../practica.css', '../../../shared/styles/icon-btn.css'],
})
export class QuestionsAdminComponent {
  private readonly service = inject(PracticaService);

  protected readonly subjects = signal<Subject[]>([]);
  protected readonly subjectId = signal<number | null>(null);
  protected readonly corte = signal<number | null>(null);
  protected readonly questions = signal<Question[]>([]);
  protected readonly loading = signal(false);

  protected readonly showForm = signal(false);
  protected readonly editing = signal<Question | null>(null);

  protected readonly statsFor = signal<number | null>(null);
  protected readonly stats = signal<QuestionStats | null>(null);

  /** Corte concreto para el alta (el filtro puede estar en "todos"). */
  protected readonly formCorte = computed(() => this.corte() ?? 1);

  protected readonly subjectOptions = computed<readonly SelectOption[]>(() =>
    this.subjects().map((s) => ({ value: s.id, label: s.name })),
  );

  protected readonly corteOptions: readonly SelectOption[] = [
    { value: '', labelKey: 'practica.questions.allCortes' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];

  constructor() {
    this.service.subjects().subscribe((list) => {
      this.subjects.set(list);
      if (list.length) {
        this.subjectId.set(list[0].id);
        this.loadQuestions();
      }
    });
  }

  protected onSubject(value: SelectValue): void {
    this.subjectId.set(value == null || value === '' ? null : Number(value));
    this.closeForm();
    this.loadQuestions();
  }

  protected onCorte(value: SelectValue): void {
    this.corte.set(value === '' || value == null ? null : Number(value));
    this.loadQuestions();
  }

  protected loadQuestions(): void {
    const subjectId = this.subjectId();
    if (subjectId == null) {
      this.questions.set([]);
      return;
    }
    this.loading.set(true);
    this.service.questions(subjectId, this.corte()).subscribe({
      next: (list) => {
        this.questions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(q: Question): void {
    this.editing.set(q);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected onSave(body: QuestionRequest): void {
    const editing = this.editing();
    const op = editing
      ? this.service.updateQuestion(editing.id, body)
      : this.service.createQuestion(body);
    op.subscribe(() => {
      this.closeForm();
      this.loadQuestions();
    });
  }

  protected remove(q: Question): void {
    this.service.deleteQuestion(q.id).subscribe(() => this.loadQuestions());
  }

  protected toggleStats(q: Question): void {
    if (this.statsFor() === q.id) {
      this.statsFor.set(null);
      this.stats.set(null);
      return;
    }
    this.statsFor.set(q.id);
    this.stats.set(null);
    this.service.questionStats(q.id).subscribe((s) => this.stats.set(s));
  }

  protected accuracy(s: QuestionStats): number {
    return Math.round(s.correctRate * 100);
  }
}
