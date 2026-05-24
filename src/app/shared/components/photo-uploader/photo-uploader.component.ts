import {Component, ElementRef, inject, output, signal, viewChild} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ImageCompressService} from '../../services/image-compress.service';

// Mismos limites que el backend (ReviewService.ALLOWED_PHOTO_MIME / 5MB). Aqui validamos
// para cortar rapido y no hacer viajar el fichero, pero el backend nunca se fia y revalida.
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

@Component({
	selector: 'app-photo-uploader',
	standalone: true,
	imports: [DecimalPipe, MatIconModule, MatButtonModule],
	templateUrl: './photo-uploader.component.html',
	styleUrl: './photo-uploader.component.scss',
})
export class PhotoUploaderComponent {

	// El padre se suscribe a esto y se guarda el File para mandarlo cuando le toque enviar.
	// Cuando el usuario quita la foto emitimos null para que el padre se entere y limpie su estado.
	fileSelected = output<File | null>();

	readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

	readonly selectedFile = signal<File | null>(null);
	// URL "temporal" que crea el navegador para enseñar la miniatura sin que el fichero salga del cliente.
	readonly previewUrl = signal<string | null>(null);
	readonly errorMessage = signal<string | null>(null);
	// True mientras se comprime la imagen. El template puede usarlo para deshabilitar el boton de subida.
	readonly isCompressing = signal<boolean>(false);

	private readonly compressor = inject(ImageCompressService);

	async onFileChange(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		if (!file) return;

		const error = this.validate(file);
		if (error) {
			this.errorMessage.set(error);
			this.clearFile();
			input.value = '';
			this.fileSelected.emit(null);
			return;
		}

		// Comprimir/redimensionar antes de mostrar la preview o emitir al padre. Si la libreria
		// falla por cualquier motivo (formato raro) la imagen original para no dejar al usuario sin poder subir.
		this.isCompressing.set(true);
		let finalFile: File;

		try {
			finalFile = await this.compressor.compress(file);
			this.errorMessage.set(null);
		} catch {
			finalFile = file;
			this.errorMessage.set('No se pudo optimizar la imagen, se subira tal cual.');
		} finally {
			this.isCompressing.set(false);
		}

		// Si habia un preview anterior la borarmos primero.
		this.revokePreview();
		this.selectedFile.set(finalFile);
		this.previewUrl.set(URL.createObjectURL(finalFile));
		this.fileSelected.emit(finalFile);
	}

	triggerFilePicker(): void {
		this.fileInput().nativeElement.click();
	}

	removeFile(): void {
		this.clearFile();
		this.errorMessage.set(null);
		this.fileInput().nativeElement.value = '';
		this.fileSelected.emit(null);
	}

	private validate(file: File): string | null {
		if (!ALLOWED_MIME.has(file.type) && !this.hasAllowedExtension(file.name)) {
			return 'Formato no soportado. Solo JPG, PNG o WebP.';
		}
		if (file.size > MAX_SIZE_BYTES) {
			return 'La foto no puede superar los 5 MB.';
		}
		return null;
	}

	private hasAllowedExtension(name: string): boolean {
		const ext = name.split('.').pop()?.toLowerCase();
		return !!ext && ALLOWED_EXTENSIONS.has(ext);
	}

	// Avisa al navegador de que ya no necesitamos esa URL temporal. Si no lo hacemos, el blob se queda
	// ocupando memoria hasta que se recargue la pestaña.
	private revokePreview(): void {
		const url = this.previewUrl();
		if (url) {
			URL.revokeObjectURL(url);
		}
	}

	private clearFile(): void {
		this.revokePreview();
		this.selectedFile.set(null);
		this.previewUrl.set(null);
	}
}
