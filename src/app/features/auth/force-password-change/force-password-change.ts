import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthFormBase } from '../auth-form.base';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';

/** Valida que `newPassword` y `confirm` coincidan. */
const passwordsMatch: ValidatorFn = (group) => {
  const pw = group.get('newPassword')?.value as string;
  const confirm = group.get('confirm')?.value as string;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
};

/**
 * Pop-up forzado (no descartable) de cambio de contraseña para cuentas creadas
 * por CSV. Solo pide la nueva contraseña; los datos de IA del estudiante se
 * piden después en los diálogos de "completar perfil" (rendimiento y deserción)
 * para no repetir preguntas en un único pop-up largo. Al completarse,
 * `AuthService` limpia el flag `mustChangePassword` y el `AppShell` deja de
 * mostrar este diálogo.
 */
@Component({
  selector: 'eci-force-password-change',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './force-password-change.html',
  styleUrl: './force-password-change.css',
})
export class ForcePasswordChangeComponent extends AuthFormBase {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
        ],
      ],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    if (!this.beginSubmit(this.form)) {
      return;
    }
    const newPassword = this.form.controls.newPassword.value;

    this.auth.changePassword(newPassword).subscribe({
      // Al éxito, el flag se limpia en el estado y el AppShell oculta el diálogo.
      error: (err: unknown) => this.failWith(err),
    });
  }
}
