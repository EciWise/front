import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { FranjaDto, TutoringApiService } from '../../../core/tutoring/tutoring-api.service';

const DAY_LABEL_KEYS = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri'];

/** Gestión de franjas horarias (catálogo, solo admin). Prerrequisito para publicar disponibilidad. */
@Component({
  selector: 'eci-admin-franjas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    SelectComponent,
  ],
  templateUrl: './admin-franjas.html',
  styleUrl: './admin-franjas.css',
})
export class AdminFranjasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TutoringApiService);

  protected readonly franjas = signal<FranjaDto[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly dayOptions: readonly SelectOption[] = DAY_LABEL_KEYS.map((labelKey, i) => ({
    value: String(i + 1),
    labelKey,
  }));

  protected readonly sortedFranjas = computed(() =>
    [...this.franjas()].sort(
      (a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio),
    ),
  );

  protected readonly form = this.fb.nonNullable.group({
    diaSemana: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
    horaInicio: ['07:00', [Validators.required]],
    horaFin: ['08:30', [Validators.required]],
    orden: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
  });

  ngOnInit(): void {
    this.load();
  }

  dayLabelKey(diaSemana: number): string {
    return DAY_LABEL_KEYS[diaSemana - 1] ?? '';
  }

  openCreate(): void {
    this.form.reset({ diaSemana: 1, horaInicio: '07:00', horaFin: '08:30', orden: 1 });
    this.errorKey.set(null);
    this.modalOpen.set(true);
  }

  setDay(value: SelectValue): void {
    this.form.controls.diaSemana.setValue(value === null ? 1 : Number(value));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorKey.set(null);
    this.api.crearFranja(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.errorKey.set('admin.franjas.error');
      },
    });
  }

  private load(): void {
    this.api.listarFranjas().subscribe({
      next: (franjas) => this.franjas.set(franjas),
    });
  }
}
