import {Injectable} from '@angular/core';
import imageCompression, {Options} from 'browser-image-compression';

//Serivcio para comprimir las imagenes al subir al supbase, aprate passamos las imagenes a webp para comsumir menos espacio
//Esto tbm permitira que al momento de descagar las imagenes la app sea mas rapida, ya  que ne lugar de tener que descargar
// una imgaen de 2.2MB ... pasara a permas sobre unos 0.8MB una reduccion considerable y mejroa del rendimineto
@Injectable({providedIn: 'root'})
export class ImageCompressService {

	// Configuracion pensada para fotos de comida hechas con el movil:
	//  - 1280 px da margen de sobra para las cards (640) y el detalle (800)
	//  - WebP comprime un 40% mejor que JPEG con la misma calidad visual.
	//  - Calidad 0.82 es el punto dulce para que la salsa y el huevo no salgan pixelados.
	//  - useWebWorker libera el hilo principal: el usuario puede seguir usnado la pantalla mientras se procesa.
	private readonly defaults: Options = {
		maxSizeMB: 1,
		maxWidthOrHeight: 1024,//1280,
		useWebWorker: true,
		fileType: 'image/webp',
		initialQuality: 0.75,
	};

	// Comprime, redimensiona y renombra el fichero. Si la libreria peta (formato muy raro, navegador
	// sin soporte WebP, OOM en moviles viejos...) dejamos que la excepcion suba: el llamante decide
	// si avisa al usuario o usa la imagen original como fallback.
	async compress(file: File, options?: Partial<Options>): Promise<File> {
		const opts: Options = {...this.defaults, ...options};
		const compressed = await imageCompression(file, opts);
		return this.renameWithExtension(compressed, opts.fileType ?? this.defaults.fileType!);
	}

	private renameWithExtension(file: File, mimeType: string): File {
		const ext = mimeType.split('/')[1] ?? 'webp';
		const newName = file.name.replace(/\.[^.]+$/, `.${ext}`);
		return new File([file], newName, {type: mimeType, lastModified: Date.now()});
	}
}
