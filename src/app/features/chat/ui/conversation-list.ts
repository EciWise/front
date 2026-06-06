import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideEye,
  LucideEyeOff,
  LucideMoreVertical,
  LucidePlus,
  LucideShieldCheck,
  LucideTrash,
  LucideUser,
  LucideUsers,
} from '@lucide/angular';
import { ChatService } from '../chat.service';
import { Conversation } from '../chat.models';

/** Lista de conversaciones del usuario, con accesos a "nuevo" y moderación. */
@Component({
  selector: 'eci-conversation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslatePipe,
    LucideEye,
    LucideEyeOff,
    LucideMoreVertical,
    LucidePlus,
    LucideShieldCheck,
    LucideTrash,
    LucideUser,
    LucideUsers,
  ],
  templateUrl: './conversation-list.html',
  styleUrl: './conversation-list.css',
})
export class ConversationListComponent {
  protected readonly chat = inject(ChatService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Id de la conversación con el menú de 3 puntos abierto (null = ninguno). */
  protected readonly openMenuId = signal<string | null>(null);
  /** Id en confirmación de borrado (muestra "¿Eliminar? Sí/No"). */
  protected readonly confirmId = signal<string | null>(null);

  /** Para chats individuales muestra al otro participante; para grupos, su nombre. */
  protected title(conv: Conversation): string {
    if (conv.type === 'GROUP') {
      return conv.name ?? '';
    }
    const me = this.chat.currentUserId();
    const other = conv.participants.find((p) => p.userId !== me);
    return other?.userName ?? conv.participants[0]?.userName ?? '';
  }

  protected toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.confirmId.set(null);
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  protected hide(id: string): void {
    this.chat.hideConversation(id);
    this.closeMenu();
  }

  protected unhide(id: string): void {
    this.chat.unhideConversation(id);
    this.closeMenu();
  }

  protected askDelete(id: string): void {
    this.confirmId.set(id);
  }

  protected confirmDelete(id: string): void {
    this.chat.deleteConversation(id);
    this.closeMenu();
  }

  private closeMenu(): void {
    this.openMenuId.set(null);
    this.confirmId.set(null);
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocPointerDown(event: PointerEvent): void {
    if (this.openMenuId() && !this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }
}
