import { api } from '../../../Services/apiService';

import type {
  VentaRealizadaSelectDto,
  VentaRealizadaDetalleDto,
  VentaRealizadaPagoDto
} from '../../../Types/Admin/Ventas/Venta';


export const VentaRealizadaService = {


  // =====================================
  // LISTAR VENTAS REALIZADAS
  // =====================================
  getVentas: async (): Promise<VentaRealizadaSelectDto[]> => {
    return api.request<VentaRealizadaSelectDto[]>('/VentaRealizada/Lista', {
      method: 'GET'
    });
  },


  // =====================================
  // OBTENER CABECERA DE UNA VENTA
  // =====================================
  getVentaById: async (id: number): Promise<VentaRealizadaSelectDto> => {
    return api.request<VentaRealizadaSelectDto>(`/VentaRealizada/${id}`, {
      method: 'GET'
    });
  },


  // =====================================
  // OBTENER DETALLE DE UNA VENTA
  // =====================================
  getDetalleVenta: async (id: number): Promise<VentaRealizadaDetalleDto[]> => {
    return api.request<VentaRealizadaDetalleDto[]>(`/VentaRealizada/${id}/Detalle`, {
      method: 'GET'
    });
  },


  // =====================================
  // OBTENER PAGOS DE UNA VENTA
  // =====================================
  getPagoVenta: async (id: number): Promise<VentaRealizadaPagoDto[]> => {
    return api.request<VentaRealizadaPagoDto[]>(`/VentaRealizada/${id}/Pago`, {
      method: 'GET'
    });
  }

};