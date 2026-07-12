export interface MovimientoSelectDto {
  id: number;
  tipo: string;
  idProducto: number;
  productoNombre: string;
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

export interface MovimientoInsertDto {
  tipo: string;
  idProducto: number;
  cantidad: number;
  motivo: string;
}

export interface MovimientoUpdateDto {
  id: number;
  tipo: string;
  idProducto: number;
  cantidad: number;
  motivo: string;
}
