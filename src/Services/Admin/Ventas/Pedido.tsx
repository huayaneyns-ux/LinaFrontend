import { api } from '../../../Services/apiService';

import type {
  PedidoInsertDto,
  PedidoUpdateEstadoDto,
  PedidoSelectIdDto,
  PedidoSelectDto,
  PedidoDetalleDto,
} from '../../../Types/Admin/Ventas/Pedido';

const pick = (raw: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
};

const toNum = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function normalizePedidoLista(raw: Record<string, unknown>): PedidoSelectDto {
  return {
    id_pedido: toNum(pick(raw, 'id_pedido', 'idPedido', 'IdPedido', 'id')),
    fecha_pedido: String(pick(raw, 'fecha_pedido', 'fechaPedido', 'FechaPedido') ?? ''),
    fecha_entrega: (pick(raw, 'fecha_entrega', 'fechaEntrega', 'FechaEntrega') as string | null | undefined) ?? null,
    tipo_entrega: String(pick(raw, 'tipo_entrega', 'tipoEntrega', 'TipoEntrega') ?? ''),
    igv: toNum(pick(raw, 'igv', 'Igv', 'IGV')),
    ruta_comprobante: (pick(raw, 'ruta_comprobante', 'rutaComprobante', 'RutaComprobante') as string | null | undefined) ?? null,
    estado_pedido: toNum(pick(raw, 'estado_pedido', 'estadoPedido', 'EstadoPedido', 'estado', 'Estado')),
    estado_pedido_nombre: (pick(raw, 'estado_pedido_nombre', 'estadoPedidoNombre', 'EstadoPedidoNombre') as string | undefined),
    id_cliente: toNum(pick(raw, 'id_cliente', 'idCliente', 'IdCliente')),
    cliente: String(pick(raw, 'cliente', 'Cliente') ?? ''),
    telefono: String(pick(raw, 'telefono', 'Telefono', 'Teléfono') ?? ''),
    id_pago: pick(raw, 'id_pago', 'idPago', 'IdPago') != null
      ? toNum(pick(raw, 'id_pago', 'idPago', 'IdPago'))
      : null,
    monto: pick(raw, 'monto', 'Monto', 'total', 'Total') != null
      ? toNum(pick(raw, 'monto', 'Monto', 'total', 'Total'))
      : null,
    codigo_operacion: (pick(raw, 'codigo_operacion', 'codigoOperacion', 'CodigoOperacion') as string | null | undefined) ?? null,
    id_metodo_pago: pick(raw, 'id_metodo_pago', 'idMetodoPago', 'IdMetodoPago') != null
      ? toNum(pick(raw, 'id_metodo_pago', 'idMetodoPago', 'IdMetodoPago'))
      : null,
    metodo_pago: (pick(raw, 'metodo_pago', 'metodoPago', 'MetodoPago') as string | null | undefined) ?? null,
  };
}

function normalizeDetalleItem(raw: Record<string, unknown>): PedidoDetalleDto {
  return {
    id_detalle_pedido: toNum(pick(raw, 'id_detalle_pedido', 'idDetallePedido', 'IdDetallePedido', 'id')),
    id_producto: toNum(pick(raw, 'id_producto', 'idProducto', 'IdProducto')),
    producto: String(pick(raw, 'producto', 'Producto', 'nombre', 'Nombre') ?? ''),
    codigo: String(pick(raw, 'codigo', 'Codigo') ?? ''),
    ruta_imagen: (pick(raw, 'ruta_imagen', 'rutaImagen', 'RutaImagen') as string | null | undefined) ?? null,
    cantidad: toNum(pick(raw, 'cantidad', 'Cantidad'), 1),
    precio_venta: toNum(pick(raw, 'precio_venta', 'precioVenta', 'PrecioVenta')),
  };
}

function normalizePedidoDetalle(raw: Record<string, unknown>): PedidoSelectIdDto {
  const detalleRaw = pick(raw, 'detalle', 'Detalle', 'detalles', 'Detalles');
  const detalleList = Array.isArray(detalleRaw)
    ? detalleRaw.map(item => normalizeDetalleItem(item as Record<string, unknown>))
    : [];

  return {
    id_pedido: toNum(pick(raw, 'id_pedido', 'idPedido', 'IdPedido', 'id')),
    id_cliente: toNum(pick(raw, 'id_cliente', 'idCliente', 'IdCliente')),
    cliente: String(pick(raw, 'cliente', 'Cliente') ?? ''),
    telefono: String(pick(raw, 'telefono', 'Telefono') ?? ''),
    fecha_pedido: String(pick(raw, 'fecha_pedido', 'fechaPedido', 'FechaPedido') ?? ''),
    fecha_entrega: (pick(raw, 'fecha_entrega', 'fechaEntrega', 'FechaEntrega') as string | null | undefined) ?? null,
    tipo_entrega: String(pick(raw, 'tipo_entrega', 'tipoEntrega', 'TipoEntrega') ?? ''),
    igv: toNum(pick(raw, 'igv', 'Igv', 'IGV')),
    ruta_comprobante: (pick(raw, 'ruta_comprobante', 'rutaComprobante', 'RutaComprobante') as string | null | undefined) ?? null,
    estado_pedido: toNum(pick(raw, 'estado_pedido', 'estadoPedido', 'EstadoPedido', 'estado', 'Estado')),
    estado_pedido_nombre: (pick(raw, 'estado_pedido_nombre', 'estadoPedidoNombre', 'EstadoPedidoNombre') as string | undefined),
    id_pago: pick(raw, 'id_pago', 'idPago', 'IdPago') != null
      ? toNum(pick(raw, 'id_pago', 'idPago', 'IdPago'))
      : null,
    monto: pick(raw, 'monto', 'Monto', 'total', 'Total') != null
      ? toNum(pick(raw, 'monto', 'Monto', 'total', 'Total'))
      : null,
    metodo_pago: (pick(raw, 'metodo_pago', 'metodoPago', 'MetodoPago') as string | null | undefined) ?? null,
    codigo_operacion: (pick(raw, 'codigo_operacion', 'codigoOperacion', 'CodigoOperacion') as string | null | undefined) ?? null,
    detalle: detalleList,
  };
}

function normalizeCambiarEstadoResponse(raw: unknown): { success: boolean; mensaje: string } {
  if (raw == null || typeof raw !== 'object') {
    return { success: true, mensaje: 'Estado actualizado' };
  }
  const data = raw as Record<string, unknown>;
  const successRaw = pick(data, 'success', 'Success', 'exito', 'Exito');
  const success =
    successRaw === undefined
      ? true
      : successRaw === true || successRaw === 1 || String(successRaw).toLowerCase() === 'true';
  const mensaje = String(
    pick(data, 'mensaje', 'Mensaje', 'message', 'Message') ?? (success ? 'Estado actualizado' : 'No se pudo actualizar')
  );
  return { success, mensaje };
}

export const PedidoService = {

  //=========================================
  // INSERTAR PEDIDO
  //=========================================
  createPedido: async (
    data: PedidoInsertDto
  ): Promise<{
    success: boolean;
    mensaje: string;
    idPedido: number;
  }> => {
    const idDirNum = data.idDireccion && data.idDireccion > 0 ? Number(data.idDireccion) : 0;
    const payload = {
      idCliente: Number(data.idCliente),
      idDireccion: idDirNum,
      idVenta: Number(data.idVenta || 0),
      fechaPedido: data.fechaPedido || new Date().toISOString(),
      fechaEntrega: data.fechaEntrega || null,
      tipoEntrega: data.tipoEntrega,
      igv: Number(data.igv || 0),
      idMetodoPago: Number(data.idMetodoPago),
      monto: Number(data.monto || 0),
      codigoOperacion: data.codigoOperacion || null,
      rutaComprobante: data.rutaComprobante || null,
      detalle: (data.detalle || []).map(item => ({
        idProducto: Number(item.idProducto),
        cantidad: Number(item.cantidad),
        id_producto: Number(item.idProducto),
        IdProducto: Number(item.idProducto),
        Cantidad: Number(item.cantidad),
      })),

      // Snake_case aliases
      id_cliente: Number(data.idCliente),
      id_direccion: idDirNum,
      id_venta: Number(data.idVenta || 0),
      fecha_pedido: data.fechaPedido || new Date().toISOString(),
      tipo_entrega: data.tipoEntrega,
      id_metodo_pago: Number(data.idMetodoPago),
      codigo_operacion: data.codigoOperacion || null,
      ruta_comprobante: data.rutaComprobante || null,

      // PascalCase aliases
      IdCliente: Number(data.idCliente),
      IdDireccion: idDirNum,
      IdVenta: Number(data.idVenta || 0),
      FechaPedido: data.fechaPedido || new Date().toISOString(),
      TipoEntrega: data.tipoEntrega,
      Igv: Number(data.igv || 0),
      IdMetodoPago: Number(data.idMetodoPago),
      Monto: Number(data.monto || 0),
      CodigoOperacion: data.codigoOperacion || null,
      RutaComprobante: data.rutaComprobante || null,
      Detalle: (data.detalle || []).map(item => ({
        IdProducto: Number(item.idProducto),
        Cantidad: Number(item.cantidad),
      })),
    };

    return api.request<{
      success: boolean;
      mensaje: string;
      idPedido: number;
    }>(
      '/PedidosRecibidos/Insertar',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },


  //=========================================
  // CAMBIAR ESTADO PEDIDO
  // Body: { id_pedido, estado_pedido }
  //=========================================
  cambiarEstado: async (
    data: PedidoUpdateEstadoDto
  ): Promise<{
    success: boolean;
    mensaje: string;
  }> => {
    const payload = {
      id_pedido: Number(data.id_pedido),
      estado_pedido: Number(data.estado_pedido),
    };

    const raw = await api.request<unknown>(
      '/PedidosRecibidos/CambiarEstado',
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    );

    return normalizeCambiarEstadoResponse(raw);
  },


  //=========================================
  // OBTENER PEDIDO POR ID
  //=========================================
  getPedidoById: async (
    id: number
  ): Promise<PedidoSelectIdDto> => {
    const raw = await api.request<Record<string, unknown>>(
      `/PedidosRecibidos/${id}`,
      {
        method: 'GET'
      }
    );
    return normalizePedidoDetalle(raw ?? {});
  },


  //=========================================
  // LISTAR PEDIDOS
  //=========================================
  getPedidos: async (): Promise<PedidoSelectDto[]> => {
    const raw = await api.request<unknown>(
      '/PedidosRecibidos/Lista',
      {
        method: 'GET'
      }
    );

    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

    return list.map(item => normalizePedidoLista(item as Record<string, unknown>));
  }

};
