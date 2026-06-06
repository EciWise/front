import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiUser } from '../../../core/models/user.model';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';

/**
 * Recibe el resultado del OAuth de Google. wise_auth redirige aquí con los datos
 * en el fragmento (#token=…&user=… | #error=código). Se parsea de forma segura,
 * se persiste la sesión y se redirige al área del rol. Los errores se muestran
 * traducidos según el idioma activo.
 */
@Component({
  selector: 'eci-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink, LogoComponent, SpaceBackgroundComponent],
  templateUrl: './callback.html',
  styleUrl: '../auth.css',
})
export class CallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly errorKey = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (params.get('error')) {
      this.errorKey.set('auth.googleFailed');
      return;
    }

    const token = params.get('token');
    const apiUser = this.parseUser(params.get('user'));
    if (!token || !apiUser) {
      this.errorKey.set('auth.googleFailed');
      return;
    }

    const user = this.auth.completeSession(token, apiUser);
    this.router.navigateByUrl(ROLE_HOME[user.role]).catch(() => {
      this.errorKey.set('auth.googleFailed');
    });
  }

  /** Parsea y valida la forma del usuario antes de confiar en él. */
  private parseUser(raw: string | null): ApiUser | null {
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<ApiUser>;
      const valid =
        typeof parsed.id === 'string' &&
        typeof parsed.email === 'string' &&
        typeof parsed.nombre === 'string' &&
        typeof parsed.apellido === 'string' &&
        typeof parsed.rol === 'string';
      return valid ? (parsed as ApiUser) : null;
    } catch {
      return null;
    }
  }
}
