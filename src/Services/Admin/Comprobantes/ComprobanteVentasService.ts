import { api, API_BASE_URL } from '../../apiService';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
  LiquidacionCompraDisponibleDto,
  LiquidacionCompraFormData,
  NotaComprobanteBaseDto,
  NotaFormData,
  PDFFormat,
  VentaOrigenComprobanteDto,
} from '../../../Types/Admin/Comprobantes/Comprobante';

interface EmitirComprobantePayload {
  tipo: 'BOLETA' | 'FACTURA';
  ventaOrigenId: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  moneda: 'PEN' | 'USD';
  observaciones?: string;
  cliente: {
    tipoDocumento: string;
    documento: string;
    nombre: string;
    direccion: string;
    correo: string;
  };
  pago?: {
    formaPago: 'CONTADO' | 'CREDITO';
    cuotas: Array<{
      monto: number;
      fechaVencimiento: string;
    }>;
  };
}

interface EmitirNotaPayload {
  voucherReferenciaId: string;
  fechaEmision: string;
  moneda: 'PEN' | 'USD';
  observaciones?: string;
  igvPorcentaje: number;
  motivo: {
    codigo: string;
    descripcion: string;
  };
  items: Array<{
    voucherItemReferenciaId?: string;
    productoId?: number;
    codigo?: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    unidadMedida: string;
  }>;
}

interface EmitirLiquidacionPayload {
  compraOrigenId: number;
  fechaEmision: string;
  moneda: 'PEN' | 'USD';
  observaciones?: string;
  vendedor: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombre: string;
  };
  ubicacionVendedor: {
    distritoId: number;
    direccion: string;
    codigoUbigeo?: string;
  };
  puntoVenta: {
    distritoId: number;
    direccion: string;
    codigoUbigeo?: string;
    codigoEstablecimiento?: string;
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown, fallback = ''): string {
  return value === null || value === undefined ? fallback : String(value);
}

function toNumberValue(value: unknown): number {
  return Number(value ?? 0) || 0;
}

function normalizeDetalle(raw: Record<string, unknown>) {
  return {
    itemId: raw.itemId ? String(raw.itemId) : raw.ItemId ? String(raw.ItemId) : undefined,
    productoId: Number(raw.productoId ?? raw.ProductoId ?? 0) || null,
    codigo: String(raw.codigo ?? raw.Codigo ?? ''),
    productoServicio: String(raw.productoServicio ?? raw.ProductoServicio ?? ''),
    cantidad: Number(raw.cantidad ?? raw.Cantidad ?? 0),
    precio: Number(raw.precio ?? raw.Precio ?? 0),
    igv: Number(raw.igv ?? raw.Igv ?? 0),
    importe: Number(raw.importe ?? raw.Importe ?? 0),
  };
}

function normalizeVenta(raw: Record<string, unknown>): VentaOrigenComprobanteDto {
  const cliente = asRecord(raw.cliente ?? raw.Cliente);
  const detalle = Array.isArray(raw.detalle ?? raw.Detalle)
    ? ((raw.detalle ?? raw.Detalle) as Record<string, unknown>[])
    : [];

  return {
    id: String(raw.id ?? raw.Id ?? ''),
    codigo: String(raw.codigo ?? raw.Codigo ?? ''),
    fecha: String(raw.fecha ?? raw.Fecha ?? ''),
    cliente: {
      tipoDocumento: String(cliente.tipoDocumento ?? cliente.TipoDocumento ?? ''),
      documento: String(cliente.documento ?? cliente.Documento ?? ''),
      nombre: String(cliente.nombre ?? cliente.Nombre ?? ''),
      direccion: String(cliente.direccion ?? cliente.Direccion ?? ''),
      correo: String(cliente.correo ?? cliente.Correo ?? ''),
    },
    detalle: detalle.map(normalizeDetalle),
    subtotal: Number(raw.subtotal ?? raw.Subtotal ?? 0),
    igv: Number(raw.igv ?? raw.Igv ?? 0),
    total: Number(raw.total ?? raw.Total ?? 0),
  };
}

function normalizeComprobante(raw: Record<string, unknown>): ComprobanteSelectDto {
  const pago = asRecord(raw.pago ?? raw.Pago);
  const detalle = Array.isArray(raw.detalle ?? raw.Detalle)
    ? ((raw.detalle ?? raw.Detalle) as Record<string, unknown>[])
    : [];
  const cuotasRaw = Array.isArray(pago.cuotas ?? pago.Cuotas)
    ? ((pago.cuotas ?? pago.Cuotas) as Record<string, unknown>[])
    : [];
  const cuotas = cuotasRaw.map((cuota) => ({
    numero: Number(cuota.numero ?? cuota.Numero ?? 0) || undefined,
    monto: Number(cuota.monto ?? cuota.Monto ?? 0),
    fechaVencimiento: String(cuota.fechaVencimiento ?? cuota.FechaVencimiento ?? ''),
  }));

  return {
    id: String(raw.id ?? raw.Id ?? ''),
    tipo: (raw.tipo ?? raw.Tipo ?? 'BOLETA') as ComprobanteSelectDto['tipo'],
    serie: String(raw.serie ?? raw.Serie ?? ''),
    numero: String(raw.numero ?? raw.Numero ?? ''),
    fechaEmision: String(raw.fechaEmision ?? raw.FechaEmision ?? ''),
    cliente: String(raw.cliente ?? raw.Cliente ?? ''),
    documentoCliente: String(raw.documentoCliente ?? raw.DocumentoCliente ?? ''),
    subtotal: Number(raw.subtotal ?? raw.Subtotal ?? 0),
    igv: Number(raw.igv ?? raw.Igv ?? 0),
    total: Number(raw.total ?? raw.Total ?? 0),
    estado: (raw.estado ?? raw.Estado ?? 'BORRADOR') as ComprobanteSelectDto['estado'],
    estadoSunat: (raw.estadoSunat ?? raw.EstadoSunat ?? 'PENDIENTE') as ComprobanteSelectDto['estadoSunat'],
    tipoDocumentoCliente: String(raw.tipoDocumentoCliente ?? raw.TipoDocumentoCliente ?? ''),
    direccionCliente: String(raw.direccionCliente ?? raw.DireccionCliente ?? ''),
    correoCliente: String(raw.correoCliente ?? raw.CorreoCliente ?? ''),
    codigoRespuestaSunat: String(raw.codigoRespuestaSunat ?? raw.CodigoRespuestaSunat ?? ''),
    mensajeSunat: String(raw.mensajeSunat ?? raw.MensajeSunat ?? ''),
    fechaConsultaSunat: String(raw.fechaConsultaSunat ?? raw.FechaConsultaSunat ?? ''),
    fechaEnvioSunat: String(raw.fechaEnvioSunat ?? raw.FechaEnvioSunat ?? ''),
    detalle: detalle.map((item) => ({
      itemId: item.itemId ? String(item.itemId) : item.ItemId ? String(item.ItemId) : undefined,
      productoServicio: String(item.productoServicio ?? item.ProductoServicio ?? ''),
      codigo: String(item.codigo ?? item.Codigo ?? ''),
      cantidad: Number(item.cantidad ?? item.Cantidad ?? 0),
      precio: Number(item.precio ?? item.Precio ?? 0),
      igv: Number(item.igv ?? item.Igv ?? 0),
      importe: Number(item.importe ?? item.Importe ?? 0),
    })),
    documentId: raw.documentId ? String(raw.documentId) : undefined,
    fileName: raw.fileName ? String(raw.fileName) : undefined,
    pdfUrl: raw.pdfUrl ? String(raw.pdfUrl) : undefined,
    xmlUrl: raw.xmlUrl ? String(raw.xmlUrl) : undefined,
    cdrUrl: raw.cdrUrl ? String(raw.cdrUrl) : undefined,
    ventaOrigenId: raw.ventaOrigenId ? String(raw.ventaOrigenId) : undefined,
    fechaVencimiento: raw.fechaVencimiento ? String(raw.fechaVencimiento) : undefined,
    observaciones: raw.observaciones ? String(raw.observaciones) : undefined,
    pago: Object.keys(pago).length > 0
      ? {
          formaPago: String(pago.formaPago ?? pago.FormaPago ?? ''),
          cuotas,
        }
      : undefined,
  };
}

function normalizeNotaBase(raw: Record<string, unknown>): NotaComprobanteBaseDto {
  const items = Array.isArray(raw.items ?? raw.Items)
    ? ((raw.items ?? raw.Items) as Record<string, unknown>[])
    : [];

  return {
    id: toStringValue(raw.id ?? raw.Id),
    tipo: toStringValue(raw.tipo ?? raw.Tipo, 'BOLETA') as NotaComprobanteBaseDto['tipo'],
    sunatTypeCode: toStringValue(raw.sunatTypeCode ?? raw.SunatTypeCode),
    serie: toStringValue(raw.serie ?? raw.Serie),
    numero: toStringValue(raw.numero ?? raw.Numero),
    fechaEmision: toStringValue(raw.fechaEmision ?? raw.FechaEmision),
    moneda: toStringValue(raw.moneda ?? raw.Moneda, 'PEN') as NotaComprobanteBaseDto['moneda'],
    clienteNombre: toStringValue(raw.clienteNombre ?? raw.ClienteNombre),
    clienteTipoDocumento: toStringValue(raw.clienteTipoDocumento ?? raw.ClienteTipoDocumento),
    clienteDocumento: toStringValue(raw.clienteDocumento ?? raw.ClienteDocumento),
    clienteDireccion: toStringValue(raw.clienteDireccion ?? raw.ClienteDireccion),
    subtotal: toNumberValue(raw.subtotal ?? raw.Subtotal),
    igv: toNumberValue(raw.igv ?? raw.Igv),
    total: toNumberValue(raw.total ?? raw.Total),
    items: items.map((item) => ({
      id: toStringValue(item.id ?? item.Id),
      productoId: Number(item.productoId ?? item.ProductoId ?? 0) || null,
      codigo: toStringValue(item.codigo ?? item.Codigo),
      descripcion: toStringValue(item.descripcion ?? item.Descripcion),
      cantidad: toNumberValue(item.cantidad ?? item.Cantidad),
      precioUnitario: toNumberValue(item.precioUnitario ?? item.PrecioUnitario),
      valorVenta: toNumberValue(item.valorVenta ?? item.ValorVenta),
      igv: toNumberValue(item.igv ?? item.Igv),
      importe: toNumberValue(item.importe ?? item.Importe),
      unidadMedida: toStringValue(item.unidadMedida ?? item.UnidadMedida, 'NIU'),
    })),
  };
}

function normalizeCompraLiquidacion(raw: Record<string, unknown>): LiquidacionCompraDisponibleDto {
  const vendedor = asRecord(raw.vendedor ?? raw.Vendedor);
  const ubicacionVendedorRaw = raw.ubicacionVendedor ?? raw.UbicacionVendedor;
  const ubicacionVendedor = ubicacionVendedorRaw ? asRecord(ubicacionVendedorRaw) : null;
  const detalle = Array.isArray(raw.detalle ?? raw.Detalle)
    ? ((raw.detalle ?? raw.Detalle) as Record<string, unknown>[])
    : [];

  return {
    compraId: toNumberValue(raw.compraId ?? raw.CompraId),
    codigo: toStringValue(raw.codigo ?? raw.Codigo),
    fechaCompra: toStringValue(raw.fechaCompra ?? raw.FechaCompra),
    vendedor: {
      tipoDocumento: toStringValue(vendedor.tipoDocumento ?? vendedor.TipoDocumento),
      numeroDocumento: toStringValue(vendedor.numeroDocumento ?? vendedor.NumeroDocumento),
      nombre: toStringValue(vendedor.nombre ?? vendedor.Nombre),
      nombreContacto: toStringValue(vendedor.nombreContacto ?? vendedor.NombreContacto) || undefined,
    },
    ubicacionVendedor: ubicacionVendedor
      ? {
          distritoId: toNumberValue(ubicacionVendedor.distritoId ?? ubicacionVendedor.DistritoId),
          departamento: toStringValue(ubicacionVendedor.departamento ?? ubicacionVendedor.Departamento),
          provincia: toStringValue(ubicacionVendedor.provincia ?? ubicacionVendedor.Provincia),
          distrito: toStringValue(ubicacionVendedor.distrito ?? ubicacionVendedor.Distrito),
          direccion: toStringValue(ubicacionVendedor.direccion ?? ubicacionVendedor.Direccion),
        }
      : null,
    detalle: detalle.map((item) => ({
      productoId: toNumberValue(item.productoId ?? item.ProductoId),
      codigo: toStringValue(item.codigo ?? item.Codigo),
      descripcion: toStringValue(item.descripcion ?? item.Descripcion),
      cantidad: toNumberValue(item.cantidad ?? item.Cantidad),
      precioUnitario: toNumberValue(item.precioUnitario ?? item.PrecioUnitario),
      valorVenta: toNumberValue(item.valorVenta ?? item.ValorVenta),
      igv: toNumberValue(item.igv ?? item.Igv),
      importe: toNumberValue(item.importe ?? item.Importe),
      unidadMedida: toStringValue(item.unidadMedida ?? item.UnidadMedida, 'NIU'),
    })),
    subtotal: toNumberValue(raw.subtotal ?? raw.Subtotal),
    igv: toNumberValue(raw.igv ?? raw.Igv),
    total: toNumberValue(raw.total ?? raw.Total),
  };
}

function buildEmitirPayload(formData: ComprobanteFormData): EmitirComprobantePayload {
  if (formData.tipo !== 'BOLETA' && formData.tipo !== 'FACTURA') {
    throw new Error('Solo boleta y factura usan el flujo real de comprobantes.');
  }

  return {
    tipo: formData.tipo,
    ventaOrigenId: Number(formData.ventaOrigenId),
    fechaEmision: formData.fechaEmision,
    fechaVencimiento: formData.fechaVencimiento || undefined,
    moneda: formData.moneda,
    observaciones: formData.observaciones || undefined,
    cliente: {
      tipoDocumento: formData.cliente.tipoDocumento,
      documento: formData.cliente.documento,
      nombre: formData.cliente.nombre,
      direccion: formData.cliente.direccion,
      correo: formData.cliente.correo,
    },
    pago: formData.tipo === 'FACTURA'
      ? {
          formaPago: formData.pago.formaPago,
          cuotas: formData.pago.cuotas,
        }
      : undefined,
  };
}

const NOTA_CREDITO_CODES: Record<string, string> = {
  'Anulación de la operación': '01',
  'Anulación por error en el RUC': '02',
  'Corrección por error en la descripción': '03',
  'Descuento global o por ítem': '04',
  'Devolución total o por ítem': '05',
  Bonificaciones: '06',
  'Disminución en el valor': '07',
};

const NOTA_DEBITO_CODES: Record<string, string> = {
  'Intereses por mora': '01',
  'Aumento en el valor': '02',
  Penalidades: '03',
  'Otros conceptos': '11',
};

function buildNotaPayload(formData: NotaFormData, base: NotaComprobanteBaseDto): EmitirNotaPayload {
  const motivoCodigo = formData.tipo === 'NOTA_CREDITO'
    ? NOTA_CREDITO_CODES[formData.motivo]
    : NOTA_DEBITO_CODES[formData.motivo];

  if (!motivoCodigo) {
    throw new Error('El motivo seleccionado no tiene código SUNAT configurado.');
  }

  return {
    voucherReferenciaId: base.id,
    fechaEmision: formData.fechaEmision,
    moneda: base.moneda,
    observaciones: formData.observaciones || undefined,
    igvPorcentaje: 18,
    motivo: {
      codigo: motivoCodigo,
      descripcion: formData.motivoDescripcion?.trim() || formData.motivo,
    },
    items: formData.detalle.map((item) => {
      const itemBase = base.items.find((baseItem) =>
        (item.productoId && baseItem.productoId === item.productoId) ||
        (item.codigo && baseItem.codigo === item.codigo) ||
        baseItem.descripcion === item.productoServicio
      );

      return {
        voucherItemReferenciaId: itemBase?.id,
        productoId: item.productoId ?? undefined,
        codigo: item.codigo || undefined,
        descripcion: item.productoServicio,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        unidadMedida: itemBase?.unidadMedida || 'NIU',
      };
    }),
  };
}

function buildLiquidacionPayload(formData: LiquidacionCompraFormData): EmitirLiquidacionPayload {
  return {
    compraOrigenId: formData.compraOrigenId,
    fechaEmision: formData.fechaEmision,
    moneda: formData.moneda,
    observaciones: formData.observaciones || undefined,
    vendedor: { ...formData.vendedor },
    ubicacionVendedor: { ...formData.ubicacionVendedor },
    puntoVenta: { ...formData.puntoVenta },
  };
}

async function fetchPdf(url: string): Promise<Blob> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.blob();
}

export const ComprobanteVentasService = {
  async getVentasDisponibles(): Promise<VentaOrigenComprobanteDto[]> {
    const data = await api.request<Record<string, unknown>[]>(
      '/facturacion/comprobantes/ventas-disponibles',
      { method: 'GET' },
    );
    return data.map(normalizeVenta);
  },

  async getComprobantes(): Promise<ComprobanteSelectDto[]> {
    const data = await api.request<Record<string, unknown>[]>(
      '/facturacion/comprobantes',
      { method: 'GET' },
    );
    return data.map(normalizeComprobante);
  },

  async getById(id: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/${id}`,
      { method: 'GET' },
    );
    return normalizeComprobante(data);
  },

  async emitir(formData: ComprobanteFormData): Promise<ComprobanteSelectDto> {
    const payload = buildEmitirPayload(formData);
    const data = await api.request<Record<string, unknown>>(
      '/facturacion/comprobantes/ventas',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return normalizeComprobante(data);
  },

  async getBasesNotas(): Promise<NotaComprobanteBaseDto[]> {
    const data = await api.request<Record<string, unknown>[]>(
      '/facturacion/comprobantes/notas/bases',
      { method: 'GET' },
    );
    return data.map(normalizeNotaBase);
  },

  async emitirNota(formData: NotaFormData, base: NotaComprobanteBaseDto): Promise<void> {
    const payload = buildNotaPayload(formData, base);
    const endpoint = formData.tipo === 'NOTA_CREDITO'
      ? '/facturacion/comprobantes/notas/credito'
      : '/facturacion/comprobantes/notas/debito';

    await api.request<Record<string, unknown>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getComprasDisponiblesLiquidacion(): Promise<LiquidacionCompraDisponibleDto[]> {
    const data = await api.request<Record<string, unknown>[]>(
      '/facturacion/comprobantes/liquidaciones/compras-disponibles',
      { method: 'GET' },
    );
    return data.map(normalizeCompraLiquidacion);
  },

  async emitirLiquidacion(formData: LiquidacionCompraFormData): Promise<void> {
    const payload = buildLiquidacionPayload(formData);
    await api.request<Record<string, unknown>>(
      '/facturacion/comprobantes/liquidaciones',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  async sincronizarEstadoSunat(id: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/${id}/sincronizar-sunat`,
      {
        method: 'POST',
      },
    );
    return normalizeComprobante(data);
  },

  async getPDF(id: string, format: PDFFormat): Promise<Blob> {
    return fetchPdf(
      `${API_BASE_URL}/facturacion/comprobantes/${id}/pdf?format=${encodeURIComponent(format)}`,
    );
  },

  async anular(id: string, reason: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/${id}/anular`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
    return normalizeComprobante(data);
  },
};
