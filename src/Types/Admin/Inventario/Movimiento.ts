//=========================================
// LISTAR MOVIMIENTOS
//=========================================
export interface MovimientoSelectDto {

  idMovimiento: number;

  fecha: string;


  idTipoMovimiento: number;

  tipoMovimiento: string;


  idProducto: number;

  codigoProducto: string;

  producto: string;


  idLote: number;

  codigoLote: string;


  idUsuario: number;

  usuario: string;


  cantidad: number;

  motivo?: string;


  stockActual: number;
}