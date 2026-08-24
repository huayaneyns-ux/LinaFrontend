
import { api } from '../../../Services/apiService';

import type {
  UsuarioSelectDto,
  UsuarioGuardarDto
} from '../../../Types/Admin/Seguridad/Usuario';



export const UsuarioService = {


  // =====================================
  // LISTAR USUARIOS
  // GET api/Usuario/Lista
  // =====================================

  getUsuarios: async (): Promise<UsuarioSelectDto[]> => {

    return api.request<UsuarioSelectDto[]>(
      '/Usuario/Lista',
      {
        method: 'GET'
      }
    );

  },



  // =====================================
  // OBTENER USUARIO POR ID
  // GET api/Usuario/{id}
  // =====================================

  getUsuarioById: async (
    id: number
  ): Promise<UsuarioSelectDto> => {

    return api.request<UsuarioSelectDto>(
      `/Usuario/${id}`,
      {
        method: 'GET'
      }
    );

  },



  // =====================================
  // INSERTAR / ACTUALIZAR USUARIO
  // POST api/Usuario/Guardar
  // =====================================

  guardarUsuario: async (
    data: UsuarioGuardarDto
  ): Promise<any> => {

    return api.request<any>(
      '/Usuario/Guardar',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },



  // =====================================
  // ELIMINAR USUARIO
  // DELETE api/Usuario/Eliminar/{id}
  // =====================================

  deleteUsuario: async (
    id: number
  ): Promise<any> => {

    return api.request<any>(
      `/Usuario/Eliminar/${id}`,
      {
        method: 'DELETE'
      }
    );

  }

};