import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Subject, throwError } from 'rxjs';
import { StaticTranslateLoader } from '../../core/i18n/static-translate.loader';
import { AiMessage } from './ai-message.model';
import { AiAssistantPanelComponent } from './ai-assistant-panel';
import { AiAssistantService } from './ai-assistant.service';

interface AssistantStub {
  readonly messages: ReturnType<typeof signal<AiMessage[]>>;
  readonly send: ReturnType<typeof vi.fn>;
}

interface AssistantHarness {
  readonly draft: {
    (): string;
    set(value: string): void;
  };
  readonly sending: () => boolean;
  send(): void;
}

describe('AiAssistantPanelComponent', () => {
  let fixture: ComponentFixture<AiAssistantPanelComponent>;
  let assistant: AssistantStub;

  const cmp = (): AssistantHarness => fixture.componentInstance as unknown as AssistantHarness;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    assistant = {
      messages: signal<AiMessage[]>([
        { id: 'a1', author: 'assistant', text: 'Hola' },
        { id: 'u1', author: 'user', text: 'Necesito ayuda' },
      ]),
      send: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AiAssistantPanelComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: AiAssistantService, useValue: assistant },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistantPanelComponent);
    fixture.detectChanges();
  });

  it('renderiza historial y bloquea envio vacio', () => {
    expect(el().querySelectorAll('.conv__msg')).toHaveLength(2);
    expect(el().querySelector('.conv__msg--user')?.textContent).toContain('Necesito ayuda');
    expect(el().querySelector<HTMLButtonElement>('.conv__send')?.disabled).toBe(true);

    cmp().draft.set('   ');
    cmp().send();

    expect(assistant.send).not.toHaveBeenCalled();
  });

  it('envia texto normalizado, muestra loading y evita doble envio mientras espera', () => {
    const pending = new Subject<AiMessage>();
    assistant.send.mockReturnValue(pending.asObservable());
    cmp().draft.set('  resolver tarea  ');
    fixture.detectChanges();

    el().querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(assistant.send).toHaveBeenCalledWith('resolver tarea');
    expect(cmp().draft()).toBe('');
    expect(cmp().sending()).toBe(true);
    expect(el().querySelector('.conv__bubble--typing')).not.toBeNull();

    cmp().draft.set('otra');
    cmp().send();
    expect(assistant.send).toHaveBeenCalledTimes(1);

    pending.next({ id: 'a2', author: 'assistant', text: 'Respuesta' });
    pending.complete();
    fixture.detectChanges();

    expect(cmp().sending()).toBe(false);
  });

  it('restaura loading cuando el servicio responde con error', () => {
    assistant.send.mockReturnValue(throwError(() => new Error('offline')));
    cmp().draft.set('hola');

    cmp().send();

    expect(assistant.send).toHaveBeenCalledWith('hola');
    expect(cmp().sending()).toBe(false);
  });
});
