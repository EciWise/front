import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideArrowLeft } from '@lucide/angular';
import { ChatService } from '../chat.service';
import { MessageItemComponent } from './message-item';
import { MessageComposerComponent } from './message-composer';

/** Hilo de una conversación: cabecera, fijados, mensajes, typing y composer. */
@Component({
  selector: 'eci-message-thread',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideArrowLeft, MessageItemComponent, MessageComposerComponent],
  templateUrl: './message-thread.html',
  styleUrl: './message-thread.css',
})
export class MessageThreadComponent {
  protected readonly chat = inject(ChatService);

  protected readonly isGroup = computed(() => this.chat.activeConversation()?.type === 'GROUP');

  protected readonly title = computed(() => {
    const conv = this.chat.activeConversation();
    if (!conv) {
      return '';
    }
    if (conv.type === 'GROUP') {
      return conv.name ?? '';
    }
    const me = this.chat.currentUserId();
    return conv.participants.find((p) => p.userId !== me)?.userName ?? '';
  });

  protected readonly pinned = computed(() =>
    this.chat.messages().filter((m) => m.pinned && !m.deleted),
  );

  protected readonly anonymous = computed(() => this.chat.activeConversation()?.anonymous ?? false);
  /** En conversaciones anónimas, solo el creador ve los nombres reales. */
  protected readonly viewerIsCreator = computed(
    () => this.chat.activeConversation()?.createdBy === this.chat.currentUserId(),
  );
}
