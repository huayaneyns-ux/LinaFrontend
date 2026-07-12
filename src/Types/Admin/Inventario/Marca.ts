export interface MarcaSelectDto {
  id: number;
  nombre: string;
  estado: boolean;
  url?: string;
}

export interface MarcaInsertDto {
  nombre: string;
  url?: string;
}

export interface MarcaUpdateDto {
  id: number;
  nombre: string;
  estado: boolean;
  url?: string;
}
