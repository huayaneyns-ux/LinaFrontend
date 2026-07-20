import { api } from '../../../Services/apiService';

import type {
  LoteSelectDto,
  LoteSelectListarDto,
  LoteInsertDto,
  MovimientoInsertDto
} from '../../../Types/Admin/Inventario/Lote';


export const LoteService = {


  //=========================================
  // LISTAR LOTES
  //=========================================
  getLotes: async (
    filtros?: {
      codigoLote?: string;
      idProducto?: number;
      idProveedor?: number;
      fechaIngresoDesde?: string;
      fechaIngresoHasta?: string;
      fechaVencimientoDesde?: string;
      fechaVencimientoHasta?: string;
    }
  ): Promise<LoteSelectListarDto[]> => {


    let url = '/Lote/Lista';


    if (filtros) {

      const params = new URLSearchParams();


      if (filtros.codigoLote) 
        params.append('codigoLote', filtros.codigoLote);


      if (filtros.idProducto)
        params.append('idProducto', filtros.idProducto.toString());


      if (filtros.idProveedor)
        params.append('idProveedor', filtros.idProveedor.toString());


      if (filtros.fechaIngresoDesde)
        params.append('fechaIngresoDesde', filtros.fechaIngresoDesde);


      if (filtros.fechaIngresoHasta)
        params.append('fechaIngresoHasta', filtros.fechaIngresoHasta);


      if (filtros.fechaVencimientoDesde)
        params.append('fechaVencimientoDesde', filtros.fechaVencimientoDesde);


      if (filtros.fechaVencimientoHasta)
        params.append('fechaVencimientoHasta', filtros.fechaVencimientoHasta);



      if (params.toString())
        url += `?${params.toString()}`;

    }



    return api.request<LoteSelectListarDto[]>(url, {
      method: 'GET'
    });

  },



  //=========================================
  // OBTENER LOTE
  //=========================================
  getLoteById: async (
    id: number
  ): Promise<LoteSelectDto> => {

    return api.request<LoteSelectDto>(
      `/Lote/${id}`,
      {
        method: 'GET'
      }
    );

  },



  //=========================================
  // INSERTAR LOTE
  //=========================================
  createLote: async (
    data: LoteInsertDto
  ): Promise<any> => {


    return api.request<any>(
      '/Lote/Insertar',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },



  //=========================================
  // INSERTAR MOVIMIENTO
  //=========================================
  createMovimiento: async (
    data: MovimientoInsertDto
  ): Promise<any> => {


    return api.request<any>(
      '/Lote/InsertarMovimiento',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  }


};