import { api } from '../../../Services/apiService';

import type {
  CajaClienteDto,
  CajaClienteInsertDto,
  CajaVentaInsertDto,
  CajaVentaResponseDto,
  CajaPagoInsertDto
} from '../../../Types/Admin/Ventas/Caja';


export const CajaService = {


  // =====================================
  // BUSCAR CLIENTE POR DNI
  // =====================================

  buscarClientePorDni: async (
    dni: string
  ): Promise<CajaClienteDto> => {

    return api.request<CajaClienteDto>(
      `/Caja/Cliente/${dni}`,
      {
        method: 'GET'
      }
    );

  },

  buscarClientes: async (termino: string): Promise<CajaClienteDto[]> => {
    const q = termino.trim();
    if (!q) return [];

    try {
      const data = await api.request<CajaClienteDto[] | CajaClienteDto>(
        `/Caja/Cliente/Buscar/${encodeURIComponent(q)}`,
        { method: 'GET' }
      );
      return Array.isArray(data) ? data : data?.id ? [data] : [];
    } catch {
      if (/^\d{8}$/.test(q)) {
        try {
          const one = await CajaService.buscarClientePorDni(q);
          return one?.id ? [one] : [];
        } catch {
          return [];
        }
      }
      return [];
    }
  },



  // =====================================
  // CREAR CLIENTE NUEVO
  // =====================================

  crearCliente: async (
    data: CajaClienteInsertDto
  ): Promise<{ idCliente: number; mensaje: string }> => {

    return api.request<{ idCliente: number; mensaje: string }>(
      '/Caja/Cliente',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },



  // =====================================
  // REGISTRAR VENTA COMPLETA
  // =====================================

  registrarVenta: async (
    data: CajaVentaInsertDto
  ): Promise<CajaVentaResponseDto> => {

    return api.request<CajaVentaResponseDto>(
      '/Caja/RegistrarVenta',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },

  // =====================================
  // REGISTRAR PAGO DE VENTA
  // =====================================

  registrarPago: async (
    idVenta: number,
    data: CajaPagoInsertDto
  ): Promise<string> => {

    return api.request<string>(
      `/VentaRealizada/${idVenta}/Pago`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  }


};