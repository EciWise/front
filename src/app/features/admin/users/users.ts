import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { SectionTabsComponent, SectionTab } from '../../../shared/ui/section-tabs/section-tabs';
import { BulkResultDialogComponent } from '../bulk-result-dialog/bulk-result-dialog';
import { BulkUploadResult, UserAdminService } from '../user-admin.service';

/** Administración de usuarios: tabla con datos reales y carga masiva por CSV. */
@Component({
  selector: 'eci-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    SectionTabsComponent,
    BulkResultDialogComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class AdminUsersComponent implements OnInit {
  private readonly service = inject(UserAdminService);

  protected readonly users = this.service.users;
  protected readonly roles = Object.values(Role);
  protected readonly roleOptions: readonly SelectOption[] = this.roles.map((role) => ({
    value: role,
    labelKey: `roles.${role}`,
  }));

  /** Secciones de la pantalla (caben sin scroll de página). */
  protected readonly sections: readonly SectionTab[] = [
    { id: 'list', labelKey: 'admin.users.tabList', icon: 'users' },
    { id: 'import', labelKey: 'admin.users.tabImport', icon: 'csv' },
  ];
  protected readonly section = signal('list');

  /** Estado de la carga CSV: mensaje a mostrar, si es error y resultado. */
  protected readonly uploading = signal(false);
  protected readonly importMessage = signal<string | null>(null);
  protected readonly importError = signal(false);
  protected readonly importCreated = signal(0);
  protected readonly importErrors = signal(0);
  /** Resultado de la última carga; al estar presente, abre el pop-up. */
  protected readonly uploadResult = signal<BulkUploadResult | null>(null);

  ngOnInit(): void {
    this.service.load();
  }

  toggleActive(user: User): void {
    this.service.toggleActive(user.id);
  }

  changeRole(user: User, value: SelectValue): void {
    this.service.changeRole(user.id, value as Role);
  }

  onCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.importMessage.set('admin.csv.uploading');
    this.importError.set(false);
    this.service.bulkUploadCsv(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.importCreated.set(res.creados);
        this.importErrors.set(res.errores.length);
        this.importError.set(res.creados === 0);
        this.importMessage.set('admin.csv.result');
        this.uploadResult.set(res);
      },
      error: () => {
        this.uploading.set(false);
        this.importError.set(true);
        this.importMessage.set('admin.csv.error');
      },
    });
    input.value = '';
  }

  closeResult(): void {
    this.uploadResult.set(null);
  }
}
