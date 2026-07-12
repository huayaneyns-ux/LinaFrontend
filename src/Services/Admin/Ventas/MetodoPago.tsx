import { api } from '../../../Services/apiService';

import type {
  MetodoPagoSelectDto
} from '../../../Types/Admin/Ventas/MetodoPago';


export const MetodoPagoService = {


  // =====================================
  // LISTAR METODOS DE PAGO
  // =====================================

  getMetodosPago: async (): Promise<MetodoPagoSelectDto[]> => {

    return api.request<MetodoPagoSelectDto[]>(
      '/MetodoPago/Lista',
      {
        method: 'GET'
      }
    );

  }


};