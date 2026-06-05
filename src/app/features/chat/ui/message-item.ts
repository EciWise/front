import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideCheck,
  LucideEyeOff,
  LucidePencil,
  LucidePin,
  LucideReply,
  LucideSmilePlus,
  LucideTrash,
  LucideX,
} from '@lucide/angular';
import { ChatService } from '../chat.service';
import { Message } from '../chat.models';

/** Una burbuja de mensaje con reacciones, recibos y acciones de moderación. */
@Component({
  selector: 'eci-message-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslatePipe,
    LucideCheck,
    LucideEyeOff,
    LucidePencil,
    LucidePin,
    LucideReply,
    LucideSmilePlus,
    LucideTrash,
    LucideX,
  ],
  templateUrl: './message-item.html',
  styleUrl: './message-item.css',
})
export class MessageItemComponent {
  protected readonly chat = inject(ChatService);
  readonly message = input.required<Message>();
  /** La conversación es anónima. */
  readonly anonymous = input(false);
  /** El usuario que mira es el creador (en anónimas, ve los nombres reales). */
  readonly viewerIsCreator = input(false);

  protected readonly reactionPalette = ['👍', '❤️', '😂', '🎉', '😮', '🙏'];
  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly reactMenuOpen = signal(false);

  protected readonly mine = computed(() => this.message().senderId === this.chat.currentUserId());
  /** En conversaciones anónimas se oculta el nombre real salvo al creador. */
  protected readonly maskName = computed(() => this.anonymous() && !this.viewerIsCreator());
  protected readonly canCensor = computed(
    () => this.chat.canModerate() && !this.message().manuallyCensored && !this.message().deleted,
  );
  protected readonly canDelete = computed(
    () => (this.mine() || this.chat.canModerate()) && !this.message().deleted,
  );
  protected readonly canEdit = computed(
    () => this.mine() && !this.message().deleted && !this.message().manuallyCensored,
  );

  protected time(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /** Nº de personas (distintas de mí) que leyeron un mensaje propio. */
  protected readCount(): number {
    const me = this.chat.currentUserId();
    return this.message().readBy.filter((r) => r.userId !== me).length;
  }

  protected reacted(emoji: string): boolean {
    const me = this.chat.currentUserId();
    return this.message().reactions.some((g) => g.emoji === emoji && g.userIds.includes(me ?? ''));
  }

  protected react(emoji: string): void {
    this.chat.toggleReaction(this.message().id, emoji);
    this.reactMenuOpen.set(false);
  }

  protected startEdit(): void {
    this.draft.set(this.message().contentDisplay);
    this.editing.set(true);
  }

  protected saveEdit(): void {
    this.chat.editMessage(this.message().id, this.draft());
    this.editing.set(false);
  }
}
