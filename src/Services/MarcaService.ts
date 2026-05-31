import { api } from './apiService';
import type { Marca } from '../Types/Marca';

export const MarcaService = {
    getMarcas: async (): Promise<Marca[]> => {
        return api.request<Marca[]>('/Marca', {
            method: 'GET',
        });
    }
};
