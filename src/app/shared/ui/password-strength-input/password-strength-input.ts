import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon';

type PasswordStrength = 'weak' | 'medium' | 'secure';

@Component({
  selector: 'eci-password-strength-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordStrengthInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="psi" [class.psi--disabled]="disabled()">
      <div class="psi__control">
        <input
          class="psi__input"
          [type]="visible() ? 'text' : 'password'"
          [value]="value()"
          [attr.autocomplete]="autocomplete()"
          [attr.placeholder]="placeholder() || null"
          [attr.aria-label]="ariaLabel() || null"
          [disabled]="disabled()"
          (input)="setValue($any($event.target).value)"
          (blur)="touch()"
        />
        <button
          type="button"
          class="psi__reveal"
          [disabled]="disabled()"
          [attr.aria-label]="
            (visible() ? 'passwordStrength.hide' : 'passwordStrength.show') | translate
          "
          (click)="toggleVisible()"
        >
          <eci-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="18" />
        </button>
      </div>

      @if (showStrength()) {
        <div class="psi__meter" [attr.data-strength]="strength()">
          <div class="psi__bars" aria-hidden="true">
            @for (bar of [1, 2, 3]; track bar) {
              <span class="psi__bar" [class.psi__bar--active]="bar <= activeBars()"></span>
            }
          </div>
          <span class="psi__label">{{ 'passwordStrength.' + strength() | translate }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './password-strength-input.css',
})
export class PasswordStrengthInputComponent implements ControlValueAccessor {
  readonly autocomplete = input('new-password');
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly showStrength = input(true);

  protected readonly value = signal('');
  protected readonly visible = signal(false);
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected strength(): PasswordStrength {
    const password = this.value();
    const categories = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    if (password.length >= 10 && categories >= 3) {
      return 'secure';
    }
    if (password.length >= 8 && categories >= 2) {
      return 'medium';
    }
    return 'weak';
  }

  protected activeBars(): number {
    switch (this.strength()) {
      case 'secure':
        return 3;
      case 'medium':
        return 2;
      default:
        return 1;
    }
  }

  protected setValue(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected touch(): void {
    this.onTouched();
  }

  protected toggleVisible(): void {
    this.visible.update((visible) => !visible);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
