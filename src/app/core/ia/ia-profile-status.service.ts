import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { IaDataService } from './ia-data.service';
import { DatosIa } from './ia.model';

const PERF_KEYS = [
  'gender',
  'ethnicity',
  'parentalEducation',
  'studyTimeWeekly',
  'absences',
  'tutoring',
  'parentalSupport',
  'extracurricular',
  'sports',
  'music',
  'volunteering',
] as const;

const DROPOUT_KEYS = [
  'maritalStatus',
  'applicationMode',
  'applicationOrder',
  'course',
  'previousQualification',
  'nacionality',
  'motherQualification',
  'fatherQualification',
  'motherOccupation',
  'fatherOccupation',
  'displaced',
  'educationalSpecialNeeds',
  'debtor',
  'tuitionFeesUpToDate',
  'scholarshipHolder',
  'ageAtEnrollment',
  'international',
  'curricularUnits1stSemCredited',
  'curricularUnits1stSemEnrolled',
  'curricularUnits1stSemEvaluations',
  'curricularUnits1stSemApproved',
] as const;

type IaProfileData = Partial<DatosIa>;

function complete(data: IaProfileData | null, keys: readonly string[]): boolean {
  if (!data) {
    return false;
  }
  const rec = data as Record<string, unknown>;
  return keys.every((k) => rec[k] !== null && rec[k] !== undefined);
}

function mergeData(
  ...sources: readonly (IaProfileData | null | undefined)[]
): IaProfileData | null {
  const merged: IaProfileData = {};

  for (const source of sources) {
    if (!source) {
      continue;
    }
    const entries = Object.entries(source).filter(
      ([, value]) => value !== null && value !== undefined,
    );
    Object.assign(merged, Object.fromEntries(entries));
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

/**
 * Estado del perfil de IA del estudiante autenticado. Expone si los datos de
 * cada modelo están completos para decidir cuándo mostrar el pop-up de
 * rendimiento (Google) y la sección de deserción del dashboard.
 */
@Injectable({ providedIn: 'root' })
export class IaProfileStatusService {
  private readonly auth = inject(AuthService);
  private readonly dataService = inject(IaDataService);

  private readonly _data = signal<IaProfileData | null>(this.sessionData());
  private readonly _loaded = signal(false);
  private currentUserId = this.auth.user()?.id ?? null;

  readonly data = this._data.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly performanceComplete = computed(() => complete(this._data(), PERF_KEYS));
  readonly dropoutComplete = computed(() => complete(this._data(), DROPOUT_KEYS));

  /** Carga (o recarga) los datos de IA del estudiante. */
  load(): void {
    this.syncUser();
    const sessionData = this.sessionData();
    const currentData = this._data();
    this._data.set(mergeData(this._data(), sessionData));

    this.dataService.getMyData().subscribe({
      next: (data) => {
        this._data.set(mergeData(sessionData, data));
        this._loaded.set(true);
      },
      error: () => {
        this._data.set(mergeData(sessionData, currentData));
        this._loaded.set(true);
      },
    });
  }

  private sessionData(): IaProfileData | null {
    return this.auth.user()?.datosIa ?? null;
  }

  private syncUser(): void {
    const userId = this.auth.user()?.id ?? null;
    if (userId === this.currentUserId) {
      return;
    }
    this.currentUserId = userId;
    this._data.set(this.sessionData());
    this._loaded.set(false);
  }
}
