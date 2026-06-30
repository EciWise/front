import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { TutoringRequestsService } from '../requests.service';
import { TutoringRequest } from '../tutor.models';

/** Solicitudes de tutoría de los estudiantes con aceptar/rechazar. */
@Component({
  selector: 'eci-tutor-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, ButtonComponent, IconComponent],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class TutorRequestsComponent {
  private readonly service = inject(TutoringRequestsService);
  protected readonly requests = this.service.requests;

  accept(req: TutoringRequest): void {
    this.service.accept(req.id);
  }

  reject(req: TutoringRequest): void {
    this.service.reject(req.id);
  }
}
