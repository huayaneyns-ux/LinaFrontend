import { api } from '../../../Services/apiService';

import type {
  CajaClienteDto,
  CajaClienteInsertDto,
  CajaVentaInsertDto,
  CajaVentaResponseDto
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

  }


};