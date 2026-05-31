import type { Producto } from '../Types/Producto';
import { api } from './apiService';

export const ProductoService = {
    getProductos: async (): Promise<Producto[]> => {
        return api.request<Producto[]>('/Producto', {
            method: 'GET',
        });
    },
};
