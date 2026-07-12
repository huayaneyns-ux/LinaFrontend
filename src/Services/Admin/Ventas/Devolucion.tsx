import { api } from '../../../Services/apiService';
import type {
  DevolucionSelectDto,
  DevolucionInsertDto,
  DevolucionUpdateDto,
} from '../../../Types/Admin/Ventas/Devolucion';

export const DevolucionService = {
  getDevoluciones: async (): Promise<DevolucionSelectDto[]> => {
    return api.request<DevolucionSelectDto[]>('/Devolucion/Lista', { method: 'GET' });
  },

  getDevolucionById: async (id: number): Promise<DevolucionSelectDto> => {
    return api.request<DevolucionSelectDto>(`/Devolucion/${id}`, { method: 'GET' });
  },

  createDevolucion: async (data: DevolucionInsertDto): Promise<string> => {
    return api.request<string>('/Devolucion', { method: 'POST', body: JSON.stringify(data) });
  },

  updateDevolucion: async (data: DevolucionUpdateDto): Promise<string> => {
    return api.request<string>('/Devolucion', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteDevolucion: async (id: number): Promise<string> => {
    return api.request<string>(`/Devolucion/${id}`, { method: 'DELETE' });
  },
};
