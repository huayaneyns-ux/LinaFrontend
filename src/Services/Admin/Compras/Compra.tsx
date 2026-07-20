import { api } from '../../../Services/apiService';

import type {
  CompraSelectDto,
  CompraCompletaInsertDto,
  CompraListaDto
} from '../../../Types/Admin/Compras/Compra';


export const CompraService = {


  //=========================================
  // LISTAR COMPRAS
  //=========================================
  getCompras: async (): Promise<CompraSelectDto[]> => {

    return api.request<CompraSelectDto[]>(
      '/Compra/Lista',
      {
        method: 'GET'
      }
    );

  },


  //=========================================
  // OBTENER COMPRA POR ID
  // CABECERA + DETALLE + LOTE
  //=========================================
  getCompraById: async (
    id: number
  ): Promise<CompraSelectDto> => {

    return api.request<CompraSelectDto>(
      `/Compra/${id}`,
      {
        method: 'GET'
      }
    );

  },


  //=========================================
  // REGISTRAR COMPRA COMPLETA
  // Compra + Detalle + Lote + Movimiento
  //=========================================
  createCompraCompleta: async (
    data: CompraCompletaInsertDto
  ): Promise<{ 
    success: boolean;
    mensaje: string;
    idCompra: number;
  }> => {

    return api.request<{
      success: boolean;
      mensaje: string;
      idCompra: number;
    }>(
      '/Compra/RegistrarCompleta',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },

  //=========================================
  // LISTAR COMPRAS CABECERA
  //=========================================
  getComprasLista: async (): Promise<CompraListaDto[]> => {

    return api.request<CompraListaDto[]>(
      '/Compra/Lista',
      {
        method:'GET'
      }
    );

  },
};