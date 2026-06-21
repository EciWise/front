import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideRotateCcw, LucideSend } from '@lucide/angular';
import { SectionTabsComponent, SectionTab } from '../../shared/ui/section-tabs/section-tabs';
import { CollapseComponent } from '../../shared/ui/collapse/collapse';
import { AiAssistantService } from './ai-assistant.service';

type AssistantMode = 'chat' | 'socratic';

const TABS: readonly SectionTab[] = [
  { id: 'chat',     labelKey: 'aiAssistant.modeChat' },
  { id: 'socratic', labelKey: 'aiAssistant.modeSocratic' },
];

/** Panel de conversación con el asistente de IA (RAG chat + socrático). */
@Component({
  selector: 'eci-ai-assistant-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, LucideSend, LucideRotateCcw, SectionTabsComponent, CollapseComponent],
  templateUrl: './ai-assistant-panel.html',
})
export class AiAssistantPanelComponent {
  protected readonly assistant = inject(AiAssistantService);

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<string>('chat');
  protected readonly messages = this.assistant.messages;
  protected readonly sending = this.assistant.sending;
  protected readonly draft = signal('');

  protected selectTab(id: string): void {
    this.activeTab.set(id);
    this.assistant.resetConversation();
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text || this.sending()) return;
    this.draft.set('');
    void this.assistant.send(text, this.activeTab() as AssistantMode);
  }
}
