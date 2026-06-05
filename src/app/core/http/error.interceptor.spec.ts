import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppError } from '../errors/app-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('normaliza errores HTTP a AppError con clave i18n', async () => {
    const response = firstValueFrom(http.get('/api/private'));
    const req = controller.expectOne('/api/private');
    req.flush({ code: 'invalid_credentials' }, { status: 401, statusText: 'Unauthorized' });

    let error: unknown;
    try {
      await response;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).messageKey).toBe('auth.invalid');
  });
});
