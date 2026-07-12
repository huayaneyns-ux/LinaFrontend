import { ImagenService } from '../Services/ImagenService';
import type { ImagenResponseDto } from '../Types/Imagen';

const API_BASE = 'https://localhost:7146';

export function resolveImageUrl(path?: string | null): string | null {
  if (!path || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

export function getProductoImagenPath(producto: {
  imagenUrl?: string;
  url?: string;
  rutaImagen?: string;
}): string | undefined {
  return producto.imagenUrl || producto.url || producto.rutaImagen || undefined;
}

export function isLocalPreviewPath(path?: string | null): boolean {
  if (!path || path.trim() === '') return false;
  if (path.startsWith('http://') || path.startsWith('https://')) return false;
  return path.startsWith('images/');
}

export function isActivoEstado(estado: boolean | string | number | undefined | null): boolean {
  if (estado === true || estado === 1) return true;
  if (estado === false || estado === 0) return false;
  if (typeof estado === 'string') {
    const s = estado.trim().toUpperCase();
    if (s === 'INACTIVO' || s === '0' || s === 'FALSE') return false;
    if (s === 'ACTIVO' || s === '1' || s === 'TRUE') return true;
  }
  return estado != null && estado !== 'INACTIVO';
}

export function normalizeImagenResponse(raw: Record<string, unknown>): ImagenResponseDto {
  const ruta =
    (raw.rutaImagen as string) ??
    (raw.RutaImagen as string) ??
    (raw.url as string) ??
    (raw.Url as string) ??
    '';
  const publicId =
    (raw.publicId as string) ??
    (raw.PublicId as string) ??
    '';
  return { rutaImagen: ruta.trim(), publicId: publicId.trim() };
}

export interface ImagenGuardada {
  ruta: string;
  publicId: string;
}

/**
 * Gestiona subida, reemplazo y eliminación de imágenes en Cloudinary.
 * Usar en Producto, Categoría y Marca al crear/actualizar.
 */
export async function gestionarImagenAlGuardar(options: {
  pendingFile: File | null;
  rutaFormulario?: string;
  publicIdFormulario?: string;
  rutaOriginal?: string;
  publicIdOriginal?: string;
  esEdicion: boolean;
}): Promise<ImagenGuardada> {
  const {
    pendingFile,
    rutaFormulario,
    publicIdFormulario,
    rutaOriginal = '',
    publicIdOriginal = '',
    esEdicion,
  } = options;

  const imagenRemovida = !pendingFile && (!rutaFormulario || rutaFormulario.trim() === '');

  if (pendingFile) {
    if (esEdicion && publicIdOriginal) {
      try {
        await ImagenService.eliminarImagen({ publicId: publicIdOriginal });
      } catch {
        /* continuar aunque falle la eliminación previa */
      }
    }
    const resultado = await ImagenService.subirImagen(pendingFile);
    if (!resultado.rutaImagen) {
      throw new Error('La imagen se subió pero no se recibió la ruta desde Cloudinary.');
    }
    return { ruta: resultado.rutaImagen, publicId: resultado.publicId };
  }

  if (imagenRemovida) {
    if (esEdicion && publicIdOriginal) {
      try {
        await ImagenService.eliminarImagen({ publicId: publicIdOriginal });
      } catch {
        /* continuar */
      }
    }
    return { ruta: '', publicId: '' };
  }

  if (rutaFormulario && isLocalPreviewPath(rutaFormulario)) {
    throw new Error('La imagen aún no se ha subido. Espere a que termine el proceso.');
  }

  if (rutaFormulario && !isLocalPreviewPath(rutaFormulario)) {
    return {
      ruta: rutaFormulario,
      publicId: publicIdFormulario || publicIdOriginal,
    };
  }

  return { ruta: rutaOriginal, publicId: publicIdOriginal };
}
