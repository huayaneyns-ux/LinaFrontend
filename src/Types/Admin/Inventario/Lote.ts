//=========================================
// INSERTAR LOTE
//=========================================
export interface LoteInsertDto {

  idDetalleCompra: number;

  fechaFabricacion?: string;

  fechaVencimiento?: string;

}

//=========================================
// LISTAR LOTES
//=========================================
export interface LoteSelectListarDto {
  idLote: number;
  codigoLote: string;

  idProducto: number;
  codigoProducto: string;
  producto: string;

  idProveedor: number;
  proveedor: string;

  fechaIngreso: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;

  cantidadIngresada: number;

  costoUnitario: number;
  valorCompra: number;

  diasParaVencer?: number;

  estadoLote: string;
}

//=========================================
// OBTENER LOTE
//=========================================
export interface LoteSelectDto {
  idLote: number;
  codigoLote: string;

  idProducto: number;
  codigoProducto: string;
  producto: string;

  idProveedor: number;
  proveedor: string;

  fechaIngreso: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;

  cantidadIngresada: number;

  costoUnitario: number;
  valorCompra: number;

  stockActual?: number;

  diasParaVencer?: number;

  estadoLote: string;

  movimientos: LoteMovimientoDto[];
}

//=========================================
// MOVIMIENTOS DEL LOTE
//=========================================
export interface LoteMovimientoDto {
  id: number;

  fecha: string;

  tipoMovimiento: string;

  cantidad: number;

  motivo?: string;
}

//=========================================
// REGISTRAR MOVIMIENTO
//=========================================
export interface MovimientoInsertDto {

  idUsuario: number;

  idLote: number;

  tipo: number;

  cantidad: number;

  motivo?: string;

}