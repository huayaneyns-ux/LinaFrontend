import { api } from '../../../Services/apiService';

import type {
  DepartamentoDto,
  ProvinciaDto,
  DistritoDto,
  DireccionDto,
  DireccionInsertDto,
  DireccionPrincipalDto
} from '../../../Types/Admin/Ventas/Lugares';


export const LugaresService = {

  //=========================================
  // LISTAR DEPARTAMENTOS
  //=========================================
  getDepartamentos: async (): Promise<DepartamentoDto[]> => {

    return api.request<DepartamentoDto[]>(
      '/Lugares/Departamentos',
      {
        method: 'GET'
      }
    );

  },


  //=========================================
  // LISTAR PROVINCIAS
  //=========================================
  getProvincias: async (
    idDepartamento: number
  ): Promise<ProvinciaDto[]> => {

    return api.request<ProvinciaDto[]>(
      `/Lugares/Provincias/${idDepartamento}`,
      {
        method: 'GET'
      }
    );

  },


  //=========================================
  // LISTAR DISTRITOS
  //=========================================
  getDistritos: async (
    idProvincia: number
  ): Promise<DistritoDto[]> => {

    return api.request<DistritoDto[]>(
      `/Lugares/Distritos/${idProvincia}`,
      {
        method: 'GET'
      }
    );

  },

    //=========================================
  // LISTAR DIRECCIONES DEL USUARIO
  //=========================================
  getDireccionesUsuario: async (
    idUsuario: number
  ): Promise<DireccionDto[]> => {

    return api.request<DireccionDto[]>(
      `/Lugares/Direccion/${idUsuario}`,
      {
        method: 'GET'
      }
    );

  },


  //=========================================
  // INSERTAR DIRECCION
  //=========================================
  createDireccion: async (
    data: DireccionInsertDto
  ): Promise<{
    success: boolean;
    mensaje: string;
  }> => {

    return api.request<{
      success: boolean;
      mensaje: string;
    }>(
      '/Lugares/Direccion',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );

  },


  //=========================================
  // CAMBIAR DIRECCION PRINCIPAL
  //=========================================
  cambiarDireccionPrincipal: async (
    data: DireccionPrincipalDto
  ): Promise<{
    success: boolean;
    mensaje: string;
  }> => {

    return api.request<{
      success: boolean;
      mensaje: string;
    }>(
      '/Lugares/Direccion/Principal',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );

  },


  //=========================================
  // ELIMINAR DIRECCION
  //=========================================
  deleteDireccion: async (
    idUsuario: number,
    idDireccion: number
  ): Promise<{
    success: boolean;
    mensaje: string;
  }> => {

    return api.request<{
      success: boolean;
      mensaje: string;
    }>(
      `/Lugares/Direccion/${idUsuario}/${idDireccion}`,
      {
        method: 'DELETE'
      }
    );

  }
};