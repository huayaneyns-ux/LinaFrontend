import { api } from '../../../Services/apiService';

import type {
  UnidadMedidaSelectDto,
  UnidadMedidaInsertDto,
  UnidadMedidaUpdateDto,
  UnidadMedidaObtenerIdDto,
} from '../../../Types/Admin/Inventario/UnidadMedida';


export const UnidadMedidaService = {

  //=========================================
  // LISTAR
  // GET /UnidadMedida/Lista
  //=========================================
  getUnidades: async (): Promise<UnidadMedidaSelectDto[]> => {
    return api.request<UnidadMedidaSelectDto[]>(
      '/UnidadMedida/Lista',
      { method: 'GET' }
    );
  },


  //=========================================
  // OBTENER POR ID
  // GET /UnidadMedida/{id}
  //=========================================
  getUnidadById: async (
    id: number
  ): Promise<UnidadMedidaObtenerIdDto> => {

    return api.request<UnidadMedidaObtenerIdDto>(
      `/UnidadMedida/${id}`,
      { method: 'GET' }
    );
  },


  //=========================================
  // INSERTAR
  // POST /UnidadMedida
  //=========================================
  createUnidad: async (
    data: UnidadMedidaInsertDto
  ): Promise<string> => {

    return api.request<string>(
      '/UnidadMedida',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },


  //=========================================
  // ACTUALIZAR
  // PUT /UnidadMedida
  //=========================================
  updateUnidad: async (
    data: UnidadMedidaUpdateDto
  ): Promise<string> => {

    return api.request<string>(
      '/UnidadMedida',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },


  //=========================================
  // ELIMINAR
  // DELETE /UnidadMedida/{id}
  //=========================================
  deleteUnidad: async (
    id: number
  ): Promise<string> => {

    return api.request<string>(
      `/UnidadMedida/${id}`,
      {
        method: 'DELETE'
      }
    );
  },

};