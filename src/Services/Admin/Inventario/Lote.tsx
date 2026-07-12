import { api } from '../../../Services/apiService';
import type { LoteSelectDto, LoteInsertDto, LoteUpdateDto } from '../../../Types/Admin/Inventario/Lote';

export const LoteService = {
  getLotes: async (): Promise<LoteSelectDto[]> => {
    return api.request<LoteSelectDto[]>('/Lote/Lista', { method: 'GET' });
  },

  getLoteById: async (id: number): Promise<LoteSelectDto> => {
    return api.request<LoteSelectDto>(`/Lote/${id}`, { method: 'GET' });
  },

  createLote: async (data: LoteInsertDto): Promise<string> => {
    return api.request<string>('/Lote', { method: 'POST', body: JSON.stringify(data) });
  },

  updateLote: async (data: LoteUpdateDto): Promise<string> => {
    return api.request<string>('/Lote', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteLote: async (id: number): Promise<string> => {
    return api.request<string>(`/Lote/${id}`, { method: 'DELETE' });
  },
};
