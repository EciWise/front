import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { MateriaDto, TutoringApiService } from '../../../core/tutoring/tutoring-api.service';

@Component({
  selector: 'eci-admin-materias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: './admin-materias.html',
  styleUrl: './admin-materias.css',
})
export class AdminMateriasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TutoringApiService);

  protected readonly materias = signal<MateriaDto[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly editTarget = signal<MateriaDto | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly actionErrorId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.editTarget.set(null);
    this.form.reset({ codigo: '', nombre: '' });
    this.errorKey.set(null);
    this.modalOpen.set(true);
  }

  openEdit(materia: MateriaDto): void {
    this.editTarget.set(materia);
    this.form.reset({ codigo: materia.codigo, nombre: materia.nombre });
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
    const { codigo, nombre } = this.form.getRawValue();
    const target = this.editTarget();

    const request$ = target
      ? this.api.actualizarMateria(target.id, { codigo, nombre })
      : this.api.crearMateria({ codigo, nombre });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.errorKey.set('admin.materias.error');
      },
    });
  }

  toggleActiva(materia: MateriaDto): void {
    this.actionErrorId.set(null);
    this.api.actualizarMateria(materia.id, { activa: !materia.activa }).subscribe({
      next: () => this.load(),
      error: () => this.actionErrorId.set(materia.id),
    });
  }

  remove(materia: MateriaDto): void {
    this.actionErrorId.set(null);
    this.api.eliminarMateria(materia.id).subscribe({
      next: () => this.load(),
      error: () => this.actionErrorId.set(materia.id),
    });
  }

  private load(): void {
    this.api.listarTodasMaterias().subscribe({
      next: (materias) => this.materias.set(materias),
    });
  }
}
