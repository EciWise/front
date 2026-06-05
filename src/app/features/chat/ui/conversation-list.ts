import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucidePlus, LucideShieldCheck, LucideUsers, LucideUser } from '@lucide/angular';
import { ChatService } from '../chat.service';
import { Conversation } from '../chat.models';

/** Lista de conversaciones del usuario, con accesos a "nuevo" y moderación. */
@Component({
  selector: 'eci-conversation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucidePlus, LucideShieldCheck, LucideUsers, LucideUser],
  templateUrl: './conversation-list.html',
  styleUrl: './conversation-list.css',
})
export class ConversationListComponent {
  protected readonly chat = inject(ChatService);

  /** Para chats individuales muestra al otro participante; para grupos, su nombre. */
  protected title(conv: Conversation): string {
    if (conv.type === 'GROUP') {
      return conv.name ?? '';
    }
    const me = this.chat.currentUserId();
    const other = conv.participants.find((p) => p.userId !== me);
    return other?.userName ?? conv.participants[0]?.userName ?? '';
  }
}
