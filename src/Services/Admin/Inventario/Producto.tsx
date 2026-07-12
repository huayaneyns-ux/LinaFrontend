import { api } from '../../../Services/apiService.ts';
import type {
    ProductoSelectDto,
    ProductoInsertDto,
    ProductoUpdateDto
} from '../../../Types/Admin/Inventario/Producto.ts';

export const ProductoService = {
    // =====================================
    // LISTAR
    // =====================================
    getProductos: async (): Promise<ProductoSelectDto[]> => {
        return api.request<ProductoSelectDto[]>('/Producto/Lista', {
            method: 'GET',
        });
    },

    // =====================================
    // OBTENER POR ID
    // =====================================
    getProductoById: async (id: number): Promise<ProductoSelectDto> => {
        return api.request<ProductoSelectDto>(`/Producto/${id}`, {
            method: 'GET',
        });
    },

    // =====================================
    // INSERTAR
    // =====================================
    createProducto: async (data: ProductoInsertDto): Promise<string> => {
        return api.request<string>('/Producto', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // ACTUALIZAR
    // =====================================
    updateProducto: async (data: ProductoUpdateDto): Promise<string> => {
        return api.request<string>('/Producto', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // ELIMINAR
    // =====================================
    deleteProducto: async (id: number): Promise<string> => {
        return api.request<string>(`/Producto/${id}`, {
            method: 'DELETE',
        });
    }
};