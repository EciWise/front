import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EthicsMessageComponent } from '../../ethics/ethics-message';
import { IconComponent } from '../../ui/icon/icon';
import { NavItem } from '../nav-items';

/**
 * Cuadrícula de tarjetas de acceso a las secciones de un rol.
 * Cuando el ítem tiene `descKey` muestra la tarjeta extendida del diseño
 * (icono + título + descripción + "Abrir →"); de lo contrario usa la
 * tarjeta compacta (icono + etiqueta).
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
          @if (item.descKey) {
            <a class="grid__card grid__card--rich" [routerLink]="item.route">
              <span class="grid__icon"><eci-icon [name]="item.icon" [size]="26" /></span>
              <span class="grid__body">
                <span class="grid__label">{{ item.labelKey | translate }}</span>
                <span class="grid__desc">{{ item.descKey | translate }}</span>
              </span>
              <span class="grid__open" aria-hidden="true">
                {{ 'dash.open' | translate }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 6 6 6-6 6"/>
                </svg>
              </span>
            </a>
          } @else {
            <a class="grid__card" [routerLink]="item.route">
              <span class="grid__icon"><eci-icon [name]="item.icon" [size]="28" /></span>
              <span class="grid__label">{{ item.labelKey | translate }}</span>
            </a>
          }
        </li>
      }
    </ul>
  `,
  styleUrls: ['./dashboard-grid.css', '../../styles/card-surface.css'],
})
export class DashboardGridComponent {
  readonly items = input.required<readonly NavItem[]>();
}
