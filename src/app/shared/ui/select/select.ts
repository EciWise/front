import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export type SelectValue = string | number | null;

export interface SelectOption {
  readonly value: SelectValue;
  readonly label?: string;
  readonly labelKey?: string;
  readonly disabled?: boolean;
}

type SelectPlacement = 'below' | 'above';

interface BoundaryRect {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

@Component({
  selector: 'eci-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  host: {
    '(document:click)': 'closeFromOutside($event)',
    '(window:resize)': 'refreshMenuPosition()',
  },
  template: `
    <div
      class="select"
      [class.select--open]="open()"
      [class.select--compact]="compact()"
      [class.select--above]="placement() === 'above'"
    >
      <button
        type="button"
        class="select__trigger"
        role="combobox"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listId"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="select__value" [class.select__value--placeholder]="!selected()">
          @if (selected(); as option) {
            @if (option.labelKey) {
              {{ option.labelKey | translate }}
            } @else {
              {{ option.label }}
            }
          } @else {
            {{ placeholder() }}
          }
        </span>
        <span class="select__chevron" aria-hidden="true"></span>
      </button>

      @if (open()) {
        <div
          class="select__menu"
          [id]="listId"
          role="listbox"
          [style.--select-menu-max-height]="menuMaxHeight()"
        >
          @for (option of options(); track option.value) {
            <button
              type="button"
              class="select__option"
              role="option"
              [disabled]="option.disabled"
              [class.select__option--selected]="isSelected(option)"
              [attr.aria-selected]="isSelected(option)"
              (click)="choose(option)"
            >
              @if (option.labelKey) {
                {{ option.labelKey | translate }}
              } @else {
                {{ option.label }}
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './select.css',
})
export class SelectComponent implements ControlValueAccessor {
  readonly options = input<readonly SelectOption[]>([]);
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly compact = input(false);
  readonly value = input<SelectValue | undefined>(undefined);
  readonly valueChange = output<SelectValue>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private static nextId = 0;

  protected readonly listId = `eci-select-${SelectComponent.nextId++}`;
  protected readonly open = signal(false);
  protected readonly placement = signal<SelectPlacement>('below');
  protected readonly menuMaxHeight = signal('min(18rem, 45vh)');
  protected readonly currentValue = signal<SelectValue>(null);
  protected readonly disabled = signal(false);
  protected readonly selected = computed(() =>
    this.options().find((option) => this.sameValue(option.value, this.currentValue())) ?? null,
  );

  private onChange: (value: SelectValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        this.currentValue.set(value);
      }
    });
  }

  closeFromOutside(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
      return;
    }
    this.openMenu();
  }

  protected choose(option: SelectOption): void {
    if (option.disabled) {
      return;
    }
    this.currentValue.set(option.value);
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.close();
  }

  protected isSelected(option: SelectOption): boolean {
    return this.sameValue(option.value, this.currentValue());
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.openMenu();
    }
  }

  protected refreshMenuPosition(): void {
    if (this.open()) {
      this.updateMenuPosition();
    }
  }

  writeValue(value: SelectValue | undefined): void {
    this.currentValue.set(value ?? null);
  }

  registerOnChange(fn: (value: SelectValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  private close(): void {
    if (this.open()) {
      this.open.set(false);
      this.onTouched();
    }
  }

  private openMenu(): void {
    this.updateMenuPosition();
    this.open.set(true);
  }

  private updateMenuPosition(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const boundary = this.visibleBoundary();
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const rootFontSize = this.rootFontSize();
    const gap = this.cssLength('--space-2', rootFontSize * 0.5);
    const preferredHeight = this.preferredMenuHeight(rootFontSize, gap);
    const spaceBelow = boundary.bottom - hostRect.bottom - gap;
    const spaceAbove = hostRect.top - boundary.top - gap;
    const shouldOpenAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableSpace = Math.max(3.5 * rootFontSize, shouldOpenAbove ? spaceAbove : spaceBelow);
    const maxHeight = Math.max(3.5 * rootFontSize, Math.min(preferredHeight, availableSpace));

    this.placement.set(shouldOpenAbove ? 'above' : 'below');
    this.menuMaxHeight.set(`${Math.floor(maxHeight)}px`);
  }

  private visibleBoundary(): BoundaryRect {
    const boundary = {
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
    };
    let parent = this.host.nativeElement.parentElement;

    while (parent && parent !== document.body && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      const overflow = `${style.overflow} ${style.overflowY} ${style.overflowX}`;
      if (/(auto|scroll|hidden|clip)/.test(overflow)) {
        const rect = parent.getBoundingClientRect();
        boundary.top = Math.max(boundary.top, rect.top);
        boundary.bottom = Math.min(boundary.bottom, rect.bottom);
        boundary.left = Math.max(boundary.left, rect.left);
        boundary.right = Math.min(boundary.right, rect.right);
      }
      parent = parent.parentElement;
    }

    return boundary;
  }

  private preferredMenuHeight(rootFontSize: number, gap: number): number {
    const maxMenuHeight = Math.min(18 * rootFontSize, window.innerHeight * 0.45);
    const optionHeight = this.compact() ? 2.25 * rootFontSize : 2.75 * rootFontSize;
    const estimatedHeight = this.options().length * optionHeight + gap * 2;
    return Math.min(maxMenuHeight, Math.max(optionHeight + gap * 2, estimatedHeight));
  }

  private rootFontSize(): number {
    return Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
  }

  private cssLength(property: string, fallback: number): number {
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    if (!value) {
      return fallback;
    }
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.width = value;
    document.body.appendChild(element);
    const pixels = element.getBoundingClientRect().width;
    element.remove();
    return pixels || fallback;
  }

  private sameValue(a: SelectValue, b: SelectValue): boolean {
    return a === b || String(a ?? '') === String(b ?? '');
  }
}
