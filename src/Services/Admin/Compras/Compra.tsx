//=========================================
// SERVICE COMPRA
//=========================================

import { api } from '../../../Services/apiService';

import type {
  CompraListaDto,
  CompraDetalleSelectDto,
  CompraCompletaInsertDto,
  CompraResponseDto
} from '../../../Types/Admin/Compras/Compra';


export const CompraService = {


  //=========================================
  // LISTAR COMPRAS
  // GET /Compra/Lista
  //=========================================
  getCompras: async (): Promise<CompraListaDto[]> => {

    return api.request<CompraListaDto[]>(
      '/Compra/Lista',
      {
        method: 'GET'
      }
    );

  },



  //=========================================
  // OBTENER DETALLE DE COMPRA
  // GET /Compra/{id}/Detalle
  //=========================================
  getCompraDetalle: async (
    id: number
  ): Promise<CompraDetalleSelectDto[]> => {

    return api.request<CompraDetalleSelectDto[]>(
      `/Compra/${id}/Detalle`,
      {
        method: 'GET'
      }
    );

  },



  //=========================================
  // REGISTRAR COMPRA
  // Cabecera + Detalle
  //
  // Backend genera:
  // DetalleCompra
  // Lote
  // MovimientoInventario
  //=========================================
  createCompra: async (
    data: CompraCompletaInsertDto
  ): Promise<CompraResponseDto> => {

    return api.request<CompraResponseDto>(
      '/Compra/RegistrarCompleta',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  }


};