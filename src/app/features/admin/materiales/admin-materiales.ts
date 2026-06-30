import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { MaterialsService } from '../../student/materials/materials.service';

@Component({
  selector: 'eci-admin-materiales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: './admin-materiales.html',
  styleUrl: './admin-materiales.css',
})
export class AdminMaterialesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MaterialsService);

  protected readonly items = this.service.items;
  protected readonly uploadOpen = signal(false);
  protected readonly uploading = signal(false);
  protected readonly successKey = signal<string | null>(null);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly deleteErrorId = signal<string | null>(null);

  private selectedFile: File | null = null;

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: [''],
    tags: [''],
  });

  ngOnInit(): void {
    this.service.reload();
  }

  openUpload(): void {
    this.form.reset({ nombre: '', descripcion: '', tags: '' });
    this.selectedFile = null;
    this.successKey.set(null);
    this.errorKey.set(null);
    this.uploadOpen.set(true);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      this.errorKey.set('admin.materiales.errorFile');
      return;
    }
    const { nombre, descripcion, tags } = this.form.getRawValue();
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('nombre', nombre);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    if (tags) {
      for (const tag of tags.split(',').map((t) => t.trim()).filter(Boolean)) {
        formData.append('tags[]', tag);
      }
    }
    this.uploading.set(true);
    this.errorKey.set(null);
    this.service.create(formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadOpen.set(false);
        this.successKey.set('admin.materiales.uploaded');
        this.service.reload();
      },
      error: () => {
        this.uploading.set(false);
        this.errorKey.set('admin.materiales.error');
      },
    });
  }

  remove(id: string): void {
    this.deleteErrorId.set(null);
    this.service.delete(id).subscribe({
      next: () => this.service.reload(),
      error: () => this.deleteErrorId.set(id),
    });
  }

  downloadUrl(id: string): string {
    return this.service.downloadUrl(id);
  }
}
