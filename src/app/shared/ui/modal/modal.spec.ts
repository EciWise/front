import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { ModalComponent } from './modal';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <eci-modal
      [open]="open()"
      (openChange)="open.set($event)"
      [titleKey]="titleKey()"
      [size]="size()"
    >
      <button type="button" class="projected-action">Guardar</button>
    </eci-modal>
  `,
})
class ModalHostComponent {
  readonly open = signal(true);
  readonly titleKey = signal('tasks.addTitle');
  readonly size = signal<'default' | 'wide'>('default');
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalHostComponent>;

  const host = (): ModalHostComponent => fixture.componentInstance;
  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHostComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHostComponent);
    fixture.detectChanges();
  });

  it('renderiza titulo traducido, contenido proyectado y enfoca el dialogo al abrir', async () => {
    await fixture.whenStable();

    const dialog = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBeTruthy();
    expect(el().querySelector('.modal__title')?.textContent?.trim()).not.toBe('');
    expect(el().querySelector('.projected-action')).not.toBeNull();
    expect(document.activeElement).toBe(dialog);
  });

  it('cierra con el boton, el fondo y Escape', () => {
    el().querySelector<HTMLButtonElement>('.modal__close')!.click();
    fixture.detectChanges();

    expect(host().open()).toBe(false);
    expect(el().querySelector('[role="dialog"]')).toBeNull();

    host().open.set(true);
    fixture.detectChanges();
    el().querySelector<HTMLElement>('.modal-backdrop')!.click();
    fixture.detectChanges();

    expect(host().open()).toBe(false);

    host().open.set(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(host().open()).toBe(false);
  });

  it('omite titulo y aria-label cuando no recibe titleKey', () => {
    host().titleKey.set('');
    fixture.detectChanges();

    const dialog = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBeNull();
    expect(el().querySelector('.modal__title')).toBeNull();
  });

  it('aplica la variante amplia cuando se solicita', () => {
    host().size.set('wide');
    fixture.detectChanges();

    expect(el().querySelector('.modal')?.classList).toContain('modal--wide');
  });
});
