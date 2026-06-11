import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IaProfileStatusService } from '../../../core/ia/ia-profile-status.service';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { CardComponent } from '../../../shared/ui/card/card';

/**
 * Entrada en Inicio para completar la informacion adicional de IA.
 * Los datos iniciales capturados en el registro no se piden de nuevo aqui.
 */
@Component({
  selector: 'eci-ia-profile-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent],
  templateUrl: './ia-profile-section.html',
  styleUrl: './ia-profile-section.css',
})
export class IaProfileSectionComponent {
  private readonly router = inject(Router);
  private readonly status = inject(IaProfileStatusService);

  protected readonly show = computed(() => this.status.loaded() && !this.status.dropoutComplete());

  constructor() {
    if (!this.status.loaded()) {
      this.status.load();
    }
  }

  start(): Promise<boolean> {
    return this.router.navigate(['/student/profile'], {
      queryParams: { iaInfo: '1' },
    });
  }
}
