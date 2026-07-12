import { api } from '../../../Services/apiService';
import type {
  CategoriaSelectDto,
  CategoriaInsertDto,
  CategoriaUpdateDto,
} from '../../../Types/Admin/Inventario/Categoria';

export const CategoriaService = {
  getCategorias: async (): Promise<CategoriaSelectDto[]> => {
    return api.request<CategoriaSelectDto[]>('/Categoria/Lista', { method: 'GET' });
  },

  getCategoriaById: async (id: number): Promise<CategoriaSelectDto> => {
    return api.request<CategoriaSelectDto>(`/Categoria/${id}`, { method: 'GET' });
  },

  createCategoria: async (data: CategoriaInsertDto): Promise<string> => {
    return api.request<string>('/Categoria', { method: 'POST', body: JSON.stringify(data) });
  },

  updateCategoria: async (data: CategoriaUpdateDto): Promise<string> => {
    return api.request<string>('/Categoria', { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteCategoria: async (id: number): Promise<string> => {
    return api.request<string>(`/Categoria/${id}`, { method: 'DELETE' });
  },
};
