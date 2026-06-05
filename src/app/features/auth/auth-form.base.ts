import { Directive, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AuthError } from '../../core/auth/auth.service';

/**
 * Estado común de los formularios de autenticación (login, registro, cambio de
 * contraseña y completar perfil): bandera de carga, clave i18n de error y el
 * guardado de envío. Centraliza el patrón para no repetirlo en cada pantalla.
 */
@Directive()
export abstract class AuthFormBase {
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  /**
   * Valida el formulario y bloquea envíos concurrentes. Si no se puede enviar,
   * marca los controles como tocados y devuelve `false`; si sí, activa la carga,
   * limpia el error previo y devuelve `true`.
   */
  protected beginSubmit(form: AbstractControl): boolean {
    if (form.invalid || this.loading()) {
      form.markAllAsTouched();
      return false;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    return true;
  }

  /**
   * Detiene la carga y traduce el error a su clave i18n (genérica si no es un
   * `AuthError`). Devuelve la clave para que la pantalla pueda reaccionar a ella.
   */
  protected failWith(err: unknown): string {
    this.loading.set(false);
    const key = err instanceof AuthError ? err.messageKey : 'errors.unknown';
    this.errorKey.set(key);
    return key;
  }
}
