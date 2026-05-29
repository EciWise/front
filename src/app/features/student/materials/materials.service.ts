import { Injectable, signal } from '@angular/core';
import { Material } from './material.model';

const SEED: readonly Material[] = [
  { id: 'mat1', title: 'Guía de límites y continuidad', subject: 'Cálculo', type: 'pdf', url: '#' },
  { id: 'mat2', title: 'Introducción a la POO', subject: 'Programación', type: 'slides', url: '#' },
  { id: 'mat3', title: 'Cinemática en una dimensión', subject: 'Física', type: 'video', url: '#' },
  { id: 'mat4', title: 'Repositorio de ejercicios', subject: 'Álgebra Lineal', type: 'link', url: '#' },
];

/** Catálogo mock de materiales de estudio. */
@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly _items = signal<Material[]>([...SEED]);
  readonly items = this._items.asReadonly();
}
