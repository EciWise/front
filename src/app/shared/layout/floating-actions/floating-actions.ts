import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  Renderer2,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideBot, LucideMessageCircle, LucidePlus, LucideX } from '@lucide/angular';
import { AiAssistantPanelComponent } from '../../../features/ai-assistant/ai-assistant-panel';
import { ChatPanelComponent } from '../../../features/chat/chat-panel';

type DockPanel = 'assistant' | 'chat' | null;

/** Ancho mínimo y por defecto (px) del panel acoplado. */
const MIN_DOCK_WIDTH = 320;
const DEFAULT_DOCK_WIDTH = 384;
const DOCK_WIDTH_KEY = 'eci.chat.dockWidth';

/**
 * Acciones flotantes en la esquina inferior derecha. Por defecto solo se ve un
 * botón rojo de menú (en la posición del antiguo botón de IA); al pulsarlo se
 * despliegan, con una animación suave, los botones de IA y chats. Si el usuario
 * navega a otra parte sin usarlos, se repliegan solos. Abrir cualquiera de los
 * dos muestra el panel acoplado, como antes.
 */
@Component({
  selector: 'eci-floating-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LucideBot,
    LucideMessageCircle,
    LucidePlus,
    LucideX,
    AiAssistantPanelComponent,
    ChatPanelComponent,
  ],
  templateUrl: './floating-actions.html',
  styleUrl: './floating-actions.css',
})
export class FloatingActionsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly active = signal<DockPanel>(null);
  /** Indica si el menú de acciones está desplegado (IA + chats visibles). */
  protected readonly expanded = signal(false);
  /** Ancho del panel acoplado; el usuario lo ajusta arrastrando el asa izquierda. */
  protected readonly width = signal<number>(this.readStoredWidth());

  private stopMove: (() => void) | null = null;
  private stopUp: (() => void) | null = null;

  constructor() {
    // Al cambiar de sección sin usar las acciones, se repliegan solas.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.expanded.set(false));

    // Persiste el ancho elegido por el usuario.
    effect(() => {
      const w = this.width();
      if (this.isBrowser) {
        localStorage.setItem(DOCK_WIDTH_KEY, String(w));
      }
    });
  }

  private readStoredWidth(): number {
    if (!this.isBrowser) {
      return DEFAULT_DOCK_WIDTH;
    }
    const stored = Number(localStorage.getItem(DOCK_WIDTH_KEY));
    return Number.isFinite(stored) && stored >= MIN_DOCK_WIDTH ? stored : DEFAULT_DOCK_WIDTH;
  }

  /** Inicia el redimensionado del panel arrastrando el asa izquierda. */
  startResize(event: PointerEvent): void {
    if (!this.isBrowser) {
      return;
    }
    event.preventDefault();
    const max = globalThis.innerWidth * 0.9;
    this.stopMove = this.renderer.listen('document', 'pointermove', (e: PointerEvent) => {
      const next = globalThis.innerWidth - e.clientX;
      this.width.set(Math.min(Math.max(next, MIN_DOCK_WIDTH), max));
    });
    this.stopUp = this.renderer.listen('document', 'pointerup', () => this.endResize());
  }

  private endResize(): void {
    this.stopMove?.();
    this.stopUp?.();
    this.stopMove = null;
    this.stopUp = null;
  }

  /** Despliega o repliega los botones de IA y chats. */
  toggle(): void {
    this.expanded.update((v) => !v);
  }

  open(panel: Exclude<DockPanel, null>): void {
    this.active.update((current) => (current === panel ? null : panel));
  }

  close(): void {
    this.active.set(null);
    // Al cerrar el panel se vuelve al botón de menú original.
    this.expanded.set(false);
  }
}
