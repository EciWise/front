import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { IaAdminService, UsuarioBasico } from '../../../core/ia/ia-admin.service';
import {
  MateriaDelTutorDto,
  TutoringApiService,
} from '../../../core/tutoring/tutoring-api.service';

@Component({
  selector: 'eci-admin-materias-tutores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
  ],
  templateUrl: './admin-materias-tutores.html',
  styleUrl: './admin-materias-tutores.css',
})
export class AdminMateriasTutoresComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly iaService = inject(IaAdminService);
  private readonly tutoringApi = inject(TutoringApiService);

  protected readonly tutors = signal<UsuarioBasico[]>([]);
  protected readonly allMaterias = signal<{ id: string; codigo: string; nombre: string; activa: boolean }[]>([]);
  protected readonly selectedTutorId = signal<string>('');
  protected readonly tutorMaterias = signal<MateriaDelTutorDto[]>([]);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly loadingMaterias = signal(false);

  protected readonly tutorOptions = computed<readonly SelectOption[]>(() =>
    this.tutors().map((t) => ({
      value: t.id,
      label: `${t.nombre} ${t.apellido} – ${t.email}`,
    })),
  );

  protected readonly availableMateriaOptions = computed<readonly SelectOption[]>(() => {
    const assigned = new Set(this.tutorMaterias().map((m) => m.id));
    return this.allMaterias()
      .filter((m) => !assigned.has(m.id))
      .map((m) => ({ value: m.id, label: `${m.codigo} – ${m.nombre}` }));
  });

  protected readonly assignForm = this.fb.nonNullable.group({
    materiaId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    forkJoin({
      tutors: this.iaService.listTutors(),
      materias: this.tutoringApi.listarMaterias(),
    }).subscribe({
      next: ({ tutors, materias }) => {
        this.tutors.set(tutors);
        this.allMaterias.set(materias);
      },
    });
  }

  setTutor(value: SelectValue): void {
    const id = value ? String(value) : '';
    this.selectedTutorId.set(id);
    this.tutorMaterias.set([]);
    this.errorKey.set(null);
    if (!id) {
      return;
    }
    this.loadingMaterias.set(true);
    this.tutoringApi.listarMateriasDelTutor(id).subscribe({
      next: (materias) => {
        this.tutorMaterias.set(materias);
        this.loadingMaterias.set(false);
      },
      error: () => {
        this.loadingMaterias.set(false);
        this.errorKey.set('admin.materiasTutores.loadError');
      },
    });
  }

  assign(): void {
    const tutorId = this.selectedTutorId();
    if (!tutorId || this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    const { materiaId } = this.assignForm.getRawValue();
    this.errorKey.set(null);
    this.tutoringApi.asignarMateria(tutorId, materiaId).subscribe({
      next: () => {
        this.assignForm.reset({ materiaId: '' });
        this.reloadTutorMaterias(tutorId);
      },
      error: () => this.errorKey.set('admin.materiasTutores.error'),
    });
  }

  remove(materiaId: string): void {
    const tutorId = this.selectedTutorId();
    if (!tutorId) {
      return;
    }
    this.errorKey.set(null);
    this.tutoringApi.removerMateria(tutorId, materiaId).subscribe({
      next: () => this.reloadTutorMaterias(tutorId),
      error: () => this.errorKey.set('admin.materiasTutores.error'),
    });
  }

  toggleAutorizacion(materia: MateriaDelTutorDto): void {
    const tutorId = this.selectedTutorId();
    if (!tutorId) {
      return;
    }
    this.errorKey.set(null);
    const request$ = materia.autorizada
      ? this.tutoringApi.desautorizarMateriaTutor(materia.tutorMateriaId)
      : this.tutoringApi.autorizarMateriaTutor(materia.tutorMateriaId);
    request$.subscribe({
      next: () => this.reloadTutorMaterias(tutorId),
      error: () => this.errorKey.set('admin.materiasTutores.error'),
    });
  }

  private reloadTutorMaterias(tutorId: string): void {
    this.tutoringApi.listarMateriasDelTutor(tutorId).subscribe({
      next: (materias) => this.tutorMaterias.set(materias),
    });
  }
}
