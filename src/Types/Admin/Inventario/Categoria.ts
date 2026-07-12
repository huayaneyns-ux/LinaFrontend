export interface CategoriaSelectDto {
  id: number;
  nombre: string;
  estado: boolean;
  url?: string;
}

export interface CategoriaInsertDto {
  nombre: string;
  url?: string;
}

export interface CategoriaUpdateDto {
  id: number;
  nombre: string;
  estado: boolean;
  url?: string;
}
