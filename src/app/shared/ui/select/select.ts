import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
  template: `
    <div class="select" [class.select--open]="open()" [class.select--compact]="compact()">
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
        <div class="select__menu" [id]="listId" role="listbox">
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

  @HostListener('document:click', ['$event'])
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
    this.open.update((open) => !open);
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
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open.set(true);
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

  private sameValue(a: SelectValue, b: SelectValue): boolean {
    return a === b || String(a ?? '') === String(b ?? '');
  }
}
