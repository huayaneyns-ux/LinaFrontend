import { api } from '../../../Services/apiService';
import type { RolSelectDto, RolInsertDto, RolUpdateDto } from '../../../Types/Admin/Seguridad/Rol';

export const RolService = {
  getRoles: async (): Promise<RolSelectDto[]> => {
    return api.request<RolSelectDto[]>('/Rol/Lista', { method: 'GET' });
  },

  getRolById: async (id: number): Promise<RolSelectDto> => {
    return api.request<RolSelectDto>(`/Rol/${id}`, { method: 'GET' });
  },

  createRol: async (data: RolInsertDto): Promise<string> => {
    return api.request<string>('/Rol', { method: 'POST', body: JSON.stringify(data) });
  },

  updateRol: async (data: RolUpdateDto): Promise<string> => {
    return api.request<string>('/Rol', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteRol: async (id: number): Promise<string> => {
    return api.request<string>(`/Rol/${id}`, { method: 'DELETE' });
  },
};
