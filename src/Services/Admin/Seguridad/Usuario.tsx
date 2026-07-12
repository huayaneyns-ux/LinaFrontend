import { api } from '../../../Services/apiService';
import type {
  UsuarioSelectDto,
  UsuarioInsertDto,
  UsuarioUpdateDto,
} from '../../../Types/Admin/Seguridad/Usuario';

export const UsuarioService = {
  getUsuarios: async (): Promise<UsuarioSelectDto[]> => {
    return api.request<UsuarioSelectDto[]>('/Usuario/Lista', { method: 'GET' });
  },

  getUsuarioById: async (id: number): Promise<UsuarioSelectDto> => {
    return api.request<UsuarioSelectDto>(`/Usuario/${id}`, { method: 'GET' });
  },

  createUsuario: async (data: UsuarioInsertDto): Promise<string> => {
    return api.request<string>('/Usuario', { method: 'POST', body: JSON.stringify(data) });
  },

  updateUsuario: async (data: UsuarioUpdateDto): Promise<string> => {
    return api.request<string>('/Usuario', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteUsuario: async (id: number): Promise<string> => {
    return api.request<string>(`/Usuario/${id}`, { method: 'DELETE' });
  },
};
