import { TestBed } from '@angular/core/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksService);
  });

  it('agrega una tarea y la persiste', () => {
    const before = service.tasks().length;
    service.add('Estudiar para el parcial', 'Álgebra');

    expect(service.tasks().length).toBe(before + 1);
    expect(service.tasks().at(-1)?.title).toBe('Estudiar para el parcial');
    expect(localStorage.getItem('eciwise.tasks')).not.toBeNull();
  });

  it('ignora títulos vacíos', () => {
    const before = service.tasks().length;
    service.add('   ');
    expect(service.tasks().length).toBe(before);
  });

  it('actualiza el estado y recalcula las pendientes', () => {
    service.add('Tarea X');
    const id = service.tasks().at(-1)!.id;
    const pendingBefore = service.pendingCount();

    service.setStatus(id, 'done');

    expect(service.tasks().find((t) => t.id === id)?.status).toBe('done');
    expect(service.pendingCount()).toBe(pendingBefore - 1);
  });
});
