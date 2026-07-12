import { api } from '../Services/apiService';
import { normalizeImagenResponse } from '../Utils/imageUtils';
import type {
    ImagenResponseDto,
    ImagenDeleteDto
} from '../Types/Imagen';

export const ImagenService = {

    subirImagen: async (imagen: File): Promise<ImagenResponseDto> => {
        const formData = new FormData();
        formData.append('imagen', imagen);
        const raw = await api.requestFormData<Record<string, unknown>>('/Imagen/Subir', formData);
        return normalizeImagenResponse(raw);
    },


    // =====================================
    // ELIMINAR IMAGEN
    // =====================================
    eliminarImagen: async (data: ImagenDeleteDto): Promise<string> => {

        return api.request<string>('/Imagen/Eliminar', {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

};