import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { TutorHistoryService } from '../history.service';

/** Historial de tutorías del tutor. */
@Component({
  selector: 'eci-tutor-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class TutorHistoryComponent {
  private readonly service = inject(TutorHistoryService);
  protected readonly entries = this.service.entries;
}
