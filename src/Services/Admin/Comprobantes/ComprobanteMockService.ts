import {
  mockComprobantes,
  mockProductosComprobante,
  mockVentasDisponibles,
} from '../../../Constantes/Data/MockComprobantes';
import type {
  ComprobanteFormData,
  ComprobanteEstadoSunat,
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
  NotaFormData,
  NotaComprobanteSelectDto,
} from '../../../Types/Admin/Comprobantes/Comprobante';

const MOCK_LOADING_DELAY_MS = 450;
const MOCK_SUNAT_DELAY_MS = 850;
const MOCK_GENERATION_DELAY_MS = 700;

let comprobantesStore = mockComprobantes.map(comprobante => ({ ...comprobante }));

const wait = () => new Promise<void>(resolve => {
  window.setTimeout(resolve, MOCK_LOADING_DELAY_MS);
});

const waitForSunat = () => new Promise<void>(resolve => {
  window.setTimeout(resolve, MOCK_SUNAT_DELAY_MS);
});

const waitForGeneration = () => new Promise<void>(resolve => {
  window.setTimeout(resolve, MOCK_GENERATION_DELAY_MS);
});

const cloneVenta = (venta: VentaOrigenComprobanteDto): VentaOrigenComprobanteDto => ({
  ...venta,
  cliente: { ...venta.cliente },
  detalle: venta.detalle.map(item => ({ ...item })),
});

const cloneComprobante = (comprobante: ComprobanteSelectDto): ComprobanteSelectDto => ({
  ...comprobante,
  detalle: comprobante.detalle.map(item => ({ ...item })),
  bienesTransportados: comprobante.bienesTransportados ? [...comprobante.bienesTransportados] : undefined,
});

const getNextDocumentNumber = (tipo: ComprobanteFormData['tipo'] | NotaFormData['tipo']) => {
  let serie: string;
  if (tipo === 'BOLETA') {
    serie = 'B001';
  } else if (tipo === 'FACTURA') {
    serie = 'F001';
  } else if (tipo === 'NOTA_CREDITO') {
    serie = 'BC01';
  } else if (tipo === 'NOTA_DEBITO') {
    serie = 'BD01';
  } else {
    serie = 'B001';
  }
  
  const lastNumber = comprobantesStore
    .filter(comprobante => comprobante.tipo === tipo && comprobante.serie === serie)
    .reduce((highest, comprobante) => Math.max(highest, Number(comprobante.numero)), 0);

  return { serie, numero: String(lastNumber + 1).padStart(8, '0') };
};

const getNextSunatStatus = (status: ComprobanteEstadoSunat): ComprobanteEstadoSunat => {
  if (status === 'PENDIENTE' || status === 'ENVIADO' || status === 'OBSERVADO') return 'ACEPTADO';
  return status;
};

export const ComprobanteMockService = {
  async getComprobantes(): Promise<ComprobanteSelectDto[]> {
    await wait();
    return comprobantesStore.map(cloneComprobante);
  },

  async getVentasDisponibles(): Promise<VentaOrigenComprobanteDto[]> {
    await wait();
    return mockVentasDisponibles.map(cloneVenta);
  },

  async getProductosDisponibles(): Promise<ProductoComprobanteMockDto[]> {
    await wait();
    return mockProductosComprobante.map(producto => ({ ...producto }));
  },

  async crearComprobante(formData: ComprobanteFormData): Promise<ComprobanteSelectDto> {
    await waitForGeneration();
    const { serie, numero } = getNextDocumentNumber(formData.tipo);
    const subtotal = Number(formData.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
    const igv = Number(formData.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2));
    const total = Number((subtotal + igv).toFixed(2));
    const id = Math.max(...comprobantesStore.map(comprobante => comprobante.id), 0) + 1;
    const fechaEnvioSunat = new Date().toISOString();
    const nuevoComprobante: ComprobanteSelectDto = {
      id,
      tipo: formData.tipo,
      serie,
      numero,
      fechaEmision: formData.fechaEmision,
      cliente: formData.cliente.nombre || 'Cliente general',
      documentoCliente: formData.cliente.documento,
      tipoDocumentoCliente: formData.cliente.tipoDocumento,
      direccionCliente: formData.cliente.direccion,
      correoCliente: formData.cliente.correo,
      subtotal,
      igv,
      total,
      estado: 'EMITIDO',
      estadoSunat: 'PENDIENTE',
      codigoRespuestaSunat: '98',
      mensajeSunat: 'Pendiente de consulta SUNAT (simulado).',
      fechaConsultaSunat: '',
      fechaEnvioSunat,
      ventaOrigenId: formData.origen === 'VENTA' ? formData.ventaOrigenId : undefined,
      fechaVencimiento: formData.fechaVencimiento || undefined,
      observaciones: formData.observaciones || undefined,
      detalle: formData.detalle.map(item => ({
        productoServicio: item.productoServicio,
        codigo: item.codigo,
        cantidad: item.cantidad,
        precio: item.precio,
        igv: item.igv,
        importe: item.importe,
      })),
    };

    comprobantesStore = [nuevoComprobante, ...comprobantesStore];
    return cloneComprobante(nuevoComprobante);
  },

  async crearNota(formData: NotaFormData): Promise<NotaComprobanteSelectDto> {
    await waitForGeneration();
    const { serie, numero } = getNextDocumentNumber(formData.tipo);
    const subtotal = Number(formData.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
    const igv = Number(formData.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2));
    const total = Number((subtotal + igv).toFixed(2));
    const id = Math.max(...comprobantesStore.map(comprobante => comprobante.id), 0) + 1;
    const responseTime = new Date().toISOString();
    
    // Find the related comprobante to get its fechaEmision
    const relatedComprobante = comprobantesStore.find(c => c.id === formData.comprobanteRelacionado.id);
    const fechaEmisionRelacionado = relatedComprobante?.fechaEmision || formData.fechaEmision;
    
    const nuevoComprobante: NotaComprobanteSelectDto = {
      id,
      serie,
      numero,
      tipo: formData.tipo,
      status: 'PENDIENTE',
      responseTime,
      issueTime: formData.fechaEmision,
      nombreCliente: formData.cliente.nombre || 'Cliente general',
      tipoDocumentoCliente: formData.cliente.tipoDocumento || 'DNI',
      documentoCliente: formData.cliente.documento || '',
      direccionCliente: formData.cliente.direccion || '',
      correoCliente: formData.cliente.correo || '',
      subtotal,
      igv,
      total,
      estado: 'EMITIDO',
      estadoSunat: 'PENDIENTE',
      mensajeSunat: 'Pendiente de consulta SUNAT (simulado).',
      comprobanteRelacionado: {
        ...formData.comprobanteRelacionado,
        fechaEmision: fechaEmisionRelacionado,
      },
      motivoDescripcion: formData.motivo,
      detalle: formData.detalle.map(item => ({
        productoServicio: item.productoServicio,
        codigo: item.codigo,
        cantidad: item.cantidad,
        precio: item.precio,
        igv: item.igv,
        importe: item.importe,
      })),
      observaciones: formData.observaciones,
      fileName: '',
      faults: [],
      notes: [],
      reference: '',
    };

    comprobantesStore = [nuevoComprobante as any, ...comprobantesStore];
    return nuevoComprobante;
  },

  async actualizarEstadoSunat(id: number): Promise<ComprobanteSelectDto> {
    await waitForSunat();
    const comprobante = comprobantesStore.find(item => item.id === id);

    if (!comprobante) {
      throw new Error('No se encontró el comprobante seleccionado.');
    }

    const estadoSunat = getNextSunatStatus(comprobante.estadoSunat);
    const fechaConsultaSunat = new Date().toISOString();
    const actualizado: ComprobanteSelectDto = {
      ...comprobante,
      estadoSunat,
      codigoRespuestaSunat: estadoSunat === 'ACEPTADO' ? '0' : comprobante.codigoRespuestaSunat,
      mensajeSunat: estadoSunat === 'ACEPTADO' ? 'Comprobante aceptado por SUNAT (simulado).' : comprobante.mensajeSunat,
      fechaConsultaSunat,
      fechaEnvioSunat: comprobante.fechaEnvioSunat || fechaConsultaSunat,
    };

    comprobantesStore = comprobantesStore.map(item => item.id === id ? actualizado : item);
    return cloneComprobante(actualizado);
  },
};
