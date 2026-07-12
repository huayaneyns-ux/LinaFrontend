import { api } from '../../../Services/apiService';
import type { CompraSelectDto, CompraInsertDto, CompraUpdateDto } from '../../../Types/Admin/Compras/Compra';

export const CompraService = {
  getCompras: async (): Promise<CompraSelectDto[]> => {
    return api.request<CompraSelectDto[]>('/Compra/Lista', { method: 'GET' });
  },

  getCompraById: async (id: number): Promise<CompraSelectDto> => {
    return api.request<CompraSelectDto>(`/Compra/${id}`, { method: 'GET' });
  },

  createCompra: async (data: CompraInsertDto): Promise<string> => {
    return api.request<string>('/Compra', { method: 'POST', body: JSON.stringify(data) });
  },

  updateCompra: async (data: CompraUpdateDto): Promise<string> => {
    return api.request<string>('/Compra', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteCompra: async (id: number): Promise<string> => {
    return api.request<string>(`/Compra/${id}`, { method: 'DELETE' });
  },
};
