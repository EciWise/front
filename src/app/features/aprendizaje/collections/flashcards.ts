import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { AprendizajeService } from '../aprendizaje.service';
import { Collection, Flashcard, FlashcardRequest } from '../study.models';

/** CRUD de las flash cards de una colección. */
@Component({
  selector: 'eci-aprendizaje-flashcards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent, IconComponent],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css',
})
export class FlashcardsComponent implements OnInit {
  private readonly service = inject(AprendizajeService);

  readonly collection = input.required<Collection>();
  readonly canModify = input(false);
  readonly back = output<void>();

  protected readonly cards = signal<Flashcard[]>([]);
  protected readonly loading = signal(false);

  protected readonly showForm = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly question = signal('');
  protected readonly answer = signal('');

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.flashcards(this.collection().id).subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.reset(null);
    this.showForm.set(true);
  }

  protected openEdit(card: Flashcard): void {
    this.editingId.set(card.id);
    this.title.set(card.title);
    this.description.set(card.description ?? '');
    this.question.set(card.question);
    this.answer.set(card.answer);
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
  }

  protected submit(): void {
    const body: FlashcardRequest = {
      title: this.title().trim(),
      description: this.description().trim() || null,
      question: this.question().trim(),
      answer: this.answer().trim(),
    };
    if (!body.title || !body.question || !body.answer) {
      return;
    }
    const id = this.editingId();
    const op = id
      ? this.service.updateFlashcard(id, body)
      : this.service.createFlashcard(this.collection().id, body);
    op.subscribe(() => {
      this.showForm.set(false);
      this.load();
    });
  }

  protected remove(card: Flashcard): void {
    this.service.deleteFlashcard(card.id).subscribe(() => this.load());
  }

  protected set(field: 'title' | 'description' | 'question' | 'answer', value: string): void {
    this[field].set(value);
  }

  private reset(card: Flashcard | null): void {
    this.editingId.set(card?.id ?? null);
    this.title.set(card?.title ?? '');
    this.description.set(card?.description ?? '');
    this.question.set(card?.question ?? '');
    this.answer.set(card?.answer ?? '');
  }
}
