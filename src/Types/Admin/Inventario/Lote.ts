export interface LoteSelectDto {
  id: number;
  idProducto: number;
  productoNombre: string;
  cantidadInicial: number;
  cantidadActual: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
  estado: boolean;
}

export interface LoteInsertDto {
  idProducto: number;
  cantidadInicial: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
}

export interface LoteUpdateDto {
  id: number;
  idProducto: number;
  cantidadInicial: number;
  cantidadActual: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
  estado: boolean;
}
