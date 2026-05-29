import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideBot, LucideMessageCircle, LucideX } from '@lucide/angular';
import { AiAssistantPanelComponent } from '../../../features/ai-assistant/ai-assistant-panel';
import { ChatPanelComponent } from '../../../features/chat/chat-panel';

type DockPanel = 'assistant' | 'chat' | null;

/**
 * Botones circulares fijos en la esquina inferior derecha (IA y chats),
 * presentes en toda la plataforma. Abren un panel acoplado.
 */
@Component({
  selector: 'eci-floating-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LucideBot,
    LucideMessageCircle,
    LucideX,
    AiAssistantPanelComponent,
    ChatPanelComponent,
  ],
  templateUrl: './floating-actions.html',
  styleUrl: './floating-actions.css',
})
export class FloatingActionsComponent {
  protected readonly active = signal<DockPanel>(null);

  open(panel: Exclude<DockPanel, null>): void {
    this.active.update((current) => (current === panel ? null : panel));
  }

  close(): void {
    this.active.set(null);
  }
}
