//=========================================
// LISTAR / OBTENER COMPRA
//=========================================
export interface CompraSelectDto {

  idCompra: number;

  idUsuario: number;
  usuario: string;

  idProveedor: number;
  proveedor: string;

  fechaCompra: string;

  fechaRecepcion?: string;

  totalCompra: number;

  estado: boolean;

  detalles: CompraDetalleSelectDto[];

}


//=========================================
// DETALLE COMPRA
//=========================================
export interface CompraDetalleSelectDto {

  idDetalleCompra: number;

  idProducto: number;

  codigoProducto: string;

  producto: string;

  cantidad: number;

  costoTotal: number;

  costoUnitario: number;


  idLote?: number;

  codigoLote?: string;

  fechaVencimiento?: string;

  stockActual?: number;

}


//=========================================
// REGISTRAR COMPRA COMPLETA
//=========================================
export interface CompraCompletaInsertDto {

  idUsuario: number;

  idProveedor: number;

  fechaCompra: string;

  fechaRecepcion?: string;

  detalles: DetalleCompraCompletaDto[];

}


//=========================================
// DETALLE REGISTRO
//=========================================
export interface DetalleCompraCompletaDto {

  idProducto: number;

  cantidad: number;

  costoTotal: number;

  fechaFabricacion?: string;

  fechaVencimiento?: string;

}

//=========================================
// LISTAR COMPRA CABECERA
//=========================================
export interface CompraListaDto {

  idCompra: number;

  idUsuario: number;

  usuario: string;


  idProveedor: number;

  proveedor: string;


  fechaCompra: string;

  fechaRecepcion?: string;


  totalCompra: number;


  estado: boolean;

}