import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideArrowLeft, LucidePlus, LucideTrash } from '@lucide/angular';
import { ChatService } from '../chat.service';

/** Gestión de la lista negra del filtro automático. Solo accesible para admin. */
@Component({
  selector: 'eci-censored-words',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, LucideArrowLeft, LucidePlus, LucideTrash],
  templateUrl: './censored-words.html',
  styleUrl: './censored-words.css',
})
export class CensoredWordsComponent {
  protected readonly chat = inject(ChatService);
  protected readonly draft = signal('');

  protected add(): void {
    const word = this.draft().trim();
    if (!word) {
      return;
    }
    this.chat.addCensoredWord(word);
    this.draft.set('');
  }
}
