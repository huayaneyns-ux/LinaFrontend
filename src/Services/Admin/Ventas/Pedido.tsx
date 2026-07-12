import { api } from '../../../Services/apiService';
import type { PedidoSelectDto, PedidoInsertDto, PedidoUpdateDto } from '../../../Types/Admin/Ventas/Pedido';

export const PedidoService = {
  getPedidos: async (): Promise<PedidoSelectDto[]> => {
    return api.request<PedidoSelectDto[]>('/Pedido/Lista', { method: 'GET' });
  },

  getPedidoById: async (id: number): Promise<PedidoSelectDto> => {
    return api.request<PedidoSelectDto>(`/Pedido/${id}`, { method: 'GET' });
  },

  createPedido: async (data: PedidoInsertDto): Promise<string> => {
    return api.request<string>('/Pedido', { method: 'POST', body: JSON.stringify(data) });
  },

  updatePedido: async (data: PedidoUpdateDto): Promise<string> => {
    return api.request<string>('/Pedido', { method: 'PUT', body: JSON.stringify(data) });
  },

  deletePedido: async (id: number): Promise<string> => {
    return api.request<string>(`/Pedido/${id}`, { method: 'DELETE' });
  },
};
