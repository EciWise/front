import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideLanguages } from '@lucide/angular';
import { AppLanguage, I18nService } from './i18n.service';

/** Menu para seleccionar el idioma de la interfaz. */
@Component({
  selector: 'eci-language-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, UpperCasePipe, LucideLanguages],
  template: `
    <div class="lang-menu" [class.lang-menu--open]="open()">
      <button
        type="button"
        class="icon-button lang-menu__trigger"
        [attr.aria-label]="'language.toggle' | translate"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        (click)="toggleMenu($event)"
      >
        <svg lucideLanguages [size]="20" aria-hidden="true"></svg>
        <span class="lang-code">{{ i18n.lang() | uppercase }}</span>
        <span class="lang-menu__chevron" aria-hidden="true"></span>
      </button>

      @if (open()) {
        <div
          class="lang-menu__panel"
          role="listbox"
          [attr.aria-label]="'language.menuLabel' | translate"
        >
          @for (lang of i18n.supportedLanguages; track lang) {
            <button
              type="button"
              class="lang-menu__option"
              role="option"
              [class.lang-menu__option--active]="lang === i18n.lang()"
              [attr.aria-selected]="lang === i18n.lang()"
              (pointerdown)="select(lang, $event)"
              (click)="select(lang, $event)"
            >
              <span>{{ 'language.' + lang | translate }}</span>
              <span class="lang-menu__code">{{ lang | uppercase }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        position: relative;
        display: inline-flex;
      }

      .lang-menu {
        position: relative;
      }

      .lang-menu__trigger {
        width: auto;
        gap: var(--space-1);
        padding: 0 var(--space-2) 0 var(--space-3);
      }

      .lang-code {
        font-size: 0.75rem;
        font-weight: 700;
      }

      .lang-menu__chevron {
        width: 0.45rem;
        height: 0.45rem;
        margin-left: 0.1rem;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg) translateY(-0.12rem);
        opacity: 0.78;
        transition: transform var(--transition-fast);
      }

      .lang-menu--open .lang-menu__chevron {
        transform: rotate(225deg) translateY(-0.12rem);
      }

      .lang-menu__panel {
        position: absolute;
        top: calc(100% + var(--space-2));
        right: 0;
        z-index: 120;
        width: max-content;
        min-width: 12rem;
        max-width: calc(100vw - (2 * var(--space-4)));
        box-sizing: border-box;
        overflow-y: auto;
        padding: var(--space-2);
        border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border));
        border-radius: var(--radius-lg);
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--surface) 72%, var(--surface-2)),
            var(--surface-2)
          );
        color: var(--text);
        box-shadow: var(--shadow-lg);
        animation: lang-menu-in 140ms ease;
      }

      .lang-menu__option {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-2) var(--space-3);
        border: 0;
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--text);
        font: inherit;
        font-size: 0.88rem;
        font-weight: 700;
        text-align: left;
        cursor: pointer;
        transition:
          background-color var(--transition-fast),
          color var(--transition-fast);
      }

      .lang-menu__option:hover,
      .lang-menu__option:focus-visible {
        outline: none;
        background: color-mix(in srgb, var(--accent) 12%, var(--surface-3));
      }

      .lang-menu__option--active {
        background: color-mix(in srgb, var(--accent) 16%, var(--surface-3));
      }

      .lang-menu__code {
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 800;
      }

      @keyframes lang-menu-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
      }

      @media (max-width: 40rem) {
        .lang-menu__panel {
          position: fixed;
          top: calc(4rem + var(--space-2));
          right: max(var(--space-2), env(safe-area-inset-right));
          left: max(var(--space-2), env(safe-area-inset-left));
          width: auto;
          min-width: 0;
          max-width: none;
          max-height: calc(100dvh - 4rem - var(--space-4) - env(safe-area-inset-bottom));
        }
      }
    `,
  ],
})
export class LanguageSwitchComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly i18n = inject(I18nService);
  protected readonly open = signal(false);

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || !this.host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.open.set(false);
  }

  protected toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update((open) => !open);
  }

  protected select(lang: AppLanguage, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.i18n.use(lang);
    this.open.set(false);
  }
}
