// =====================================
// CLIENTE
// =====================================

export interface CajaClienteDto {
  id: number;
  nombreApellido: string;
  dni: string;
  tipoDocumento?: string;
  documento?: string;
  direccion?: string;
  telefono: string;
  correo: string;
}


export interface CajaClienteInsertDto {
  nombreApellido: string;
  dni: string;
  tipoDocumento?: 'DNI' | 'RUC';
  documento?: string;
  direccion?: string;
  ubigeo?: string;
  telefono: string;
  correo: string;
}

export interface CajaComprobanteFiscalDto {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  direccion: string;
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

  idCliente: number | null;

  idUsuario: number;

  tipoComprobante: 'BOLETA' | 'FACTURA' | 'SIN_COMPROBANTE';

  clienteFiscal?: CajaComprobanteFiscalDto;

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
