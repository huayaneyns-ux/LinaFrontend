import { api } from '../../../Services/apiService';
import type {
  MarcaSelectDto,
  MarcaInsertDto,
  MarcaUpdateDto,
} from '../../../Types/Admin/Inventario/Marca';

export const MarcaService = {
  getMarcas: async (): Promise<MarcaSelectDto[]> => {
    return api.request<MarcaSelectDto[]>('/Marca/Lista', { method: 'GET' });
  },

  getMarcaById: async (id: number): Promise<MarcaSelectDto> => {
    return api.request<MarcaSelectDto>(`/Marca/${id}`, { method: 'GET' });
  },

  createMarca: async (data: MarcaInsertDto): Promise<string> => {
    return api.request<string>('/Marca', { method: 'POST', body: JSON.stringify(data) });
  },

  updateMarca: async (data: MarcaUpdateDto): Promise<string> => {
    return api.request<string>('/Marca', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteMarca: async (id: number): Promise<string> => {
    return api.request<string>(`/Marca/${id}`, { method: 'DELETE' });
  },
};
