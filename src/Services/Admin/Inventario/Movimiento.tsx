import { api } from '../../../Services/apiService';
import type {
  MovimientoSelectDto,
  MovimientoInsertDto,
  MovimientoUpdateDto,
} from '../../../Types/Admin/Inventario/Movimiento';

export const MovimientoService = {
  getMovimientos: async (): Promise<MovimientoSelectDto[]> => {
    return api.request<MovimientoSelectDto[]>('/Movimiento/Lista', { method: 'GET' });
  },

  getMovimientoById: async (id: number): Promise<MovimientoSelectDto> => {
    return api.request<MovimientoSelectDto>(`/Movimiento/${id}`, { method: 'GET' });
  },

  createMovimiento: async (data: MovimientoInsertDto): Promise<string> => {
    return api.request<string>('/Movimiento', { method: 'POST', body: JSON.stringify(data) });
  },

  updateMovimiento: async (data: MovimientoUpdateDto): Promise<string> => {
    return api.request<string>('/Movimiento', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteMovimiento: async (id: number): Promise<string> => {
    return api.request<string>(`/Movimiento/${id}`, { method: 'DELETE' });
  },
};
