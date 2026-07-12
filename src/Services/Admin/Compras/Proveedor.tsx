import { api } from '../../../Services/apiService.ts';
import type {
  Proveedor,
  ProveedorInsert,
  ProveedorUpdate,
  ProveedorDeleteResponse
} from '../../../Types/Admin/Compras/Proveedor.ts';

export const ProveedorService = {

  // =========================
  // LISTAR
  // =========================
  getProveedores: async (): Promise<Proveedor[]> => {
    return api.request<Proveedor[]>('/Proveedor', {
      method: 'GET',
    });
  },

  // =========================
  // OBTENER POR ID
  // =========================
  getProveedorById: async (id: number): Promise<Proveedor> => {
    return api.request<Proveedor>(`/Proveedor/${id}`, {
      method: 'GET',
    });
  },

  // =========================
  // INSERTAR
  // =========================
  createProveedor: async (data: ProveedorInsert): Promise<string> => {
    return api.request<string>('/Proveedor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // =========================
  // ACTUALIZAR
  // =========================
  updateProveedor: async (data: ProveedorUpdate): Promise<string> => {
    return api.request<string>('/Proveedor', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // =========================
  // ELIMINAR (SOFT DELETE + ALERTA)
  // =========================
  deleteProveedor: async (id: number): Promise<string | ProveedorDeleteResponse> => {
    return api.request<string | ProveedorDeleteResponse>(`/Proveedor/${id}`, {
      method: 'DELETE',
    });
  }
};