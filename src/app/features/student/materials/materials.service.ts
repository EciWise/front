import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { MATERIALS_CONFIG } from './materials.config';
import { Material, MaterialType } from './material.model';

interface ApiMaterial {
  readonly id: string;
  readonly nombre: string;
  readonly url: string;
  readonly descripcion?: string | null;
  readonly extension: string;
  readonly tags?: string[];
  readonly vistos: number;
  readonly descargas: number;
  readonly calificacionPromedio?: number;
  readonly userName: string;
  readonly createdAt: string;
}

interface PaginatedResponse {
  readonly data: ApiMaterial[];
  readonly total: number;
  readonly skip: number;
  readonly take: number;
}

function extensionToType(ext: string): MaterialType {
  const e = ext.toLowerCase();
  if (e === 'pdf') return 'pdf';
  if (['mp4', 'webm', 'avi', 'mov'].includes(e)) return 'video';
  if (['ppt', 'pptx', 'key', 'odp'].includes(e)) return 'slides';
  return 'link';
}

function fromApi(m: ApiMaterial): Material {
  return {
    id: m.id,
    title: m.nombre,
    subject: m.tags?.[0] ?? '',
    type: extensionToType(m.extension),
    url: m.url,
  };
}

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(MATERIALS_CONFIG);

  private readonly _items = signal<Material[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    this.load();
  }

  private load(): void {
    this.http
      .get<PaginatedResponse | ApiMaterial[]>(`${this.config.materialsApiUrl}/material`)
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : res.data;
          this._items.set(raw.map(fromApi));
        },
      });
  }

  search(query: string): void {
    if (!query.trim()) {
      this.load();
      return;
    }
    this.http
      .get<PaginatedResponse>(`${this.config.materialsApiUrl}/material/search`, {
        params: { nombre: query },
      })
      .subscribe({ next: (res) => this._items.set(res.data.map(fromApi)) });
  }

  downloadUrl(id: string): string {
    return `${this.config.materialsApiUrl}/material/${id}/download`;
  }
}
