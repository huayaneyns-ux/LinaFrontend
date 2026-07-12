export interface CategoriaSelectDto {
  id: number;
  nombre: string;
  estado: boolean;
  urlImagen?: string;
  publicIdImagen?: string;
}

export interface CategoriaInsertDto {
  nombre: string;
  urlImagen?: string;
}

export interface CategoriaUpdateDto {
  id: number;
  nombre: string;
  estado: boolean;
  urlImagen?: string;
}
