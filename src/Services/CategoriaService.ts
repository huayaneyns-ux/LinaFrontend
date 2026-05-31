import { api } from './apiService';
import type { Categoria } from '../Types/Producto';

export const CategoriaService = {
    getCategorias: async (): Promise<Categoria[]> => {
        return api.request<Categoria[]>('/Categoria', {
            method: 'GET',
        });
    }
};
