import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { DatosIa } from '../../../core/ia/ia.model';
import { IaDataService } from '../../../core/ia/ia-data.service';
import { IaProfileStatusService } from '../../../core/ia/ia-profile-status.service';
import { roleLabelKey as roleLabelKeyFor } from '../../../core/models/role.enum';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { DropoutIaFieldsComponent } from '../../auth/dropout-ia-fields/dropout-ia-fields';
import { buildDropoutGroup, buildDropoutPayload } from '../../auth/dropout-ia-form';

const ACADEMIC_PROGRAMS = [
  'Ingeniería en Biotecnología',
  'Ingeniería de Inteligencia Artificial',
  'Ingeniería de Ciberseguridad',
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Electrónica',
  'Ingeniería Eléctrica',
  'Ingeniería Mecánica',
  'Ingeniería Ambiental',
  'Ingeniería Biomédica',
  'Administración de Empresas',
  'Economía',
  'Matemáticas',
] as const;

const DROPOUT_SUMMARY_KEYS = [
  'maritalStatus',
  'nacionality',
  'ageAtEnrollment',
  'displaced',
  'international',
  'motherQualification',
  'fatherQualification',
  'motherOccupation',
  'fatherOccupation',
  'applicationMode',
  'course',
  'previousQualification',
  'applicationOrder',
  'educationalSpecialNeeds',
  'curricularUnits1stSemEnrolled',
  'curricularUnits1stSemApproved',
  'curricularUnits1stSemEvaluations',
  'curricularUnits1stSemCredited',
  'scholarshipHolder',
  'debtor',
  'tuitionFeesUpToDate',
] as const satisfies readonly (keyof DatosIa)[];

const YES_NO_KEYS = new Set<keyof DatosIa>([
  'displaced',
  'international',
  'educationalSpecialNeeds',
  'scholarshipHolder',
  'debtor',
  'tuitionFeesUpToDate',
]);

interface IaSummaryItem {
  readonly key: keyof DatosIa;
  readonly labelKey: string;
  readonly value: string;
  readonly valueKey?: string;
}

/** Perfil del estudiante: datos academicos persistidos y perfil IA. */
@Component({
  selector: 'eci-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    AvatarComponent,
    IconComponent,
    ModalComponent,
    SelectComponent,
    DropoutIaFieldsComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly dataService = inject(IaDataService);
  protected readonly status = inject(IaProfileStatusService);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.auth.user;
  protected readonly profileSaved = signal(false);
  protected readonly profileSaving = signal(false);
  protected readonly profileError = signal(false);
  protected readonly confirmCareerLockOpen = signal(false);
  protected readonly aiExpanded = signal(false);
  protected readonly aiSaving = signal(false);
  protected readonly aiSaved = signal(false);
  protected readonly aiError = signal(false);
  protected readonly careersLocked = computed(() => Boolean(this.user()?.program));

  protected readonly programOptions: readonly SelectOption[] = ACADEMIC_PROGRAMS.map((program) => ({
    value: program,
    label: program,
  }));

  protected readonly secondaryProgramOptions: readonly SelectOption[] = [
    { value: '', labelKey: 'profile.noSecondProgram' },
    ...this.programOptions,
  ];

  protected readonly form = this.fb.nonNullable.group({
    program: [this.user()?.program ?? '', [Validators.required]],
    secondaryProgram: [this.user()?.secondaryProgram ?? ''],
  });

  protected readonly iaForm = this.fb.nonNullable.group({
    dropout: buildDropoutGroup(this.fb),
  });

  protected readonly showIaForm = computed(
    () => this.status.loaded() && !this.status.dropoutComplete(),
  );

  protected readonly dropoutSummary = computed<readonly IaSummaryItem[]>(() => {
    const data = this.status.data();
    if (!data) {
      return [];
    }
    return DROPOUT_SUMMARY_KEYS.flatMap((key) => {
      const raw = data[key];
      if (raw === null || raw === undefined) {
        return [];
      }
      let valueKey: string | undefined;
      if (YES_NO_KEYS.has(key)) {
        const yesNoKey = Number(raw) === 1 ? 'yes' : 'no';
        valueKey = `datosIa.yesNo.${yesNoKey}`;
      }
      return [
        {
          key,
          labelKey: `datosIa.dropout.labels.${String(key)}`,
          value: String(raw),
          valueKey,
        },
      ];
    });
  });

  protected get dropoutGroup(): FormGroup {
    return this.iaForm.controls.dropout;
  }

  protected selectedPrimaryProgram(): string {
    return this.form.controls.program.value;
  }

  protected selectedSecondaryProgram(): string {
    return this.form.controls.secondaryProgram.value;
  }

  protected roleLabelKey(role: string): string {
    return roleLabelKeyFor(role);
  }

  constructor() {
    effect(() => {
      if (this.careersLocked()) {
        this.form.controls.program.disable({ emitEvent: false });
        this.form.controls.secondaryProgram.disable({ emitEvent: false });
        return;
      }

      this.form.controls.program.enable({ emitEvent: false });
      this.form.controls.secondaryProgram.enable({ emitEvent: false });
    });

    if (!this.status.loaded()) {
      this.status.load();
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('iaInfo') === '1') {
        this.openIaPanel();
      }
    });
  }

  saveProfile(): void {
    if (this.careersLocked() || this.profileSaving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.profileError.set(false);
    this.profileSaved.set(false);
    this.confirmCareerLockOpen.set(true);
  }

  confirmCareerLock(): void {
    if (this.careersLocked() || this.profileSaving()) {
      this.confirmCareerLockOpen.set(false);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.confirmCareerLockOpen.set(false);
      return;
    }

    this.confirmCareerLockOpen.set(false);
    this.persistProfile();
  }

  private persistProfile(): void {
    this.profileSaving.set(true);
    this.profileError.set(false);
    this.profileSaved.set(false);
    const value = this.form.getRawValue();
    this.auth
      .updateProfile({
        program: value.program,
        secondaryProgram: value.secondaryProgram,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.profileSaving.set(false);
          this.profileSaved.set(true);
          this.form.markAsPristine();
        },
        error: () => {
          this.profileSaving.set(false);
          this.profileError.set(true);
        },
      });
  }

  openIaPanel(): void {
    this.aiExpanded.set(true);
    setTimeout(() => {
      this.host.nativeElement
        .querySelector('#profile-ia')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  submitIa(): void {
    if (this.iaForm.invalid || this.aiSaving()) {
      this.iaForm.markAllAsTouched();
      return;
    }

    this.aiSaving.set(true);
    this.aiError.set(false);
    const payload = buildDropoutPayload(this.iaForm.controls.dropout.getRawValue());
    this.dataService.saveMyData(payload).subscribe({
      next: () => {
        this.aiSaving.set(false);
        this.aiSaved.set(true);
        this.aiExpanded.set(false);
        this.status.load();
      },
      error: () => {
        this.aiSaving.set(false);
        this.aiError.set(true);
      },
    });
  }
}
