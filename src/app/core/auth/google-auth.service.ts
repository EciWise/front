import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { GoogleCredentialResponse, GoogleJwtClaims } from '../models/google-credential.model';
import { GOOGLE_AUTH_CONFIG } from './google-auth.config';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

/** Tipado mínimo de la API global de Google Identity Services. */
interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
    };
  };
}

/**
 * Integra Google Identity Services (GIS). Carga el script bajo demanda,
 * renderiza el botón oficial y decodifica el JWT de credencial.
 * Si no hay Client ID configurado, expone un inicio de sesión simulado.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config = inject(GOOGLE_AUTH_CONFIG);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private scriptPromise?: Promise<void>;

  get isConfigured(): boolean {
    return this.config.clientId.length > 0;
  }

  /** Renderiza el botón oficial de Google en el contenedor dado. */
  async renderButton(
    container: HTMLElement,
    onClaims: (claims: GoogleJwtClaims) => void,
  ): Promise<void> {
    if (!this.isBrowser || !this.isConfigured) {
      return;
    }
    await this.loadScript();
    const google = (globalThis as unknown as { google?: GoogleIdentity }).google;
    if (!google) {
      return;
    }
    google.accounts.id.initialize({
      client_id: this.config.clientId,
      callback: (response) => onClaims(this.decode(response.credential)),
    });
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    });
  }

  /** Inicio de sesión simulado para entornos sin Client ID. */
  simulatedClaims(): GoogleJwtClaims {
    return {
      sub: 'google-mock',
      email: 'estudiante.google@escuelaing.edu.co',
      name: 'Estudiante Google',
      email_verified: true,
    };
  }

  private decode(credential: string): GoogleJwtClaims {
    return jwtDecode<GoogleJwtClaims>(credential);
  }

  private loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      this.document.head.appendChild(script);
    });
    return this.scriptPromise;
  }
}
