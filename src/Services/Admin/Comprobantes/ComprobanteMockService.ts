import {
  mockComprobantes,
  mockProductosComprobante,
  mockVentasDisponibles,
  mockComprobantesEmitidos,
} from '../../../Constantes/Data/MockComprobantes';
import { EMPRESA } from '../../../Constantes/Empresa';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
  NotaFormData,
  NotaComprobanteSelectDto,
  GuiaRemisionFormData,
  GuiaRemisionRemitenteFormData,
  GuiaRemisionTransportistaFormData,
  ComprobanteTipo,
} from '../../../Types/Admin/Comprobantes/Comprobante';
import { buildSunatPayload } from './sunatPayloadBuilder';
import { buildSunatNotaPayload } from './sunatNotaPayloadBuilder';
import { buildSunatGuiaTransportistaPayload } from './sunatGuiaTransportistaPayloadBuilder';
import { buildSunatGuiaRemitentePayload } from './sunatGuiaRemitentePayloadBuilder';
import { SunatService } from './SunatService';

const MOCK_LOADING_DELAY_MS = 450;
const MOCK_SUNAT_DELAY_MS = 850;
const MOCK_GENERATION_DELAY_MS = 700;

let comprobantesStore = [
  ...mockComprobantesEmitidos.map((comprobante) => ({ ...comprobante })),
  ...mockComprobantes.map((comprobante) => ({ ...comprobante })),
];

const wait = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_LOADING_DELAY_MS);
  });

const waitForSunat = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_SUNAT_DELAY_MS);
  });

const waitForGeneration = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_GENERATION_DELAY_MS);
  });

const cloneVenta = (
  venta: VentaOrigenComprobanteDto,
): VentaOrigenComprobanteDto => ({
  ...venta,
  cliente: { ...venta.cliente },
  detalle: venta.detalle.map((item) => ({ ...item })),
});

const cloneComprobante = (
  comprobante: ComprobanteSelectDto,
): ComprobanteSelectDto => ({
  ...comprobante,
  detalle: comprobante.detalle.map((item) => ({ ...item })),
  bienesTransportados: comprobante.bienesTransportados
    ? [...comprobante.bienesTransportados]
    : undefined,
});

export const getNextDocumentNumber = (
  tipo: ComprobanteTipo,
  tipoComprobanteRelacionado?: 'BOLETA' | 'FACTURA',
) => {
  let serie: string;
  if (tipo === 'BOLETA') {
    serie = 'B001';
  } else if (tipo === 'FACTURA') {
    serie = 'F001';
  } else if (tipo === 'LIQUIDACION_COMPRA') {
    serie = 'L001';
  } else if (tipo === 'NOTA_CREDITO') {
    if (tipoComprobanteRelacionado === 'FACTURA') {
      serie = 'FC01';
    } else {
      serie = 'BC01';
    }
  } else if (tipo === 'NOTA_DEBITO') {
    if (tipoComprobanteRelacionado === 'FACTURA') {
      serie = 'FD01';
    } else {
      serie = 'BD01';
    }
  } else if (tipo === 'GUIA_REMISION_TRANSPORTISTA') {
    serie = 'V001';
    const randomNumero = String(
      Math.floor(10000000 + Math.random() * 90000000),
    );
    return { serie, numero: randomNumero };
  } else if (tipo === 'GUIA_REMISION_REMITENTE') {
    serie = 'T001';
    const randomNumero = String(
      Math.floor(10000000 + Math.random() * 90000000),
    );
    return { serie, numero: randomNumero };
  } else {
    serie = 'B001';
  }

  const lastNumber = comprobantesStore
    .filter(
      (comprobante) =>
        comprobante.tipo === tipo && comprobante.serie === serie,
    )
    .reduce(
      (highest, comprobante) =>
        Math.max(highest, Number(comprobante.numero) || 0),
      0,
    );

  return { serie, numero: String(lastNumber + 1).padStart(8, '0') };
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
    return mockProductosComprobante.map((producto) => ({ ...producto }));
  },

  async getNextCorrelativo(
    tipo: ComprobanteTipo,
    tipoComprobanteRelacionado?: 'BOLETA' | 'FACTURA',
  ) {
    return getNextDocumentNumber(tipo, tipoComprobanteRelacionado);
  },

  async crearComprobante(
    formData: ComprobanteFormData,
  ): Promise<ComprobanteSelectDto> {
    await waitForGeneration();
    const { serie, numero } = getNextDocumentNumber(formData.tipo);
    const subtotal = Number(
      formData.detalle
        .reduce((sum, item) => sum + item.precio * item.cantidad, 0)
        .toFixed(2),
    );
    const igv = Number(
      formData.detalle
        .reduce((sum, item) => sum + item.igv, 0)
        .toFixed(2),
    );
    const total = Number((subtotal + igv).toFixed(2));
    const id =
      Math.max(...comprobantesStore.map((comprobante) => comprobante.id), 0) +
      1;

    // 1. Construir el payload JSON SUNAT exacto (contrato UBL 2.1)
    const sunatPayload = buildSunatPayload({
      formData,
      serie,
      numero,
    });

    // 2. Enviar al API SUNAT
    const sunatResult = await SunatService.sendDocument(sunatPayload);

    // 3. Crear el comprobante con la respuesta SUNAT
    const nuevoComprobante: ComprobanteSelectDto = {
      id,
      tipo: formData.tipo,
      serie,
      numero,
      fechaEmision: formData.fechaEmision,
      cliente:
        formData.cliente.nombre ||
        (formData.tipo === 'FACTURA' ? 'Empresa' : 'Cliente general'),
      documentoCliente: formData.cliente.documento,
      tipoDocumentoCliente: formData.cliente.tipoDocumento,
      direccionCliente: formData.cliente.direccion,
      correoCliente: formData.cliente.correo,
      subtotal,
      igv,
      total,
      estado: sunatResult.success ? 'EMITIDO' : 'RECHAZADO',
      estadoSunat: sunatResult.success ? 'PENDIENTE' : sunatResult.status,
      codigoRespuestaSunat: sunatResult.codigoRespuestaSunat,
      mensajeSunat: sunatResult.mensajeSunat,
      fechaConsultaSunat: sunatResult.responseTime,
      fechaEnvioSunat: sunatResult.responseTime,
      pdfUrl: sunatResult.pdfUrl,
      ventaOrigenId:
        formData.origen === 'VENTA' ? formData.ventaOrigenId : undefined,
      fechaVencimiento: formData.fechaVencimiento || undefined,
      observaciones: formData.observaciones || undefined,
      detalle: formData.detalle.map((item) => ({
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

  async crearGuiaTransportista(
    formData: GuiaRemisionTransportistaFormData,
  ): Promise<ComprobanteSelectDto> {
    await waitForGeneration();
    const autoNumber = getNextDocumentNumber('GUIA_REMISION_TRANSPORTISTA');
    const serie = formData.serie || autoNumber.serie;
    const numero = formData.numero || autoNumber.numero;
    const id =
      Math.max(...comprobantesStore.map((comprobante) => comprobante.id), 0) +
      1;

    // 1. Construir el payload JSON SUNAT exacto para Transportista (Tipo 31)
    const sunatPayload = buildSunatGuiaTransportistaPayload({
      formData: {
        ...formData,
        serie,
        numero,
      },
      serie,
      numero,
    });

    // 2. Enviar a APISUNAT
    const sunatResult = await SunatService.sendDocument(sunatPayload);
    const responseTime = sunatResult.responseTime || new Date().toISOString();

    const primerVehiculo = formData.vehiculos?.[0]?.placa || undefined;
    const primerConductor = formData.conductores?.[0]
      ? `${formData.conductores[0].nombre} ${formData.conductores[0].apellidos || ''}`.trim()
      : undefined;

    const nuevoComprobante: ComprobanteSelectDto = {
      id,
      tipo: 'GUIA_REMISION_TRANSPORTISTA',
      serie,
      numero,
      fechaEmision: formData.fechaEmision,
      cliente: formData.destinatario.nombre || 'Destinatario',
      documentoCliente: formData.destinatario.numeroDocumento || '',
      tipoDocumentoCliente: formData.destinatario.tipoDocumento || 'RUC',
      direccionCliente: formData.puntoLlegada.direccion || '',
      correoCliente: '',
      subtotal: 0,
      igv: 0,
      total: 0,
      remitente: formData.remitente.nombre || 'Remitente',
      destinatario: formData.destinatario.nombre || 'Destinatario',
      fechaTraslado: formData.fechaInicioTraslado,
      puntoPartida: formData.puntoPartida.direccion,
      puntoLlegada: formData.puntoLlegada.direccion,
      pesoTotal: formData.pesoBrutoTotal,
      unidadMedidaPeso: formData.unidadMedidaPeso,
      transportista: formData.transportista.razonSocial || EMPRESA.razonSocial,
      rucTransportista: formData.transportista.ruc || EMPRESA.ruc,
      vehiculo: primerVehiculo,
      conductor: primerConductor,
      bienesTransportados: formData.bienes?.length
        ? formData.bienes.map((b) => b.descripcion)
        : ['Mercadería para traslado'],
      estado: sunatResult.success ? 'EMITIDO' : 'RECHAZADO',
      estadoSunat: sunatResult.success ? 'PENDIENTE' : sunatResult.status,
      codigoRespuestaSunat: sunatResult.codigoRespuestaSunat,
      mensajeSunat: sunatResult.mensajeSunat,
      fechaConsultaSunat: responseTime,
      fechaEnvioSunat: responseTime,
      pdfUrl: sunatResult.pdfUrl,
      observaciones: formData.observaciones || undefined,
      detalle: (formData.bienes?.length
        ? formData.bienes
        : [{ descripcion: 'Mercadería para traslado', cantidad: 1 }]
      ).map((item, idx) => ({
        productoServicio: item.descripcion,
        codigo: `GUIA-${String(idx + 1).padStart(4, '0')}`,
        cantidad: item.cantidad || 1,
        precio: 0,
        igv: 0,
        importe: 0,
      })),
    };

    comprobantesStore = [nuevoComprobante, ...comprobantesStore];
    return cloneComprobante(nuevoComprobante);
  },

  async crearGuia(
    formData: GuiaRemisionFormData,
  ): Promise<ComprobanteSelectDto> {
    if (formData.tipo === 'GUIA_REMISION_TRANSPORTISTA') {
      return this.crearGuiaTransportista(formData);
    }

    // Para Guía Remitente
    await waitForGeneration();
    const autoNumber = getNextDocumentNumber('GUIA_REMISION_REMITENTE');
    const serie = formData.serie || autoNumber.serie;
    const numero = formData.numero || autoNumber.numero;
    const id =
      Math.max(...comprobantesStore.map((comprobante) => comprobante.id), 0) +
      1;

    // 1. Construir el payload JSON SUNAT exacto para Remitente (Tipo 09)
    const sunatPayload = buildSunatGuiaRemitentePayload({
      formData: {
        ...(formData as GuiaRemisionRemitenteFormData),
        serie,
        numero,
      },
      serie,
      numero,
    });

    // 2. Enviar a APISUNAT
    const sunatResult = await SunatService.sendDocument(sunatPayload);
    const responseTime = sunatResult.responseTime || new Date().toISOString();

    const primerVehiculo = formData.vehiculos?.[0]?.placa || undefined;
    const primerConductor = formData.conductores?.[0]
      ? `${formData.conductores[0].nombre} ${formData.conductores[0].apellidos || ''}`.trim()
      : undefined;

    const nuevoComprobante: ComprobanteSelectDto = {
      id,
      tipo: 'GUIA_REMISION_REMITENTE',
      serie,
      numero,
      fechaEmision: formData.fechaEmision,
      cliente: formData.destinatario.nombre || 'Destinatario',
      documentoCliente: formData.destinatario.numeroDocumento || '',
      tipoDocumentoCliente: formData.destinatario.tipoDocumento || 'RUC',
      direccionCliente: formData.puntoLlegada.direccion || '',
      correoCliente: '',
      subtotal: 0,
      igv: 0,
      total: 0,
      remitente: EMPRESA.razonSocial,
      destinatario: formData.destinatario.nombre || 'Destinatario',
      motivoTraslado: formData.motivoTraslado,
      fechaTraslado: formData.fechaInicioTraslado,
      puntoPartida: formData.puntoPartida.direccion,
      puntoLlegada: formData.puntoLlegada.direccion,
      pesoTotal: formData.pesoBrutoTotal,
      unidadMedidaPeso: formData.unidadMedidaPeso,
      transportista: formData.transportista?.razonSocial,
      rucTransportista: formData.transportista?.ruc,
      vehiculo: primerVehiculo,
      conductor: primerConductor,
      bienesTransportados: formData.bienes?.map((b) => b.descripcion),
      estado: sunatResult.success ? 'EMITIDO' : 'RECHAZADO',
      estadoSunat: sunatResult.success ? 'PENDIENTE' : sunatResult.status,
      codigoRespuestaSunat: sunatResult.codigoRespuestaSunat,
      mensajeSunat: sunatResult.mensajeSunat,
      fechaConsultaSunat: responseTime,
      fechaEnvioSunat: responseTime,
      pdfUrl: sunatResult.pdfUrl,
      observaciones: formData.observaciones,
      detalle: (formData.bienes?.length
        ? formData.bienes
        : [{ descripcion: 'Mercadería para traslado', cantidad: 1 }]
      ).map((item, idx) => ({
        productoServicio: item.descripcion,
        codigo: `GUIA-${String(idx + 1).padStart(4, '0')}`,
        cantidad: item.cantidad || 1,
        precio: 0,
        igv: 0,
        importe: 0,
      })),
    };

    comprobantesStore = [nuevoComprobante, ...comprobantesStore];
    return cloneComprobante(nuevoComprobante);
  },

  async crearNota(
    formData: NotaFormData,
  ): Promise<NotaComprobanteSelectDto> {
    await waitForGeneration();

    const relatedComprobante = comprobantesStore.find(
      (c) => c.id === formData.comprobanteRelacionado.id,
    );
    const tipoComprobanteRelacionado =
      (relatedComprobante?.tipo as 'BOLETA' | 'FACTURA') || 'BOLETA';

    if (relatedComprobante) {
      const notaTotal = formData.detalle.reduce(
        (sum, item) => sum + item.importe,
        0,
      );

      if (formData.tipo === 'NOTA_CREDITO') {
        if (notaTotal > relatedComprobante.total) {
          throw new Error(
            `El importe de la nota de crédito (S/ ${notaTotal.toFixed(2)}) no puede exceder el total del comprobante original (S/ ${relatedComprobante.total.toFixed(2)})`,
          );
        }

        formData.detalle.forEach((item) => {
          const originalItem = relatedComprobante.detalle?.find(
            (orig) => orig.productoServicio === item.productoServicio,
          );
          if (originalItem && item.importe > originalItem.importe) {
            throw new Error(
              `El ítem "${item.productoServicio}" excede el importe disponible (S/ ${originalItem.importe.toFixed(2)})`,
            );
          }
        });
      } else if (formData.tipo === 'NOTA_DEBITO') {
        if (notaTotal <= 0) {
          throw new Error(
            'El importe de la nota de débito debe ser mayor a cero',
          );
        }
      }
    }

    const formDataWithItems = {
      ...formData,
      detalle:
        formData.detalle.length > 0
          ? formData.detalle
          : relatedComprobante?.detalle?.map((item) => ({
              productoId: null,
              codigo: item.codigo,
              productoServicio: item.productoServicio,
              cantidad: item.cantidad,
              precio: item.precio,
              igv: item.igv,
              importe: item.importe,
            })) || [],
    };

    const { serie, numero } = getNextDocumentNumber(
      formDataWithItems.tipo,
      tipoComprobanteRelacionado,
    );
    const subtotal = Number(
      formDataWithItems.detalle
        .reduce((sum, item) => sum + item.precio * item.cantidad, 0)
        .toFixed(2),
    );
    const igv = Number(
      formDataWithItems.detalle
        .reduce((sum, item) => sum + item.igv, 0)
        .toFixed(2),
    );
    const total = Number((subtotal + igv).toFixed(2));
    const id =
      Math.max(...comprobantesStore.map((comprobante) => comprobante.id), 0) +
      1;

    const fechaEmisionRelacionado =
      relatedComprobante?.fechaEmision || formData.fechaEmision;

    const sunatPayload = buildSunatNotaPayload({
      formData: formDataWithItems,
      serie,
      numero,
      tipoComprobanteRelacionado,
    });

    const sunatResult = await SunatService.sendDocument(sunatPayload);
    const responseTime =
      sunatResult.responseTime || new Date().toISOString();

    const nuevoComprobante: NotaComprobanteSelectDto = {
      id,
      serie,
      numero,
      tipo: formData.tipo,
      status: sunatResult.success ? 'ACEPTADO' : 'RECHAZADO',
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
      estado: sunatResult.success ? 'EMITIDO' : 'RECHAZADO',
      estadoSunat: sunatResult.success ? 'PENDIENTE' : sunatResult.status,
      mensajeSunat: sunatResult.mensajeSunat,
      comprobanteRelacionado: {
        ...formData.comprobanteRelacionado,
        fechaEmision: fechaEmisionRelacionado,
      },
      motivoDescripcion:
        formData.motivoDescripcion || formData.motivo,
      detalle: formDataWithItems.detalle.map((item) => ({
        productoServicio: item.productoServicio,
        codigo: item.codigo,
        cantidad: item.cantidad,
        precio: item.precio,
        igv: item.igv,
        importe: item.importe,
      })),
      observaciones: formData.observaciones,
      fileName: sunatPayload.fileName,
      faults: sunatResult.cdr?.notes || [],
      notes: sunatResult.cdr?.notes || [],
      reference: `${formData.comprobanteRelacionado.serie}-${formData.comprobanteRelacionado.numero}`,
    };

    comprobantesStore = [nuevoComprobante as any, ...comprobantesStore];
    return nuevoComprobante;
  },

  async actualizarEstadoSunat(id: number): Promise<ComprobanteSelectDto> {
    await waitForSunat();
    const comprobante = comprobantesStore.find((item) => item.id === id);

    if (!comprobante) {
      throw new Error('No se encontró el comprobante seleccionado.');
    }

    const fileName = `${comprobante.serie}-${comprobante.numero}`;
    const sunatResult = await SunatService.consultarEstado(fileName);
    const estadoSunat =
      comprobante.estadoSunat === 'RECHAZADO'
        ? 'RECHAZADO'
        : sunatResult.status;
    const fechaConsultaSunat =
      sunatResult.responseTime || new Date().toISOString();
    const actualizado: ComprobanteSelectDto = {
      ...comprobante,
      estadoSunat,
      codigoRespuestaSunat:
        estadoSunat === 'ACEPTADO'
          ? '0'
          : comprobante.codigoRespuestaSunat,
      mensajeSunat:
        estadoSunat === 'ACEPTADO'
          ? 'Comprobante verificado y aceptado por SUNAT.'
          : comprobante.mensajeSunat,
      fechaConsultaSunat,
      fechaEnvioSunat: comprobante.fechaEnvioSunat || fechaConsultaSunat,
    };

    comprobantesStore = comprobantesStore.map((item) =>
      item.id === id ? actualizado : item,
    );
    return cloneComprobante(actualizado);
  },
};
