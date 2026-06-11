import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { Conversation, DirectoryUser, Message } from '../../chat/chat.models';
import { TalkApiService } from '../../chat/talk-api.service';
import { UsersDirectoryService } from '../../chat/users-directory.service';

@Component({
  selector: 'eci-forums',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, PageHeaderComponent, CardComponent, ButtonComponent, IconComponent],
  templateUrl: './forums.html',
  styleUrl: './forums.css',
})
export class ForumsComponent {
  private readonly api = inject(TalkApiService);
  private readonly directory = inject(UsersDirectoryService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly messagesLoading = signal(false);
  protected readonly creating = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal(false);
  protected readonly forums = signal<Conversation[]>([]);
  protected readonly activeId = signal<string | null>(null);
  protected readonly messages = signal<Message[]>([]);
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly search = signal('');
  protected readonly directoryResults = signal<DirectoryUser[]>([]);
  protected readonly selected = signal<DirectoryUser[]>([]);
  protected readonly draft = signal('');

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly activeForum = computed(
    () => this.forums().find((forum) => forum.id === this.activeId()) ?? null,
  );

  constructor() {
    this.loadForums();
    this.searchUsers('');
  }

  protected openForum(forum: Conversation): void {
    this.activeId.set(forum.id);
    this.messagesLoading.set(true);
    this.api.listMessages(forum.id).subscribe({
      next: (page) => {
        this.messages.set(page.content);
        this.messagesLoading.set(false);
      },
      error: () => {
        this.messages.set([]);
        this.messagesLoading.set(false);
        this.error.set(true);
      },
    });
  }

  protected onUserSearch(value: string): void {
    this.search.set(value);
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => this.searchUsers(value), 250);
  }

  protected isSelected(user: DirectoryUser): boolean {
    return this.selected().some((item) => item.id === user.id);
  }

  protected toggleUser(user: DirectoryUser): void {
    if (this.isSelected(user)) {
      this.selected.update((users) => users.filter((item) => item.id !== user.id));
      return;
    }
    this.selected.update((users) => [...users, user]);
  }

  protected createForum(): void {
    const title = this.name().trim();
    if (!title || this.selected().length === 0 || this.creating()) {
      return;
    }
    this.creating.set(true);
    this.error.set(false);
    this.api
      .createConversation({
        type: 'GROUP',
        name: title,
        description: this.description().trim() || null,
        anonymous: false,
        participants: this.selected().map((user) => ({
          userId: user.id,
          userName: user.name,
          userRol: user.rol,
        })),
      })
      .subscribe({
        next: (forum) => {
          this.forums.update((forums) => [forum, ...forums.filter((item) => item.id !== forum.id)]);
          this.name.set('');
          this.description.set('');
          this.selected.set([]);
          this.creating.set(false);
          this.openForum(forum);
        },
        error: () => {
          this.creating.set(false);
          this.error.set(true);
        },
      });
  }

  protected send(): void {
    const forum = this.activeForum();
    const content = this.draft().trim();
    if (!forum || !content || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.api.sendMessage(forum.id, { content }).subscribe({
      next: (message) => {
        this.messages.update((messages) => [...messages, message]);
        this.draft.set('');
        this.sending.set(false);
      },
      error: () => {
        this.sending.set(false);
        this.error.set(true);
      },
    });
  }

  protected mine(message: Message): boolean {
    return message.senderId === this.auth.user()?.id;
  }

  protected time(iso: string): string {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private loadForums(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.listConversations().subscribe({
      next: (conversations) => {
        const forums = conversations.filter((conversation) => conversation.type === 'GROUP');
        this.forums.set(forums);
        this.loading.set(false);
        if (forums.length > 0 && !this.activeId()) {
          this.openForum(forums[0]);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private searchUsers(term: string): void {
    const currentUserId = this.auth.user()?.id;
    this.directory.search(term).subscribe({
      next: (users) =>
        this.directoryResults.set(users.filter((user) => user.id !== currentUserId)),
      error: () => this.directoryResults.set([]),
    });
  }
}
