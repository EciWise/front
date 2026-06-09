import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { PracticaService } from '../practica.service';
import { Subject, SubjectRequest } from '../practica.models';

/** Gestión del catálogo de asignaturas (solo admin). */
@Component({
  selector: 'eci-practica-subjects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent, IconComponent],
  templateUrl: './subjects-admin.html',
  styleUrls: ['../practica.css', '../../../shared/styles/icon-btn.css'],
})
export class SubjectsAdminComponent {
  private readonly service = inject(PracticaService);

  protected readonly subjects = signal<Subject[]>([]);
  protected readonly loading = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly name = signal('');
  protected readonly description = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.subjects().subscribe({
      next: (list) => {
        this.subjects.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.name.set('');
    this.description.set('');
    this.showForm.set(true);
  }

  protected openEdit(s: Subject): void {
    this.editingId.set(s.id);
    this.name.set(s.name);
    this.description.set(s.description ?? '');
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
    const body: SubjectRequest = { name, description: this.description().trim() || null };
    const id = this.editingId();
    const op = id ? this.service.updateSubject(id, body) : this.service.createSubject(body);
    op.subscribe(() => {
      this.showForm.set(false);
      this.load();
    });
  }

  protected remove(s: Subject): void {
    this.service.deleteSubject(s.id).subscribe(() => this.load());
  }
}
