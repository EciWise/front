import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../../../shared/ui/card/card';
import { ButtonComponent } from '../../../../../shared/ui/button/button';
import { ModalComponent } from '../../../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../../../shared/ui/select/select';
import { IconComponent } from '../../../../../shared/ui/icon/icon';
import { ForumsService } from '../../forums.service';
import { CreateForumRequest, Forum } from '../../community.models';
import { ReportButtonComponent } from '../report-button/report-button.component';

@Component({
  selector: 'eci-forums-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    ModalComponent,
    SelectComponent,
    IconComponent,
    ReportButtonComponent,
  ],
  templateUrl: './forums-list.component.html',
  styleUrl: './forums-list.component.css',
})
export class ForumsListComponent {
  private readonly forumsService = inject(ForumsService);

  readonly forumSelect = output<Forum>();

  protected readonly forums = signal<Forum[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly materiaOptions = signal<SelectOption[]>([]);

  protected readonly showCreateModal = signal(false);
  protected readonly creating = signal(false);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly materia = signal('');

  protected readonly canSubmit = computed(
    () => this.title().trim().length > 0 && this.materia() !== '',
  );

  constructor() {
    this.forumsService.listForums().subscribe({
      next: (forums) => {
        this.forums.set(forums);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });

    this.forumsService.listMaterias().subscribe({
      next: (materias) =>
        this.materiaOptions.set(materias.map((m) => ({ value: m.id, label: m.nombre }))),
      error: () => {},
    });
  }

  protected openCreateModal(): void {
    this.title.set('');
    this.description.set('');
    this.materia.set('');
    this.showCreateModal.set(true);
  }

  protected setMateria(val: SelectValue): void {
    this.materia.set(val != null ? String(val) : '');
  }

  protected submitCreate(): void {
    if (!this.canSubmit() || this.creating()) return;
    this.creating.set(true);
    const req: CreateForumRequest = {
      title: this.title().trim(),
      materia: this.materia(),
      description: this.description().trim() || null,
    };
    this.forumsService.createForum(req).subscribe({
      next: (forum) => {
        this.forums.update((list) => [forum, ...list]);
        this.creating.set(false);
        this.showCreateModal.set(false);
      },
      error: () => {
        this.creating.set(false);
        this.error.set(true);
      },
    });
  }

  protected selectForum(forum: Forum): void {
    this.forumSelect.emit(forum);
  }
}
