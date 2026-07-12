import { api } from '../../../Services/apiService';
import type { ArchivoUploadResponse } from '../../../Types/Admin/Inventario/Archivo';

export const ArchivoService = {
  uploadImagen: async (file: File, folder: string = 'productos'): Promise<ArchivoUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('carpeta', folder);
    return api.requestFormData<ArchivoUploadResponse>('/Archivo', formData);
  },
};
