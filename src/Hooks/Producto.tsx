import { useState, useEffect } from 'react';
import { ProductoService } from '../Services/ProductoService';
import type { Producto } from '../Types/Producto';

export const useProductos = () => {
    const [productosData, setProductosData] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const data = await ProductoService.getProductos();
                setProductosData(data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    return { productosData, loading, error };
};
