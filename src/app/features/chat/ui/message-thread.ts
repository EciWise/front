import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideArrowLeft, LucideChevronDown } from '@lucide/angular';
import { ChatService } from '../chat.service';
import { MessageItemComponent } from './message-item';
import { MessageComposerComponent } from './message-composer';

/** Distancia (px) al fondo dentro de la cual se considera "abajo del todo". */
const BOTTOM_THRESHOLD = 40;

/** Hilo de una conversación: cabecera, fijados, mensajes, typing y composer. */
@Component({
  selector: 'eci-message-thread',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LucideArrowLeft,
    LucideChevronDown,
    MessageItemComponent,
    MessageComposerComponent,
  ],
  templateUrl: './message-thread.html',
  styleUrl: './message-thread.css',
})
export class MessageThreadComponent {
  protected readonly chat = inject(ChatService);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  /** El usuario está al fondo del hilo (no está revisando arriba). */
  protected readonly atBottom = signal(true);
  /** Nº de mensajes nuevos llegados mientras se revisa arriba. */
  protected readonly newCount = signal(0);
  private lastCount = 0;

  constructor() {
    // Al crecer la lista: si estamos abajo (o el último es mío) bajamos solos;
    // si no, acumulamos el contador de nuevos para el botón de bajar.
    effect(() => {
      const msgs = this.chat.messages();
      const grew = msgs.length - this.lastCount;
      const last = msgs[msgs.length - 1];
      const mine = last?.senderId === this.chat.currentUserId();
      const wasReset = msgs.length < this.lastCount; // cambió de conversación
      this.lastCount = msgs.length;
      if (wasReset) {
        this.newCount.set(0);
        this.atBottom.set(true);
        requestAnimationFrame(() => this.scrollToBottom());
        return;
      }
      if (grew <= 0) {
        return;
      }
      if (this.atBottom() || mine) {
        requestAnimationFrame(() => this.scrollToBottom());
      } else {
        this.newCount.update((n) => n + grew);
      }
    });
  }

  protected onScroll(): void {
    const el = this.scroller()?.nativeElement;
    if (!el) {
      return;
    }
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    this.atBottom.set(atBottom);
    if (atBottom) {
      this.newCount.set(0);
      this.chat.markVisibleAsRead();
    }
  }

  protected scrollToBottom(): void {
    const el = this.scroller()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
    this.atBottom.set(true);
    this.newCount.set(0);
  }

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
