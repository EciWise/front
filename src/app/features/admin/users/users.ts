import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { UserAdminService } from '../user-admin.service';

/** Administración de usuarios: tabla, alta individual y carga CSV masiva. */
@Component({
  selector: 'eci-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class AdminUsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserAdminService);

  protected readonly users = this.service.users;
  protected readonly roles = Object.values(Role);
  protected readonly importMessage = signal<string | null>(null);
  protected readonly importError = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: [Role.Student, [Validators.required]],
  });

  toggleActive(user: User): void {
    this.service.toggleActive(user.id);
  }

  changeRole(user: User, value: string): void {
    this.service.changeRole(user.id, value as Role);
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, role } = this.form.getRawValue();
    if (this.service.create(name, email, role)) {
      this.form.reset({ name: '', email: '', role: Role.Student });
    }
  }

  async onCsv(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    const count = this.service.importCsv(text);
    this.importError.set(count === 0);
    this.importMessage.set(count === 0 ? 'admin.csv.invalid' : 'admin.csv.imported');
    this.importCount.set(count);
    input.value = '';
  }

  protected readonly importCount = signal(0);
}
