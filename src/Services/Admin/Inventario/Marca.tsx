import { api } from '../../../Services/apiService';
import type {
  MarcaSelectDto,
  MarcaInsertDto,
  MarcaUpdateDto,
} from '../../../Types/Admin/Inventario/Marca';

function normalizeMarca(raw: Record<string, unknown>): MarcaSelectDto {
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

export const MarcaService = {
  getMarcas: async (): Promise<MarcaSelectDto[]> => {
    const data = await api.request<Record<string, unknown>[]>('/Marca/Lista', { method: 'GET' });
    return data.map(normalizeMarca);
  },

  getMarcaById: async (id: number): Promise<MarcaSelectDto> => {
    const data = await api.request<Record<string, unknown>>(`/Marca/${id}`, { method: 'GET' });
    return normalizeMarca(data);
  },

  createMarca: async (data: MarcaInsertDto): Promise<string> => {
    return api.request<string>('/Marca', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.nombre,
        urlImagen: data.urlImagen ?? '',
      }),
    });
  },

  updateMarca: async (data: MarcaUpdateDto): Promise<string> => {
    return api.request<string>('/Marca', {
      method: 'PUT',
      body: JSON.stringify({
        id: data.id,
        nombre: data.nombre,
        estado: data.estado,
        urlImagen: data.urlImagen ?? '',
      }),
    });
  },

  deleteMarca: async (id: number): Promise<string> => {
    return api.request<string>(`/Marca/${id}`, { method: 'DELETE' });
  },
};
