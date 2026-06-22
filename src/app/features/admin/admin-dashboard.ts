import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../core/models/role.enum';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { navItemsFor } from '../../shared/layout/nav-items';
import { AuthService } from '../../core/auth/auth.service';
import { IaAdminService, PlatformStats } from '../../core/ia/ia-admin.service';

@Component({
  selector: 'eci-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, DashboardGridComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly iaService = inject(IaAdminService);

  protected readonly user = this.auth.user;
  protected readonly stats = signal<PlatformStats | null>(null);
  protected readonly items = navItemsFor(Role.Admin).filter((i) => !i.exact);

  ngOnInit(): void {
    this.iaService.platformStats().subscribe({ next: (s) => this.stats.set(s), error: () => undefined });
  }
}
