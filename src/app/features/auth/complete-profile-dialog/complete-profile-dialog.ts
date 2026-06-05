import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IaDataService } from '../../../core/ia/ia-data.service';
import { IaProfileStatusService } from '../../../core/ia/ia-profile-status.service';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { DatosIaFieldsComponent } from '../datos-ia-fields/datos-ia-fields';
import { buildDatosIaGroup, buildDatosIaPayload } from '../datos-ia-form';
import { AuthFormBase } from '../auth-form.base';

/**
 * Pop-up no descartable que pide los datos del modelo de rendimiento. Se muestra
 * tras el registro por Google (cuentas sin esos datos) para mantener la
 * consistencia y poder calcular la predicción. Desaparece al completarse.
 */
@Component({
  selector: 'eci-complete-profile-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent, DatosIaFieldsComponent],
  templateUrl: './complete-profile-dialog.html',
  styleUrl: '../force-password-change/force-password-change.css',
})
export class CompleteProfileDialogComponent extends AuthFormBase {
  private readonly fb = inject(FormBuilder);
  private readonly dataService = inject(IaDataService);
  private readonly status = inject(IaProfileStatusService);

  protected readonly form = this.fb.nonNullable.group({
    datosIa: buildDatosIaGroup(this.fb),
  });

  protected get datosIaGroup(): FormGroup {
    return this.form.controls.datosIa;
  }

  submit(): void {
    if (!this.beginSubmit(this.form)) {
      return;
    }
    const payload = buildDatosIaPayload(this.form.controls.datosIa.getRawValue());
    this.dataService.saveMyData(payload).subscribe({
      next: () => {
        // Al recargar el estado, performanceComplete pasa a true y el AppShell
        // deja de mostrar este diálogo.
        this.status.load();
      },
      error: (err: unknown) => this.failWith(err),
    });
  }
}
