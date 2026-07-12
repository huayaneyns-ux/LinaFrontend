export interface UnidadMedidaSelectDto {
  id: number;
  nombre: string;
  abreviatura: string;
  estado: boolean;
}

export interface UnidadMedidaInsertDto {
  nombre: string;
  abreviatura: string;
}

export interface UnidadMedidaUpdateDto {
  id: number;
  nombre: string;
  abreviatura: string;
  estado: boolean;
}
