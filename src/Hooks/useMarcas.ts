import { useState, useEffect } from 'react';
import { MarcaService } from '../Services/Admin/Inventario/Marca';
import type { Marca } from '../Types/Marca';
import { isActivoEstado } from '../Utils/imageUtils';

export const useMarcas = () => {
  const [marcasData, setMarcasData] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        setLoading(true);
        const data = await MarcaService.getMarcas();
        setMarcasData(
          data
            .filter(m => isActivoEstado(m.estado))
            .map(m => ({
              id: m.id,
              nombre: m.nombre,
              estado: m.estado,
              urlImagen: m.urlImagen,
              url: m.urlImagen,
              publicIdImagen: m.publicIdImagen,
            }))
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al obtener marcas';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  return { marcasData, loading, error };
};
