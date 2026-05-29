import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { MonitoriasService } from './monitorias.service';
import { Monitoria } from './monitoria.model';

/** Listado de monitorías disponibles y solicitud de cupo. */
@Component({
  selector: 'eci-monitorias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, ButtonComponent],
  templateUrl: './monitorias.html',
  styleUrl: './monitorias.css',
})
export class MonitoriasComponent {
  private readonly service = inject(MonitoriasService);
  protected readonly items = this.service.items;

  request(item: Monitoria): void {
    this.service.request(item.id);
  }

  statusKey(item: Monitoria): string {
    return `monitorias.${item.status}`;
  }
}
