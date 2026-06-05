import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EthicsMessageComponent } from '../../ethics/ethics-message';
import { IconComponent } from '../../ui/icon/icon';
import { NavItem } from '../nav-items';

/**
 * Cuadrícula de tarjetas de acceso a las secciones de un rol, con el mensaje
 * de esfuerzo y ética. Reutilizada por los dashboards de cada rol.
 */
@Component({
  selector: 'eci-dashboard-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, EthicsMessageComponent, IconComponent],
  template: `
    <eci-ethics-message />
    <ul class="grid">
      @for (item of items(); track item.route) {
        <li>
          <a class="grid__card" [routerLink]="item.route">
            <span class="grid__icon"><eci-icon [name]="item.icon" [size]="28" /></span>
            <span class="grid__label">{{ item.labelKey | translate }}</span>
          </a>
        </li>
      }
    </ul>
  `,
  styleUrls: ['./dashboard-grid.css', '../../styles/card-surface.css'],
})
export class DashboardGridComponent {
  readonly items = input.required<readonly NavItem[]>();
}
