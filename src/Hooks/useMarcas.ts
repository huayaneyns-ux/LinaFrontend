import { useState, useEffect } from 'react';
import { MarcaService } from '../Services/MarcaService';
import type { Marca } from '../Types/Marca';

export const useMarcas = () => {
    const [marcasData, setMarcasData] = useState<Marca[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                setLoading(true);
                const data = await MarcaService.getMarcas();
                setMarcasData(data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener marcas');
            } finally {
                setLoading(false);
            }
        };

        fetchMarcas();
    }, []);

    return { marcasData, loading, error };
};
