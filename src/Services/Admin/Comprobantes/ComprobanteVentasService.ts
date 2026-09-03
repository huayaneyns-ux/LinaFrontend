import { api, API_BASE_URL } from '../../apiService';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
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
      '/facturacion/comprobantes/ventas',
      { method: 'GET' },
    );
    return data.map(normalizeComprobante);
  },

  async getById(id: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/ventas/${id}`,
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

  async sincronizarEstadoSunat(id: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/ventas/${id}/sincronizar-sunat`,
      {
        method: 'POST',
      },
    );
    return normalizeComprobante(data);
  },

  async getPDF(id: string, format: PDFFormat): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/facturacion/comprobantes/ventas/${id}/pdf?format=${encodeURIComponent(format)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.blob();
  },

  async anular(id: string, reason: string): Promise<ComprobanteSelectDto> {
    const data = await api.request<Record<string, unknown>>(
      `/facturacion/comprobantes/ventas/${id}/anular`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
    return normalizeComprobante(data);
  },
};
