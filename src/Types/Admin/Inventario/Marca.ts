export interface MarcaSelectDto {
  id: number;
  nombre: string;
  estado: boolean;
  urlImagen?: string;
  publicIdImagen?: string;
}

export interface MarcaInsertDto {
  nombre: string;
  urlImagen?: string;
}

export interface MarcaUpdateDto {
  id: number;
  nombre: string;
  estado: boolean;
  urlImagen?: string;
}
