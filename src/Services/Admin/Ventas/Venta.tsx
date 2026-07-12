import { api } from '../../../Services/apiService';

import type {
  VentaRealizadaSelectDto,
  VentaRealizadaDetalleDto,
  VentaRealizadaPagoDto
} from '../../../Types/Admin/Ventas/Venta';

function normalizeDetalle(raw: Record<string, unknown>): VentaRealizadaDetalleDto {
  const cantidad = Number(raw.cantidad ?? raw.Cantidad ?? 0);
  const precioUnitario = Number(
    raw.precioUnitario ?? raw.PrecioUnitario ?? raw.precioVenta ?? raw.PrecioVenta ?? 0
  );
  const subtotal = Number(
    raw.subtotal ?? raw.Subtotal ?? (cantidad * precioUnitario)
  );
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    codigo: String(raw.codigo ?? raw.Codigo ?? '—'),
    nombre: String(raw.nombre ?? raw.Nombre ?? '—'),
    cantidad,
    precioUnitario,
    subtotal,
  };
}

function normalizePago(raw: Record<string, unknown>): VentaRealizadaPagoDto {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    metodoPago: String(raw.metodoPago ?? raw.MetodoPago ?? raw.nombre ?? '—'),
    monto: Number(raw.monto ?? raw.Monto ?? 0),
    fecha: String(raw.fecha ?? raw.Fecha ?? ''),
    codigoOperacion: String(raw.codigoOperacion ?? raw.CodigoOperacion ?? ''),
  };
}

export const VentaRealizadaService = {

  getVentas: async (): Promise<VentaRealizadaSelectDto[]> => {
    return api.request<VentaRealizadaSelectDto[]>('/VentaRealizada/Lista', {
      method: 'GET'
    });
  },

  getVentaById: async (id: number): Promise<VentaRealizadaSelectDto> => {
    return api.request<VentaRealizadaSelectDto>(`/VentaRealizada/${id}`, {
      method: 'GET'
    });
  },

  getDetalleVenta: async (id: number): Promise<VentaRealizadaDetalleDto[]> => {
    const data = await api.request<Record<string, unknown>[]>(`/VentaRealizada/${id}/Detalle`, {
      method: 'GET'
    });
    return data.map(normalizeDetalle);
  },

  getPagoVenta: async (id: number): Promise<VentaRealizadaPagoDto[]> => {
    const data = await api.request<Record<string, unknown>[]>(`/VentaRealizada/${id}/Pago`, {
      method: 'GET'
    });
    return data.map(normalizePago);
  }

};
