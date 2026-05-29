import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../shared/ui/card/card';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';

/** Centro de ayuda con el manual de uso de la plataforma. */
@Component({
  selector: 'eci-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, PageHeaderComponent],
  template: `
    <eci-page-header titleKey="help.title" icon="help" />
    <p class="help__subtitle">{{ 'help.subtitle' | translate }}</p>
    <div class="help__sections">
      @for (section of sections; track section.titleKey) {
        <eci-card>
          <h2 class="help__section-title">{{ section.titleKey | translate }}</h2>
          <p class="help__section-body">{{ section.body }}</p>
        </eci-card>
      }
    </div>
  `,
  styles: [
    `
      .help__subtitle {
        margin: 0 0 var(--space-6);
        color: var(--text-muted);
      }
      .help__sections {
        display: grid;
        gap: var(--space-4);
        max-width: 48rem;
      }
      .help__section-title {
        margin: 0 0 var(--space-2);
        font-size: 1.0625rem;
      }
      .help__section-body {
        margin: 0;
        color: var(--text-muted);
        line-height: 1.5;
      }
    `,
  ],
})
export class HelpComponent {
  protected readonly sections = [
    {
      titleKey: 'nav.dashboard',
      body: 'Usa el logo en cualquier momento para regresar al inicio de tu área.',
    },
    {
      titleKey: 'theme.toggle',
      body: 'Alterna entre tema claro y oscuro desde la barra superior. Tu preferencia se guarda.',
    },
    {
      titleKey: 'a11y.toggle',
      body: 'Activa el modo de accesibilidad con el botón de la barra superior o con el atajo Alt + A.',
    },
    {
      titleKey: 'floating.assistant',
      body: 'El asistente de IA y los mensajes están siempre disponibles en los botones de la esquina inferior derecha.',
    },
  ];
}
