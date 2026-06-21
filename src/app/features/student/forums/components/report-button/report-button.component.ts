import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalComponent } from '../../../../../shared/ui/modal/modal';
import { ButtonComponent } from '../../../../../shared/ui/button/button';
import { IconComponent } from '../../../../../shared/ui/icon/icon';
import { ReportsService } from '../../reports.service';
import { CreateReportRequest, ReportContentType } from '../../community.models';

@Component({
  selector: 'eci-report-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, ModalComponent, ButtonComponent, IconComponent],
  styleUrl: './report-button.component.css',
  template: `
    <eci-button
      variant="ghost"
      [ariaLabel]="'forums.report.flag' | translate"
      (buttonClick)="openModal()"
    >
      <eci-icon name="ethics" [size]="15" />
    </eci-button>

    <eci-modal [(open)]="showModal" titleKey="forums.report.title">
      @if (done()) {
        <p class="report-done">{{ 'forums.report.done' | translate }}</p>
        <eci-button [block]="true" (buttonClick)="showModal.set(false)">
          {{ 'common.confirm' | translate }}
        </eci-button>
      } @else {
        <form class="report-form" (ngSubmit)="submit()">
          <label>
            <span>{{ 'forums.report.reason' | translate }}</span>
            <textarea
              [ngModel]="reason()"
              (ngModelChange)="reason.set($event)"
              name="reportReason"
              rows="4"
              [placeholder]="'forums.report.reasonPlaceholder' | translate"
            ></textarea>
          </label>
          <eci-button
            type="submit"
            [block]="true"
            [disabled]="!reason().trim() || submitting()"
          >
            {{ 'forums.report.submit' | translate }}
          </eci-button>
        </form>
      }
    </eci-modal>
  `,
})
export class ReportButtonComponent {
  private readonly reportsService = inject(ReportsService);

  readonly contentId = input.required<string>();
  readonly contentType = input.required<ReportContentType>();

  protected readonly showModal = signal(false);
  protected readonly reason = signal('');
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);

  protected openModal(): void {
    this.reason.set('');
    this.done.set(false);
    this.showModal.set(true);
  }

  protected submit(): void {
    const reason = this.reason().trim();
    if (!reason || this.submitting()) return;
    this.submitting.set(true);
    const req: CreateReportRequest = {
      contentId: this.contentId(),
      contentType: this.contentType(),
      reason,
    };
    this.reportsService.createReport(req).subscribe({
      next: () => {
        this.done.set(true);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }
}
