import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { IconComponent } from '../../ui/icon/icon';
import { MathDecorComponent } from '../../ui/math-decor/math-decor';
import { navGroupsFor } from '../nav-items';

/** Navegación lateral con ítems agrupados por sección según el rol activo. */
@Component({
  selector: 'eci-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, IconComponent, MathDecorComponent],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})
export class SideNavComponent {
  private readonly auth = inject(AuthService);
  protected readonly groups = computed(() => navGroupsFor(this.auth.role()));
}
