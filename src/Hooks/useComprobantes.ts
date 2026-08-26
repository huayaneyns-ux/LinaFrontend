import { useCallback, useEffect, useState } from 'react';
import { ComprobanteMockService } from '../Services/Admin/Comprobantes/ComprobanteMockService';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
  NotaFormData,
} from '../Types/Admin/Comprobantes/Comprobante';

export function useComprobantes() {
  
  const [comprobantes, setComprobantes] = useState<ComprobanteSelectDto[]>([]);
  const [ventasDisponibles, setVentasDisponibles] = useState<VentaOrigenComprobanteDto[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoComprobanteMockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingSunatId, setUpdatingSunatId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadComprobantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, ventas, productos] = await Promise.all([
        ComprobanteMockService.getComprobantes(),
        ComprobanteMockService.getVentasDisponibles(),
        ComprobanteMockService.getProductosDisponibles(),
      ]);
      setComprobantes(data);
      setVentasDisponibles(ventas);
      setProductosDisponibles(productos);
    } catch {
      setError('No se pudieron cargar los comprobantes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearComprobante = useCallback(async (formData: ComprobanteFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      const comprobante = await ComprobanteMockService.crearComprobante(formData);
      setComprobantes(previous => [comprobante, ...previous]);
      const labels: Record<string, string> = {
        BOLETA: 'Boleta',
        FACTURA: 'Factura',
        LIQUIDACION_COMPRA: 'Liquidación de Compra',
      };
      const tipoLabel = labels[comprobante.tipo] || 'Comprobante';
      setSuccessMessage(`${tipoLabel} ${comprobante.serie}-${comprobante.numero} generada correctamente.`);
      return comprobante;
    } catch {
      setError('No se pudo generar el comprobante. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const crearNota = useCallback(async (formData: NotaFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      const nota = await ComprobanteMockService.crearNota(formData);
      // Convert NotaComprobanteSelectDto to ComprobanteSelectDto for the main array
      const comprobante: ComprobanteSelectDto = {
        id: nota.id,
        tipo: nota.tipo,
        serie: nota.serie,
        numero: nota.numero,
        fechaEmision: nota.issueTime,
        cliente: nota.nombreCliente,
        documentoCliente: nota.documentoCliente,
        tipoDocumentoCliente: nota.tipoDocumentoCliente,
        direccionCliente: nota.direccionCliente,
        correoCliente: nota.correoCliente,
        subtotal: nota.subtotal,
        igv: nota.igv,
        total: nota.total,
        estado: nota.estado,
        estadoSunat: nota.estadoSunat,
        codigoRespuestaSunat: '98',
        mensajeSunat: nota.mensajeSunat,
        fechaConsultaSunat: '',
        fechaEnvioSunat: nota.responseTime,
        detalle: nota.detalle,
        observaciones: nota.observaciones,
        pdfUrl: undefined,
        fechaTraslado: undefined,
        puntoPartida: undefined,
        puntoLlegada: undefined,
        pesoTotal: undefined,
        unidadMedidaPeso: undefined,
        bienesTransportados: undefined,
        transportista: undefined,
        rucTransportista: undefined,
        vehiculo: undefined,
        conductor: undefined,
        ventaOrigenId: undefined,
        fechaVencimiento: undefined,
        remitente: undefined,
        destinatario: undefined,
        motivoTraslado: undefined,
      };
      setComprobantes(previous => [comprobante, ...previous]);
      const tipoLabel = nota.tipo === 'NOTA_CREDITO' ? 'Nota de Crédito' : 'Nota de Débito';
      setSuccessMessage(`${tipoLabel} ${nota.serie}-${nota.numero} generada correctamente.`);
      return nota;
    } catch {
      setError('No se pudo generar la nota. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const actualizarEstadoSunat = useCallback(async (id: number) => {
    try {
      setUpdatingSunatId(id);
      setError(null);
      setSuccessMessage(null);
      const actualizado = await ComprobanteMockService.actualizarEstadoSunat(id);
      setComprobantes(previous => previous.map(item => item.id === id ? actualizado : item));
      setSuccessMessage(`El estado SUNAT de ${actualizado.serie}-${actualizado.numero} se actualizó correctamente.`);
    } catch {
      setError('No se pudo actualizar el estado SUNAT. Intenta nuevamente.');
    } finally {
      setUpdatingSunatId(null);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadComprobantes();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadComprobantes]);

  return {
    comprobantes,
    ventasDisponibles,
    productosDisponibles,
    loading,
    generating,
    updatingSunatId,
    error,
    successMessage,
    loadComprobantes,
    crearComprobante,
    crearNota,
    actualizarEstadoSunat,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
