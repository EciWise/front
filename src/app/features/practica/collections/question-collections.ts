import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { PracticaService } from '../practica.service';
import {
  Question,
  QuestionCollection,
  QuestionCollectionRequest,
  Subject,
} from '../practica.models';

/**
 * Gestión de colecciones de preguntas para el modo Repaso. El backend no devuelve
 * las preguntas incluidas, así que al editar se vuelve a elegir el conjunto.
 */
@Component({
  selector: 'eci-practica-question-collections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent, IconComponent, SelectComponent],
  templateUrl: './question-collections.html',
  styleUrls: ['../practica.css', '../../../shared/styles/icon-btn.css'],
})
export class QuestionCollectionsComponent {
  private readonly service = inject(PracticaService);

  protected readonly collections = signal<QuestionCollection[]>([]);
  protected readonly subjects = signal<Subject[]>([]);
  protected readonly loading = signal(false);

  protected readonly showForm = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly formSubjectId = signal<number | null>(null);
  protected readonly pickQuestions = signal<Question[]>([]);
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());

  protected readonly subjectOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'practica.collections.noSubject' },
    ...this.subjects().map((s) => ({ value: s.id, label: s.name })),
  ]);

  constructor() {
    this.service.subjects().subscribe((list) => this.subjects.set(list));
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.questionCollections().subscribe({
      next: (list) => {
        this.collections.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.reset();
    this.showForm.set(true);
  }

  protected openEdit(c: QuestionCollection): void {
    this.editingId.set(c.id);
    this.name.set(c.name);
    this.description.set(c.description ?? '');
    this.selectedIds.set(new Set());
    this.formSubjectId.set(c.subjectId);
    this.loadPickQuestions(c.subjectId);
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
  }

  protected onFormSubject(value: SelectValue): void {
    const id = value === '' || value == null ? null : Number(value);
    this.formSubjectId.set(id);
    this.selectedIds.set(new Set());
    this.loadPickQuestions(id);
  }

  protected isPicked(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected togglePick(id: number): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected submit(): void {
    const name = this.name().trim();
    if (!name) {
      return;
    }
    const body: QuestionCollectionRequest = {
      name,
      description: this.description().trim() || null,
      subjectId: this.formSubjectId(),
      questionIds: [...this.selectedIds()],
    };
    const id = this.editingId();
    const op = id
      ? this.service.updateQuestionCollection(id, body)
      : this.service.createQuestionCollection(body);
    op.subscribe(() => {
      this.showForm.set(false);
      this.load();
    });
  }

  protected remove(c: QuestionCollection): void {
    this.service.deleteQuestionCollection(c.id).subscribe(() => this.load());
  }

  private reset(): void {
    this.name.set('');
    this.description.set('');
    this.formSubjectId.set(null);
    this.pickQuestions.set([]);
    this.selectedIds.set(new Set());
  }

  private loadPickQuestions(subjectId: number | null): void {
    if (subjectId == null) {
      this.pickQuestions.set([]);
      return;
    }
    this.service.questions(subjectId).subscribe((list) => this.pickQuestions.set(list));
  }
}
