import { api } from '../../../Services/apiService';

import type {
  MovimientoSelectDto
} from '../../../Types/Admin/Inventario/Movimiento';


export const MovimientoService = {


  //=========================================
  // LISTAR MOVIMIENTOS
  //=========================================
  getMovimientos: async (
    filtros?: {
      idProducto?: number;
      tipo?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    }
  ): Promise<MovimientoSelectDto[]> => {


    let url = '/Movimiento/Lista';


    if (filtros) {

      const params = new URLSearchParams();


      if (filtros.idProducto)
        params.append(
          'idProducto',
          filtros.idProducto.toString()
        );


      if (filtros.tipo)
        params.append(
          'tipo',
          filtros.tipo.toString()
        );


      if (filtros.fechaDesde)
        params.append(
          'fechaDesde',
          filtros.fechaDesde
        );


      if (filtros.fechaHasta)
        params.append(
          'fechaHasta',
          filtros.fechaHasta
        );


      if(params.toString())
        url += `?${params.toString()}`;

    }


    return api.request<MovimientoSelectDto[]>(
      url,
      {
        method: 'GET'
      }
    );

  }


};