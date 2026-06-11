import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideArrowLeft, LucideCheck, LucideSearch, LucideX } from '@lucide/angular';
import { roleLabelKey as roleLabelKeyFor } from '../../../core/models/role.enum';
import { ChatService } from '../chat.service';
import { DirectoryUser } from '../chat.models';
import { UsersDirectoryService } from '../users-directory.service';

type NewType = 'INDIVIDUAL' | 'GROUP';

/** Alta de chat individual o grupo, con selector de participantes del directorio. */
@Component({
  selector: 'eci-new-conversation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, LucideArrowLeft, LucideCheck, LucideSearch, LucideX],
  templateUrl: './new-conversation.html',
  styleUrl: './new-conversation.css',
})
export class NewConversationComponent {
  protected readonly chat = inject(ChatService);
  private readonly directory = inject(UsersDirectoryService);

  protected readonly type = signal<NewType>('INDIVIDUAL');
  protected readonly name = signal('');
  protected readonly anonymous = signal(false);
  protected readonly term = signal('');
  protected readonly results = signal<DirectoryUser[]>([]);
  protected readonly selected = signal<DirectoryUser[]>([]);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly canCreate = computed(() => {
    if (this.type() === 'GROUP') {
      return this.name().trim().length > 0 && this.selected().length > 0;
    }
    return this.selected().length === 1;
  });

  protected setType(value: NewType): void {
    this.type.set(value);
    if (value === 'INDIVIDUAL') {
      this.selected.update((list) => list.slice(0, 1));
    }
  }

  protected onSearch(value: string): void {
    this.term.set(value);
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.directory.search(value).subscribe({
        next: (users) => this.results.set(users.filter((u) => u.id !== this.chat.currentUserId())),
        error: () => this.results.set([]),
      });
    }, 300);
  }

  protected isSelected(user: DirectoryUser): boolean {
    return this.selected().some((u) => u.id === user.id);
  }

  protected toggle(user: DirectoryUser): void {
    if (this.isSelected(user)) {
      this.selected.update((list) => list.filter((u) => u.id !== user.id));
      return;
    }
    if (this.type() === 'INDIVIDUAL') {
      this.selected.set([user]);
    } else {
      this.selected.update((list) => [...list, user]);
    }
  }

  protected roleLabelKey(rol: string): string {
    return roleLabelKeyFor(rol);
  }

  protected create(): void {
    if (!this.canCreate()) {
      return;
    }
    if (this.type() === 'GROUP') {
      this.chat.createGroup(this.name().trim(), this.selected(), this.anonymous());
    } else {
      this.chat.createIndividual(this.selected()[0]);
    }
  }
}
