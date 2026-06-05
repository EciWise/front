import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Imagen de perfil del usuario. Si hay `src` (p. ej. la foto de Google) la
 * muestra; si no —o si la imagen falla al cargar— genera un avatar estándar
 * con las iniciales del nombre sobre un color derivado del propio nombre
 * (estable y único por persona).
 */
@Component({
  selector: 'eci-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.fontSize.px]': 'size() * 0.4',
    '[style.--avatar-bg]': 'bg()',
  },
  template: `
    @if (src() && !failed()) {
      <img
        class="avatar__img"
        [src]="src()"
        [alt]="name()"
        referrerpolicy="no-referrer"
        loading="lazy"
        (error)="failed.set(true)"
      />
    } @else {
      <span class="avatar__initials" aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styleUrl: './avatar.css',
})
export class AvatarComponent {
  /** Nombre completo del usuario (para las iniciales y el color). */
  readonly name = input.required<string>();
  /** URL de la foto (Google). Si falta, se usa el avatar de iniciales. */
  readonly src = input<string | null | undefined>(undefined);
  /** Diámetro en píxeles. */
  readonly size = input(36);

  /** La imagen falló al cargar: caemos al avatar de iniciales. */
  protected readonly failed = signal(false);

  /** Una o dos iniciales a partir del nombre. */
  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts.at(-1)![0] : '';
    return (first + last).toUpperCase();
  });

  /** Color de fondo estable derivado del nombre (mismo nombre → mismo color). */
  protected readonly bg = computed(() => {
    const name = this.name();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + (name.codePointAt(i) ?? 0)) >>> 0;
    }
    return `hsl(${hash % 360}, 55%, 42%)`;
  });
}
