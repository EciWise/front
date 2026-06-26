import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent, IconName } from './icon';

const ALL_ICONS: IconName[] = [
  'dashboard', 'tutorias', 'materials', 'games', 'study', 'quiz', 'tasks',
  'profile', 'schedule', 'availability', 'requests', 'history', 'users',
  'help', 'csv', 'add-user', 'search', 'settings', 'trophy', 'file',
  'assistant', 'chat', 'ethics', 'notifications', 'arrow-left', 'arrow-right',
  'check', 'close', 'aprendizaje', 'info', 'plus', 'edit', 'trash', 'eye',
  'eye-off', 'repeat', 'flame', 'circle', 'circle-dot', 'circle-check',
  'star', 'clock', 'chart', 'calendar', 'chevron-left', 'chevron-right',
  'chevron-down', 'coffee', 'idea', 'target', 'magnet', 'snowflake', 'zap',
  'timer', 'swords',
];

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;
  let component: IconComponent;

  function setInput(name: IconName, size = 20, filled = false): void {
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('size', size);
    fixture.componentRef.setInput('filled', filled);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'dashboard');
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('input size por defecto es 20', () => {
    expect(component.size()).toBe(20);
  });

  it('input filled por defecto es false', () => {
    expect(component.filled()).toBe(false);
  });

  it('aplica clase icon--filled en el host cuando filled=true', () => {
    setInput('dashboard', 20, true);
    expect(fixture.nativeElement.classList.contains('icon--filled')).toBe(true);
  });

  it('no aplica clase icon--filled cuando filled=false', () => {
    setInput('dashboard', 20, false);
    expect(fixture.nativeElement.classList.contains('icon--filled')).toBe(false);
  });

  it('acepta tamaño personalizado', () => {
    setInput('search', 32);
    expect(component.size()).toBe(32);
  });

  it('renderiza un elemento SVG para cada icono soportado', () => {
    for (const name of ALL_ICONS) {
      setInput(name);
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg, `expected svg for icon: ${name}`).not.toBeNull();
    }
  });

  it('renderiza correctamente una muestra representativa de iconos', () => {
    const sample: IconName[] = [
      'dashboard', 'search', 'chat', 'notifications', 'settings',
      'check', 'close', 'arrow-left', 'arrow-right', 'trash',
      'swords', 'zap', 'timer', 'snowflake',
    ];
    for (const name of sample) {
      setInput(name);
      expect(fixture.nativeElement.querySelector('svg'), `expected svg for icon: ${name}`).not.toBeNull();
    }
  });
});
