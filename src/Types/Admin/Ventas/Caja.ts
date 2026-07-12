// =====================================
// CLIENTE
// =====================================

export interface CajaClienteDto {
  id: number;
  nombreApellido: string;
  dni: string;
  telefono: string;
  correo: string;
}


export interface CajaClienteInsertDto {
  nombreApellido: string;
  dni: string;
  telefono: string;
  correo: string;
}


// =====================================
// DETALLE DE VENTA
// =====================================

export interface CajaDetalleInsertDto {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
}


// =====================================
// PAGOS
// =====================================

export interface CajaPagoInsertDto {
  idMetodoPago: number;
  monto: number;
  codigoOperacion?: string;
}


// =====================================
// REGISTRAR VENTA
// =====================================

export interface CajaVentaInsertDto {

  idCliente: number;

  idUsuario: number;

  igv: number;

  detalle: CajaDetalleInsertDto[];

  pagos: CajaPagoInsertDto[];

}


// =====================================
// RESPUESTA REGISTRO
// =====================================

export interface CajaVentaResponseDto {

  idVenta: number;

  mensaje: string;

}