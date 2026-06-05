import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { Asignacion, IaAdminService, UsuarioBasico } from '../../../core/ia/ia-admin.service';

/** Asignación de estudiantes a tutores (solo admin). */
@Component({
  selector: 'eci-admin-assignments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    SelectComponent,
  ],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class AdminAssignmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(IaAdminService);

  protected readonly assignments = signal<Asignacion[]>([]);
  protected readonly tutors = signal<UsuarioBasico[]>([]);
  protected readonly estudiantes = signal<UsuarioBasico[]>([]);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly tutorOptions = computed<readonly SelectOption[]>(() =>
    this.tutors().map((t) => ({
      value: t.id,
      label: `${t.nombre} ${t.apellido} - ${t.email}`,
    })),
  );
  protected readonly estudianteOptions = computed<readonly SelectOption[]>(() =>
    this.estudiantes().map((e) => ({
      value: e.id,
      label: `${e.nombre} ${e.apellido} - ${e.email}`,
    })),
  );

  protected readonly form = this.fb.nonNullable.group({
    tutorId: ['', [Validators.required]],
    estudianteId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    forkJoin({
      asignaciones: this.service.listAssignments(),
      tutors: this.service.listTutors(),
      estudiantes: this.service.listEstudiantes(),
    }).subscribe({
      next: ({ asignaciones, tutors, estudiantes }) => {
        this.assignments.set(asignaciones);
        this.tutors.set(tutors);
        this.estudiantes.set(estudiantes);
      },
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorKey.set(null);
    const { tutorId, estudianteId } = this.form.getRawValue();
    this.service.createAssignment(tutorId, estudianteId).subscribe({
      next: () => {
        this.form.reset({ tutorId: '', estudianteId: '' });
        this.reload();
      },
      error: () => this.errorKey.set('admin.assignments.error'),
    });
  }

  remove(id: string): void {
    this.service.deleteAssignment(id).subscribe({ next: () => this.reload() });
  }

  private reload(): void {
    this.service.listAssignments().subscribe({ next: (a) => this.assignments.set(a) });
  }
}
