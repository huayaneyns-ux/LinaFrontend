import { api } from '../../../Services/apiService';
import type {
  CategoriaSelectDto,
  CategoriaInsertDto,
  CategoriaUpdateDto,
} from '../../../Types/Admin/Inventario/Categoria';

function normalizeCategoria(raw: Record<string, unknown>): CategoriaSelectDto {
  const urlImagen = String(
    raw.urlImagen ?? raw.UrlImagen ?? raw.rutaImagen ?? raw.RutaImagen ?? raw.url ?? raw.Url ?? ''
  ).trim();
  const publicIdImagen = String(
    raw.publicIdImagen ?? raw.PublicIdImagen ?? ''
  ).trim();

  return {
    id: Number(raw.id),
    nombre: String(raw.nombre ?? ''),
    estado: Boolean(raw.estado ?? true),
    urlImagen: urlImagen || undefined,
    publicIdImagen: publicIdImagen || undefined,
  };
}

export const CategoriaService = {
  getCategorias: async (): Promise<CategoriaSelectDto[]> => {
    const data = await api.request<Record<string, unknown>[]>('/Categoria/Lista', { method: 'GET' });
    return data.map(normalizeCategoria);
  },

  getCategoriaById: async (id: number): Promise<CategoriaSelectDto> => {
    const data = await api.request<Record<string, unknown>>(`/Categoria/${id}`, { method: 'GET' });
    return normalizeCategoria(data);
  },

  createCategoria: async (data: CategoriaInsertDto): Promise<string> => {
    return api.request<string>('/Categoria', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.nombre,
        urlImagen: data.urlImagen ?? '',
      }),
    });
  },

  updateCategoria: async (data: CategoriaUpdateDto): Promise<string> => {
    return api.request<string>('/Categoria', {
      method: 'PUT',
      body: JSON.stringify({
        id: data.id,
        nombre: data.nombre,
        estado: data.estado,
        urlImagen: data.urlImagen ?? '',
      }),
    });
  },

  deleteCategoria: async (id: number): Promise<string> => {
    return api.request<string>(`/Categoria/${id}`, { method: 'DELETE' });
  },
};
