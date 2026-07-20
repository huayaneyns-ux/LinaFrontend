//==============================
// INSERTAR PEDIDO
//==============================
export interface PedidoInsertDto {
  // Pedido
  idCliente: number;
  fechaPedido: string;
  fechaEntrega?: string;
  tipoEntrega: string;
  igv: number;

  // Pago
  idMetodoPago: number;
  monto: number;
  codigoOperacion?: string;
  rutaComprobante?: string;

  // Detalle
  detalle: PedidoDetalleInsertDto[];
}

export interface PedidoDetalleInsertDto {
  idProducto: number;
  cantidad: number;
}

//==============================
// LISTAR PEDIDOS
//==============================
export interface PedidoSelectDto {
  idPedido: number;

  fechaPedido: string;
  fechaEntrega?: string;

  tipoEntrega: string;

  igv: number;

  rutaComprobante?: string;

  estadoPedido: number;
  estadoPedidoNombre: string;

  idCliente: number;
  cliente: string;
  telefono: string;

  idPago?: number;
  monto?: number;

  idMetodoPago?: number;
  metodoPago?: string;

  codigoOperacion?: string;
}

//==============================
// ACTUALIZAR ESTADO
//==============================
export interface PedidoUpdateEstadoDto {
  idPedido: number;
  estadoPedido: number;
}

//==============================
// OBTENER PEDIDO POR ID
//==============================
export interface PedidoSelectIdDto {
  idPedido: number;

  idCliente: number;
  cliente: string;
  telefono: string;

  fechaPedido: string;
  fechaEntrega?: string;

  tipoEntrega: string;

  igv: number;

  rutaComprobante?: string;

  estadoPedido: number;
  estadoPedidoNombre: string;

  idPago?: number;
  monto?: number;

  idMetodoPago?: number;
  metodoPago?: string;

  codigoOperacion?: string;

  detalle: PedidoDetalleDto[];
}

export interface PedidoDetalleDto {
  idDetallePedido: number;

  idProducto: number;

  producto: string;
  codigo: string;

  rutaImagen?: string;

  cantidad: number;

  precioVenta: number;
}