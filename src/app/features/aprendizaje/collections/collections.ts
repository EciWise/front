import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { AprendizajeService } from '../aprendizaje.service';
import { Collection, CollectionRequest, Visibility } from '../study.models';
import { FlashcardsComponent } from './flashcards';

/** Gestión de colecciones de flash cards (listar, crear, editar, borrar). */
@Component({
  selector: 'eci-aprendizaje-collections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    CardComponent,
    ButtonComponent,
    IconComponent,
    InfoTooltipComponent,
    FlashcardsComponent,
  ],
  templateUrl: './collections.html',
  styleUrls: ['./collections.css', '../../../shared/styles/icon-btn.css'],
})
export class CollectionsComponent {
  private readonly service = inject(AprendizajeService);
  private readonly auth = inject(AuthService);

  protected readonly collections = signal<Collection[]>([]);
  protected readonly loading = signal(false);
  protected readonly selected = signal<Collection | null>(null);

  protected readonly editingId = signal<number | null>(null);
  protected readonly showForm = signal(false);
  protected readonly name = signal('');
  protected readonly visibility = signal<Visibility>('PRIVATE');
  protected readonly query = signal('');

  protected readonly isStudent = computed(() => this.auth.role() === Role.Student);

  /**
   * Colecciones filtradas por coincidencia parcial (sin distinguir mayúsculas)
   * y ordenadas con las favoritas primero (orden estable para el resto).
   */
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const base = q
      ? this.collections().filter((c) => c.name.toLocaleLowerCase().includes(q))
      : this.collections();
    return [...base].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite));
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.collections().subscribe({
      next: (cols) => {
        this.collections.set(cols);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected canModify(c: Collection): boolean {
    return this.auth.role() === Role.Admin || c.author.externalId === this.auth.user()?.id;
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.name.set('');
    this.visibility.set('PRIVATE');
    this.showForm.set(true);
  }

  protected openEdit(c: Collection): void {
    this.editingId.set(c.id);
    this.name.set(c.name);
    this.visibility.set(c.visibility);
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
  }

  protected submit(): void {
    const name = this.name().trim();
    if (!name) {
      return;
    }
    const body: CollectionRequest = {
      name,
      visibility: this.isStudent() ? 'PRIVATE' : this.visibility(),
    };
    const id = this.editingId();
    const op = id ? this.service.updateCollection(id, body) : this.service.createCollection(body);
    op.subscribe(() => {
      this.showForm.set(false);
      this.load();
    });
  }

  protected remove(c: Collection): void {
    this.service.deleteCollection(c.id).subscribe(() => this.load());
  }

  /** Fija/desfija la colección con actualización optimista (revierte si falla). */
  protected toggleFavorite(c: Collection): void {
    const next = !c.favorite;
    this.patchFavorite(c.id, next);
    this.service.setFavorite(c.id, next).subscribe({
      error: () => this.patchFavorite(c.id, !next),
    });
  }

  private patchFavorite(id: number, favorite: boolean): void {
    this.collections.update((list) =>
      list.map((c) => (c.id === id ? { ...c, favorite } : c)),
    );
  }

  protected onName(value: string): void {
    this.name.set(value);
  }

  protected onVisibility(value: string): void {
    this.visibility.set(value === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
  }

  /** Nombre legible del autor con fallbacks (nombre → email → id externo). */
  protected authorName(c: Collection): string {
    const a = c.author;
    const full = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
    return full || a.email || a.externalId;
  }
}
