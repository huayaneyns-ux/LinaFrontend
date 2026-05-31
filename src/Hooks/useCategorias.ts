import { useState, useEffect } from 'react';
import { CategoriaService } from '../Services/CategoriaService';
import type { Categoria } from '../Types/Producto';

export const useCategorias = () => {
    const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                setLoading(true);
                const data = await CategoriaService.getCategorias();
                setCategoriasData(data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener categorias');
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    return { categoriasData, loading, error };
};
