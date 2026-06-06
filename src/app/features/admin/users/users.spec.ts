import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { BulkUploadResult, UserAdminService } from '../user-admin.service';
import { AdminUsersComponent } from './users';

interface AdminHarness {
  readonly section: SignalLike<string>;
  readonly uploading: SignalLike<boolean>;
  readonly importMessage: SignalLike<string | null>;
  readonly importError: SignalLike<boolean>;
  readonly importCreated: SignalLike<number>;
  readonly importErrors: SignalLike<number>;
  readonly uploadResult: SignalLike<BulkUploadResult | null>;
  onCsv(event: Event): void;
  toggleActive(user: User): void;
  changeRole(user: User, value: Role): void;
  closeResult(): void;
}

interface SignalLike<T> {
  (): T;
  set(value: T): void;
}

const result: BulkUploadResult = {
  total: 2,
  creados: 1,
  errores: [{ fila: 2, email: 'dup@test.com', motivo: 'email_ya_existe' }],
  usuarios: [
    {
      email: 'ana@test.com',
      nombre: 'Ana',
      apellido: 'Diaz',
      rol: 'estudiante',
      passwordTemporal: 'tmp123',
    },
  ],
};

describe('AdminUsersComponent', () => {
  let fixture: ComponentFixture<AdminUsersComponent>;
  let load: ReturnType<typeof vi.fn>;
  let toggleActive: ReturnType<typeof vi.fn>;
  let changeRole: ReturnType<typeof vi.fn>;
  let bulkUploadCsv: ReturnType<typeof vi.fn>;
  let users: ReturnType<typeof signal<User[]>>;

  const user: User = {
    id: 'u1',
    name: 'Ana Diaz',
    email: 'ana@test.com',
    role: Role.Student,
    active: true,
  };
  const cmp = (): AdminHarness => fixture.componentInstance as unknown as AdminHarness;
  const csvEvent = (file: File): Event => {
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    const event = new Event('change');
    Object.defineProperty(event, 'target', { configurable: true, value: input });
    return event;
  };

  beforeEach(async () => {
    load = vi.fn();
    toggleActive = vi.fn();
    changeRole = vi.fn();
    bulkUploadCsv = vi.fn(() => of(result));
    users = signal<User[]>([user]);

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: UserAdminService,
          useValue: {
            users: users.asReadonly(),
            load,
            toggleActive,
            changeRole,
            bulkUploadCsv,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
  });

  it('carga usuarios al iniciar y delega cambios de rol/estado', () => {
    expect(load).toHaveBeenCalledTimes(1);

    cmp().changeRole(user, Role.Admin);
    cmp().toggleActive(user);

    expect(changeRole).toHaveBeenCalledWith('u1', Role.Admin);
    expect(toggleActive).toHaveBeenCalledWith('u1');
  });

  it('renderiza tabla y estado vacio desde la pestana de usuarios', () => {
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('.admin-table')).not.toBeNull();
    expect(root.textContent).toContain('Ana Diaz');
    expect(root.textContent).toContain('ana@test.com');
    expect(root.querySelector('.admin-status--on')).not.toBeNull();

    users.set([]);
    fixture.detectChanges();

    expect(root.querySelector('.admin-table')).toBeNull();
    expect(root.querySelector('.admin__empty')).not.toBeNull();
  });

  it('sube CSV, resume el resultado y abre el dialogo de detalle', () => {
    const root: HTMLElement = fixture.nativeElement;
    const file = new File(['nombre,apellido,email,rol\n'], 'users.csv', { type: 'text/csv' });

    cmp().onCsv(csvEvent(file));
    fixture.detectChanges();

    expect(bulkUploadCsv).toHaveBeenCalledWith(file);
    expect(cmp().uploading()).toBe(false);
    expect(cmp().importCreated()).toBe(1);
    expect(cmp().importErrors()).toBe(1);
    expect(cmp().importError()).toBe(false);
    expect(cmp().importMessage()).toBe('admin.csv.result');
    expect(cmp().uploadResult()).toBe(result);
    expect(root.querySelector('eci-bulk-result-dialog')).not.toBeNull();
  });

  it('sube CSV desde la pestana de importacion y permite cerrar el resultado', () => {
    const root: HTMLElement = fixture.nativeElement;
    const file = new File(['nombre,apellido,email,rol\n'], 'users.csv', { type: 'text/csv' });
    cmp().section.set('import');
    fixture.detectChanges();

    expect(root.querySelector('.admin__upload')).not.toBeNull();
    const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(bulkUploadCsv).toHaveBeenCalledWith(file);
    expect(root.querySelector('output.admin__import')?.getAttribute('aria-live')).toBe('polite');
    expect(root.querySelector('.admin__import-link')).not.toBeNull();
    expect(root.querySelector('eci-bulk-result-dialog')).not.toBeNull();

    cmp().closeResult();
    fixture.detectChanges();
    expect(cmp().uploadResult()).toBeNull();
    expect(root.querySelector('eci-bulk-result-dialog')).toBeNull();
  });

  it('marca la importacion como error cuando el CSV no crea usuarios', () => {
    bulkUploadCsv.mockReturnValue(of({ ...result, creados: 0, usuarios: [] }));
    const file = new File(['bad'], 'users.csv', { type: 'text/csv' });

    cmp().onCsv(csvEvent(file));

    expect(cmp().importError()).toBe(true);
    expect(cmp().importCreated()).toBe(0);
    expect(cmp().importMessage()).toBe('admin.csv.result');
  });

  it('restaura estado de carga si falla el upload', () => {
    bulkUploadCsv.mockReturnValue(throwError(() => new Error('upload failed')));
    const file = new File(['bad'], 'users.csv', { type: 'text/csv' });

    cmp().onCsv(csvEvent(file));

    expect(cmp().uploading()).toBe(false);
    expect(cmp().importError()).toBe(true);
    expect(cmp().importMessage()).toBe('admin.csv.error');
    expect(cmp().uploadResult()).toBeNull();
  });
});
