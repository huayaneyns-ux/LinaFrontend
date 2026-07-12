import { useState, useEffect } from 'react';
import { CategoriaService } from '../Services/Admin/Inventario/Categoria';
import type { Categoria } from '../Types/Producto';
import { isActivoEstado } from '../Utils/imageUtils';

export const useCategorias = () => {
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const data = await CategoriaService.getCategorias();
        setCategoriasData(
          data
            .filter(c => isActivoEstado(c.estado))
            .map(c => ({
              id: c.id,
              nombre: c.nombre,
              estado: c.estado,
              urlImagen: c.urlImagen,
              url: c.urlImagen,
              publicIdImagen: c.publicIdImagen,
            }))
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al obtener categorías';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categoriasData, loading, error };
};
