import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../card/card';
import { PageHeaderComponent } from '../page-header/page-header';
import { IconName } from '../icon/icon';

/**
 * Marcador de posición para secciones aún no implementadas. El título y el
 * icono se toman de los datos de la ruta. Se reemplazará por el componente
 * real de la sección en fases posteriores.
 */
@Component({
  selector: 'eci-section-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, PageHeaderComponent],
  template: `
    <eci-page-header [titleKey]="titleKey()" [icon]="icon()" />
    <eci-card>
      <p class="placeholder">{{ 'common.loading' | translate }}</p>
    </eci-card>
  `,
  styles: [
    `
      .placeholder {
        margin: 0;
        color: var(--text-muted);
      }
    `,
  ],
})
export class SectionPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  protected readonly titleKey = () => (this.data()['titleKey'] as string) ?? 'app.name';
  protected readonly icon = () => (this.data()['icon'] as IconName | undefined) ?? null;
}
