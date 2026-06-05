import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LucidePaperclip, LucideSend, LucideX } from '@lucide/angular';
import { ChatService } from '../chat.service';

/** Caja de redacción: texto, adjunto, respuesta e indicador de escritura. */
@Component({
  selector: 'eci-message-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, LucidePaperclip, LucideSend, LucideX],
  templateUrl: './message-composer.html',
  styleUrl: './message-composer.css',
})
export class MessageComposerComponent {
  protected readonly chat = inject(ChatService);
  protected readonly draft = signal('');

  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  protected onInput(value: string): void {
    this.draft.set(value);
    this.chat.notifyTyping(true);
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.typingTimer = setTimeout(() => this.chat.notifyTyping(false), 2000);
  }

  protected submit(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    this.chat.sendText(text);
    this.draft.set('');
    this.chat.notifyTyping(false);
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.chat.sendWithFile(file, this.draft());
      this.draft.set('');
    }
    input.value = '';
  }
}
