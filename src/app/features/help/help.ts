import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideChevronDown } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AchievementToastService } from '../../core/gamification/achievement-toast.service';
import { GamificationService } from '../../core/gamification/gamification.service';
import { CardComponent } from '../../shared/ui/card/card';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { IconComponent, IconName } from '../../shared/ui/icon/icon';

interface HelpItem {
  /** Clave i18n de la pregunta. */
  readonly q: string;
  /** Clave i18n de la respuesta. */
  readonly a: string;
}

interface HelpCategory {
  readonly id: string;
  readonly titleKey: string;
  readonly icon: IconName;
  readonly items: readonly HelpItem[];
}

/** Par pregunta/respuesta a partir de la base de su clave i18n (`<base>Q`/`<base>A`). */
const faq = (base: string): HelpItem => ({ q: `${base}Q`, a: `${base}A` });

/**
 * Centro de ayuda: buscador en vivo + preguntas frecuentes agrupadas por
 * categoría en un acordeón animado, atajos de teclado y acceso al asistente.
 * El buscador filtra sobre el texto ya traducido (TranslateService.instant) y
 * se recalcula al cambiar de idioma; al buscar, las coincidencias se expanden
 * solas para que la respuesta se vea sin clics extra.
 */
@Component({
  selector: 'eci-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, PageHeaderComponent, IconComponent, LucideChevronDown],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class HelpComponent {
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly gamification = inject(GamificationService);
  private readonly toasts = inject(AchievementToastService);
  private readonly destroyRef = inject(DestroyRef);
  /** Evita repetir la llamada de gamificación en cada apertura de la sesión. */
  private helpAchievementRequested = false;

  protected readonly query = signal('');
  /** Se incrementa al cambiar de idioma para recalcular el filtro traducido. */
  private readonly langTick = signal(0);
  /** Claves de preguntas abiertas manualmente (`catId::q`). */
  private readonly openItems = signal<ReadonlySet<string>>(new Set());

  protected readonly categories: readonly HelpCategory[] = [
    {
      id: 'start',
      titleKey: 'help.cats.start',
      icon: 'dashboard',
      items: [faq('help.q.home'), faq('help.q.nav'), faq('help.q.search')],
    },
    {
      id: 'appearance',
      titleKey: 'help.cats.appearance',
      icon: 'settings',
      items: [faq('help.q.theme'), faq('help.q.a11y'), faq('help.q.language')],
    },
    {
      id: 'comms',
      titleKey: 'help.cats.comms',
      icon: 'chat',
      items: [faq('help.q.assistant'), faq('help.q.messages'), faq('help.q.notifications')],
    },
    {
      id: 'account',
      titleKey: 'help.cats.account',
      icon: 'profile',
      items: [faq('help.q.profile'), faq('help.q.logout')],
    },
  ];

  protected readonly shortcuts: readonly { keys: readonly string[]; labelKey: string }[] = [
    { keys: ['Alt', 'A'], labelKey: 'help.shortcuts.a11y' },
    { keys: ['Tab'], labelKey: 'help.shortcuts.menu' },
  ];

  /** Categorías (y preguntas) que coinciden con la búsqueda actual. */
  protected readonly visibleCategories = computed<readonly HelpCategory[]>(() => {
    this.langTick();
    const q = this.normalize(this.query());
    if (!q) return this.categories;
    return this.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            this.normalize(this.t(it.q)).includes(q) ||
            this.normalize(this.t(it.a)).includes(q) ||
            this.normalize(this.t(cat.titleKey)).includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  });

  /** Número de preguntas mostradas (para el contador de resultados). */
  protected readonly resultCount = computed(() =>
    this.visibleCategories().reduce((n, cat) => n + cat.items.length, 0),
  );

  constructor() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.query.set('');
  }

  /** Al buscar, las coincidencias se muestran expandidas automáticamente. */
  protected isOpen(catId: string, q: string): boolean {
    return this.query().length > 0 || this.openItems().has(this.key(catId, q));
  }

  protected toggle(catId: string, q: string): void {
    const key = this.key(catId, q);
    let opened = false;
    this.openItems.update((set) => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        opened = true;
      }
      return next;
    });
    if (opened) {
      this.rewardHelpExploration();
    }
  }

  /**
   * Desbloquea el logro "Perdidasss, andamos perdidasss!" la primera vez que se
   * abre una pregunta del Centro de Ayuda y muestra un toast. Tolerante a fallos
   * e idempotente en el backend; solo se intenta una vez por sesión de la vista.
   */
  private rewardHelpExploration(): void {
    if (this.helpAchievementRequested) {
      return;
    }
    const userId = this.auth.user()?.id;
    if (!userId) {
      return;
    }
    this.helpAchievementRequested = true;
    this.gamification
      .registerHelpQuestionOpened(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.toasts.push(res.unlockedAchievements),
        error: () => {
          // La gamificación es best-effort: si falla, la ayuda funciona igual.
        },
      });
  }

  private key(catId: string, q: string): string {
    return `${catId}::${q}`;
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  /** Minúsculas sin acentos para una búsqueda tolerante. */
  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }
}
