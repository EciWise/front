import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { SectionTab, SectionTabsComponent } from './section-tabs';

@Component({
  standalone: true,
  imports: [SectionTabsComponent],
  template: `
    <eci-section-tabs
      [tabs]="tabs()"
      [active]="active()"
      (activeChange)="active.set($event)"
    />
  `,
})
class SectionTabsHostComponent {
  readonly active = signal('list');
  readonly tabs = signal<readonly SectionTab[]>([
    { id: 'list', labelKey: 'tasks.viewList', icon: 'tasks' },
    { id: 'agenda', labelKey: 'tasks.viewAgenda', icon: 'schedule' },
    { id: 'plain', labelKey: 'tasks.today' },
  ]);
}

describe('SectionTabsComponent', () => {
  let fixture: ComponentFixture<SectionTabsHostComponent>;

  const host = () => fixture.componentInstance;
  const element = () => fixture.nativeElement as HTMLElement;
  const tabs = () =>
    Array.from(element().querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const indicator = () =>
    element().querySelector<HTMLElement>('.seg__indicator');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTabsHostComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionTabsHostComponent);
    fixture.detectChanges();
  });

  it('marks the active tab and moves the active state when a user selects another section', () => {
    const renderedTabs = tabs();

    expect(renderedTabs).toHaveLength(3);
    expect(element().querySelector('[role="tablist"]')).not.toBeNull();
    expect(element().querySelectorAll('eci-icon')).toHaveLength(2);
    expect(indicator()).not.toBeNull();
    expect(renderedTabs[0].getAttribute('aria-selected')).toBe('true');
    expect(renderedTabs[0].classList.contains('seg__btn--active')).toBe(true);
    expect(renderedTabs[1].getAttribute('aria-selected')).toBe('false');

    renderedTabs[1].click();
    fixture.detectChanges();

    expect(host().active()).toBe('agenda');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs()[1].classList.contains('seg__btn--active')).toBe(true);
  });

  it('marks no tab as active when the active id is unknown', () => {
    host().active.set('missing');
    fixture.detectChanges();

    expect(element().querySelector('.seg__btn--active')).toBeNull();
    expect(indicator()).not.toBeNull();
  });
});
