//=========================================
// INSERTAR PEDIDO
//=========================================

export interface PedidoInsertDto {
  // PEDIDO
  idCliente: number;
  idDireccion: number;
  idVenta?: number | null;
  fechaPedido: string;
  fechaEntrega?: string | null;
  tipoEntrega: string;
  igv: number;

  // PAGO
  idMetodoPago: number;
  monto: number;
  codigoOperacion?: string | null;
  rutaComprobante?: string | null;

  // DETALLE
  detalle: PedidoDetalleInsertDto[];
}


export interface PedidoDetalleInsertDto {
  idProducto: number;
  cantidad: number;
}


//=========================================
// LISTAR PEDIDOS
// GET: /PedidosRecibidos/Lista
//=========================================

export interface PedidoSelectDto {

  id_pedido: number;

  fecha_pedido: string;

  fecha_entrega?: string | null;

  tipo_entrega: string;

  igv: number;

  ruta_comprobante?: string | null;


  // ESTADO
  estado_pedido: number;

  estado_pedido_nombre?: string;


  // CLIENTE
  id_cliente: number;

  cliente: string;

  telefono: string;


  // PAGO
  id_pago?: number | null;

  monto?: number | null;

  codigo_operacion?: string | null;


  // METODO PAGO
  id_metodo_pago?: number | null;

  metodo_pago?: string | null;
}


//=========================================
// ACTUALIZAR ESTADO
// PUT: /PedidosRecibidos/CambiarEstado
//=========================================

export interface PedidoUpdateEstadoDto {

  id_pedido: number;

  estado_pedido: number;
}


//=========================================
// OBTENER PEDIDO POR ID
// GET: /PedidosRecibidos/{id}
//=========================================

export interface PedidoSelectIdDto {

  id_pedido: number;


  // CLIENTE
  id_cliente: number;

  cliente: string;

  telefono: string;


  // PEDIDO
  fecha_pedido: string;

  fecha_entrega?: string | null;

  tipo_entrega: string;

  igv: number;

  ruta_comprobante?: string | null;


  // ESTADO
  estado_pedido: number;

  estado_pedido_nombre?: string;


  // PAGO
  id_pago?: number | null;

  monto?: number | null;

  metodo_pago?: string | null;

  codigo_operacion?: string | null;


  // DETALLE
  detalle: PedidoDetalleDto[];
}


//=========================================
// DETALLE PEDIDO
//=========================================

export interface PedidoDetalleDto {

  id_detalle_pedido: number;

  id_producto: number;

  producto: string;

  codigo: string;

  ruta_imagen?: string | null;

  cantidad: number;

  precio_venta: number;
}
