import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { WizardChromeComponent } from './wizard-chrome';

@Component({
  imports: [WizardChromeComponent],
  template: `
    <eci-wizard-chrome
      [pages]="pages"
      [step]="step()"
      [showChrome]="showChrome()"
      [isFirst]="isFirst()"
      [isLast]="isLast()"
      [pending]="pending()"
      [error]="error()"
      (back)="onBack()"
      (next)="onNext()"
      (finished)="onFinished()"
    >
      <p class="projected">Projected fields</p>
    </eci-wizard-chrome>
  `,
})
class WizardChromeHostComponent {
  readonly pages = [
    { titleKey: 'datosIa.pages.profile' },
    { titleKey: 'datosIa.pages.activity' },
    { titleKey: 'datosIa.pages.family' },
  ];
  readonly step = signal(0);
  readonly showChrome = signal(false);
  readonly isFirst = signal(true);
  readonly isLast = signal(false);
  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  backClicks = 0;
  nextClicks = 0;
  finishClicks = 0;

  onBack(): void {
    this.backClicks += 1;
  }

  onNext(): void {
    this.nextClicks += 1;
  }

  onFinished(): void {
    this.finishClicks += 1;
  }
}

describe('WizardChromeComponent', () => {
  let fixture: ComponentFixture<WizardChromeHostComponent>;

  const host = () => fixture.componentInstance;
  const element = () => fixture.nativeElement as HTMLElement;
  const buttons = () =>
    Array.from(element().querySelectorAll<HTMLButtonElement>('button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardChromeHostComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardChromeHostComponent);
    fixture.detectChanges();
  });

  it('projects content without rendering navigation chrome when disabled', () => {
    expect(element().querySelector('.projected')?.textContent).toContain('Projected fields');
    expect(element().querySelector('.dia__steps')).toBeNull();
    expect(element().querySelector('.dia__nav')).toBeNull();
    expect(element().querySelector('.dia__error')).toBeNull();
  });

  it('renders step state, error and emits back/next actions in the middle of the wizard', () => {
    host().showChrome.set(true);
    host().step.set(1);
    host().isFirst.set(false);
    host().error.set('register.errors.required');
    fixture.detectChanges();

    const steps = Array.from(element().querySelectorAll<HTMLElement>('.dia__step'));
    expect(steps).toHaveLength(3);
    expect(steps[0].classList).toContain('dia__step--done');
    expect(steps[1].classList).toContain('dia__step--active');
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(element().querySelector('.dia__error')).not.toBeNull();

    const renderedButtons = buttons();
    expect(renderedButtons).toHaveLength(2);
    renderedButtons[0].click();
    renderedButtons[1].click();

    expect(host().backClicks).toBe(1);
    expect(host().nextClicks).toBe(1);
    expect(host().finishClicks).toBe(0);
  });

  it('renders the final disabled action while pending and emits finished when enabled', () => {
    host().showChrome.set(true);
    host().step.set(2);
    host().isFirst.set(false);
    host().isLast.set(true);
    host().pending.set(true);
    fixture.detectChanges();

    let renderedButtons = buttons();
    expect(renderedButtons).toHaveLength(2);
    expect(renderedButtons[1].disabled).toBe(true);
    renderedButtons[1].click();
    expect(host().finishClicks).toBe(0);

    host().pending.set(false);
    fixture.detectChanges();
    renderedButtons = buttons();
    expect(renderedButtons[1].disabled).toBe(false);
    renderedButtons[1].click();

    expect(host().finishClicks).toBe(1);
  });
});
