import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AppError } from '../../../core/errors/app-error';
import { IaDataService } from '../../../core/ia/ia-data.service';
import { IaProfileStatusService } from '../../../core/ia/ia-profile-status.service';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { CompleteProfileDialogComponent } from './complete-profile-dialog';

interface DialogHarness {
  readonly form: FormGroup;
  readonly datosIaGroup: FormGroup;
  readonly loading: () => boolean;
  readonly errorKey: () => string | null;
  submit(): void;
}

describe('CompleteProfileDialogComponent', () => {
  let fixture: ComponentFixture<CompleteProfileDialogComponent>;
  let saveMyData: ReturnType<typeof vi.fn>;
  let load: ReturnType<typeof vi.fn>;

  const cmp = (): DialogHarness => fixture.componentInstance as unknown as DialogHarness;
  const fillDatosIa = (): void => {
    cmp().datosIaGroup.patchValue({
      gender: 0,
      ethnicity: 1,
      parentalEducation: 2,
      studyTimeWeekly: 8,
      absences: 1,
      parentalSupport: 3,
      tutoring: true,
      extracurricular: true,
      sports: false,
      music: false,
      volunteering: true,
    });
  };

  beforeEach(async () => {
    saveMyData = vi.fn(() => of({}));
    load = vi.fn();

    await TestBed.configureTestingModule({
      imports: [CompleteProfileDialogComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: IaDataService, useValue: { saveMyData } },
        { provide: IaProfileStatusService, useValue: { load } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteProfileDialogComponent);
    fixture.detectChanges();
  });

  it('no guarda si los datos IA obligatorios estan incompletos', () => {
    cmp().submit();

    expect(saveMyData).not.toHaveBeenCalled();
    expect(cmp().form.touched).toBe(true);
  });

  it('guarda datos IA normalizados y recarga el estado del perfil', () => {
    fillDatosIa();

    cmp().submit();

    expect(saveMyData).toHaveBeenCalledWith({
      gender: 0,
      ethnicity: 1,
      parentalEducation: 2,
      studyTimeWeekly: 8,
      absences: 1,
      parentalSupport: 3,
      tutoring: 1,
      extracurricular: 1,
      sports: 0,
      music: 0,
      volunteering: 1,
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('mantiene el dialogo en pantalla y expone error si falla el guardado', () => {
    saveMyData.mockReturnValue(throwError(() => new AppError('errors.server')));
    fillDatosIa();

    cmp().submit();

    expect(cmp().loading()).toBe(false);
    expect(cmp().errorKey()).toBe('errors.server');
    expect(load).not.toHaveBeenCalled();
  });
});
