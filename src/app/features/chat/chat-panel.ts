import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ChatService } from './chat.service';
import { ConversationListComponent } from './ui/conversation-list';
import { MessageThreadComponent } from './ui/message-thread';
import { NewConversationComponent } from './ui/new-conversation';
import { CensoredWordsComponent } from './ui/censored-words';

/**
 * Panel de mensajería acoplado (vista flotante). Cambia entre sus vistas
 * internas según el estado del `ChatService`: lista de conversaciones, hilo de
 * una conversación, alta de chat/grupo y (solo admin) lista negra de censura.
 */
@Component({
  selector: 'eci-chat-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ConversationListComponent,
    MessageThreadComponent,
    NewConversationComponent,
    CensoredWordsComponent,
  ],
  template: `
    @switch (chat.view()) {
      @case ('thread') {
        <eci-message-thread />
      }
      @case ('new') {
        <eci-new-conversation />
      }
      @case ('moderation') {
        <eci-censored-words />
      }
      @default {
        <eci-conversation-list />
      }
    }
  `,
})
export class ChatPanelComponent implements OnInit {
  protected readonly chat = inject(ChatService);

  ngOnInit(): void {
    this.chat.loadConversations();
  }
}
