import { api } from '../../../Services/apiService';
import type {
  UnidadMedidaSelectDto,
  UnidadMedidaInsertDto,
  UnidadMedidaUpdateDto,
} from '../../../Types/Admin/Inventario/UnidadMedida';

export const UnidadMedidaService = {
  getUnidades: async (): Promise<UnidadMedidaSelectDto[]> => {
    return api.request<UnidadMedidaSelectDto[]>('/UnidadMedida/Lista', { method: 'GET' });
  },

  getUnidadById: async (id: number): Promise<UnidadMedidaSelectDto> => {
    return api.request<UnidadMedidaSelectDto>(`/UnidadMedida/${id}`, { method: 'GET' });
  },

  createUnidad: async (data: UnidadMedidaInsertDto): Promise<string> => {
    return api.request<string>('/UnidadMedida', { method: 'POST', body: JSON.stringify(data) });
  },

  updateUnidad: async (data: UnidadMedidaUpdateDto): Promise<string> => {
    return api.request<string>('/UnidadMedida', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteUnidad: async (id: number): Promise<string> => {
    return api.request<string>(`/UnidadMedida/${id}`, { method: 'DELETE' });
  },
};
