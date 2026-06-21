import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../../../shared/ui/card/card';
import { ButtonComponent } from '../../../../../shared/ui/button/button';
import { ModalComponent } from '../../../../../shared/ui/modal/modal';
import { IconComponent } from '../../../../../shared/ui/icon/icon';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ForumsService } from '../../forums.service';
import { ThreadsService } from '../../threads.service';
import { CreateThreadRequest, ForumDetail, Thread } from '../../community.models';
import { ReportButtonComponent } from '../report-button/report-button.component';

@Component({
  selector: 'eci-forum-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslatePipe,
    CardComponent,
    ButtonComponent,
    ModalComponent,
    IconComponent,
    ReportButtonComponent,
  ],
  templateUrl: './forum-detail.component.html',
  styleUrl: './forum-detail.component.css',
})
export class ForumDetailComponent {
  private readonly forumsService = inject(ForumsService);
  private readonly threadsService = inject(ThreadsService);
  private readonly auth = inject(AuthService);

  readonly forumId = input.required<string>();
  readonly back = output<void>();

  protected readonly forum = signal<ForumDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly closing = signal(false);

  protected readonly showThreadModal = signal(false);
  protected readonly threadTitle = signal('');
  protected readonly threadContent = signal('');
  protected readonly creating = signal(false);

  protected readonly isCreator = computed(
    () => !!this.auth.user() && this.auth.user()?.id === this.forum()?.authorId,
  );

  protected readonly canSubmitThread = computed(
    () => this.threadTitle().trim().length > 0 && this.threadContent().trim().length > 0,
  );

  constructor() {
    effect(() => {
      this.loadForum(this.forumId());
    });
  }

  protected goBack(): void {
    this.back.emit();
  }

  protected likeForum(): void {
    const forum = this.forum();
    if (!forum) return;
    const wasLiked = forum.likedByMe;
    this.forum.update((f) =>
      f ? { ...f, likedByMe: !wasLiked, likesCount: f.likesCount + (wasLiked ? -1 : 1) } : null,
    );
    this.forumsService.likeForum(forum.id).subscribe({
      error: () =>
        this.forum.update((f) =>
          f ? { ...f, likedByMe: wasLiked, likesCount: f.likesCount + (wasLiked ? 1 : -1) } : null,
        ),
    });
  }

  protected closeForum(): void {
    const forum = this.forum();
    if (!forum || this.closing()) return;
    this.closing.set(true);
    this.forumsService.closeForum(forum.id).subscribe({
      next: () => {
        this.forum.update((f) => (f ? { ...f, closed: true } : null));
        this.closing.set(false);
      },
      error: () => this.closing.set(false),
    });
  }

  protected likeThread(thread: Thread): void {
    const wasLiked = thread.likedByMe;
    const toggle = (t: Thread): Thread =>
      t.id === thread.id
        ? { ...t, likedByMe: !wasLiked, likesCount: t.likesCount + (wasLiked ? -1 : 1) }
        : t;
    const revert = (t: Thread): Thread =>
      t.id === thread.id
        ? { ...t, likedByMe: wasLiked, likesCount: t.likesCount + (wasLiked ? 1 : -1) }
        : t;

    this.forum.update((f) => (f ? { ...f, threads: f.threads.map(toggle) } : null));
    this.threadsService.likeThread(thread.id).subscribe({
      error: () => this.forum.update((f) => (f ? { ...f, threads: f.threads.map(revert) } : null)),
    });
  }

  protected openThreadModal(): void {
    this.threadTitle.set('');
    this.threadContent.set('');
    this.showThreadModal.set(true);
  }

  protected submitThread(): void {
    if (!this.canSubmitThread() || this.creating()) return;
    this.creating.set(true);
    const req: CreateThreadRequest = {
      title: this.threadTitle().trim(),
      content: this.threadContent().trim(),
    };
    this.threadsService.createThread(this.forumId(), req).subscribe({
      next: (thread) => {
        this.forum.update((f) => (f ? { ...f, threads: [thread, ...f.threads] } : null));
        this.creating.set(false);
        this.showThreadModal.set(false);
      },
      error: () => this.creating.set(false),
    });
  }

  protected time(iso: string): string {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private loadForum(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.forum.set(null);
    this.forumsService.getForum(id).subscribe({
      next: (detail) => {
        this.forum.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
