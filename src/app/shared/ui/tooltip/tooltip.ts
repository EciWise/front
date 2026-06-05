import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Icono de informacion con tooltip accesible. El texto debe llegar ya traducido:
 * `[text]="'clave' | translate"`.
 */
@Component({
  selector: 'eci-info-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="tip">
      <button
        type="button"
        class="tip__trigger"
        [attr.aria-label]="label()"
        (mouseenter)="show()"
        (mouseleave)="hide()"
        (focus)="show()"
        (blur)="hide()"
      >
        <eci-icon name="info" [size]="size()" />
      </button>
      <span
        class="tip__bubble"
        role="tooltip"
        [class.tip__bubble--visible]="visible()"
        [class.tip__bubble--above]="above()"
        [style.left.px]="left()"
        [style.top.px]="top()"
      >
        {{ text() }}
      </span>
    </span>
  `,
  styleUrl: './tooltip.css',
})
export class InfoTooltipComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly text = input.required<string>();
  readonly ariaLabel = input<string>('');
  readonly size = input(16);
  readonly placement = input<'auto' | 'above' | 'below'>('auto');

  protected readonly visible = signal(false);
  protected readonly left = signal(0);
  protected readonly top = signal(0);
  protected readonly above = signal(false);

  private readonly bubbleWidth = 288;
  private readonly viewportInset = 8;
  private readonly verticalGap = 8;

  protected label(): string {
    return this.ariaLabel() || this.text();
  }

  protected show(): void {
    const host = this.host.nativeElement;
    const trigger = this.host.nativeElement.querySelector('.tip__trigger');
    if (!trigger) {
      return;
    }

    const hostRect = host.getBoundingClientRect();
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = globalThis.innerWidth || 1024;
    const placement = this.placement();
    const showAbove = placement === 'above';
    const effectiveWidth = Math.min(
      this.bubbleWidth,
      Math.max(0, viewportWidth - this.viewportInset * 2),
    );
    const minCenter = effectiveWidth / 2 + this.viewportInset;
    const maxCenter = viewportWidth - effectiveWidth / 2 - this.viewportInset;
    const triggerCenter = rect.left + rect.width / 2;
    const viewportCenter =
      maxCenter >= minCenter
        ? Math.min(Math.max(triggerCenter, minCenter), maxCenter)
        : viewportWidth / 2;

    this.left.set(viewportCenter - hostRect.left);
    this.top.set(
      showAbove
        ? rect.top - hostRect.top - this.verticalGap
        : rect.bottom - hostRect.top + this.verticalGap,
    );
    this.above.set(showAbove);
    this.visible.set(true);
  }

  protected hide(): void {
    this.visible.set(false);
  }
}
