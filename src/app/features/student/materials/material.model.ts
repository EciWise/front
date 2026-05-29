export type MaterialType = 'pdf' | 'video' | 'slides' | 'link';

/** Material de estudio publicado. */
export interface Material {
  readonly id: string;
  readonly title: string;
  readonly subject: string;
  readonly type: MaterialType;
  readonly url: string;
}
