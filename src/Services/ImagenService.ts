import { api } from '../Services/apiService';
import type { 
    ImagenResponseDto,
    ImagenDeleteDto
} from '../Types/Imagen';

export const ImagenService = {

    // =====================================
    // SUBIR IMAGEN
    // =====================================
    subirImagen: async (imagen: File): Promise<ImagenResponseDto> => {
        const formData = new FormData();
        formData.append('imagen', imagen);
        return api.requestFormData<ImagenResponseDto>('/Imagen/Subir', formData);
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