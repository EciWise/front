import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SalaDto, TutoringApiService } from '../../../core/tutoring/tutoring-api.service';

@Component({
  selector: 'eci-admin-salas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: './admin-salas.html',
  styleUrl: './admin-salas.css',
})
export class AdminSalasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TutoringApiService);

  protected readonly salas = signal<SalaDto[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly editTarget = signal<SalaDto | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly actionErrorId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    edificio: ['', [Validators.maxLength(80)]],
  });

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.editTarget.set(null);
    this.form.reset({ codigo: '', edificio: '' });
    this.errorKey.set(null);
    this.modalOpen.set(true);
  }

  openEdit(sala: SalaDto): void {
    this.editTarget.set(sala);
    this.form.reset({ codigo: sala.codigo, edificio: sala.edificio ?? '' });
    this.errorKey.set(null);
    this.modalOpen.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorKey.set(null);
    const { codigo, edificio } = this.form.getRawValue();
    const edificioVal = edificio.trim() || null;
    const target = this.editTarget();

    const request$ = target
      ? this.api.actualizarSala(target.id, { codigo, edificio: edificioVal })
      : this.api.crearSala({ codigo, ...(edificioVal ? { edificio: edificioVal } : {}) });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.errorKey.set('admin.salas.error');
      },
    });
  }

  toggleActiva(sala: SalaDto): void {
    this.actionErrorId.set(null);
    this.api.actualizarSala(sala.id, { activa: !sala.activa }).subscribe({
      next: () => this.load(),
      error: () => this.actionErrorId.set(sala.id),
    });
  }

  remove(sala: SalaDto): void {
    this.actionErrorId.set(null);
    this.api.eliminarSala(sala.id).subscribe({
      next: () => this.load(),
      error: () => this.actionErrorId.set(sala.id),
    });
  }

  private load(): void {
    this.api.listarSalas().subscribe({
      next: (salas) => this.salas.set(salas),
    });
  }
}
