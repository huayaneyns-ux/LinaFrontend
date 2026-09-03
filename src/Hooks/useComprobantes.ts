import { useCallback, useEffect, useState } from 'react';
import { ComprobanteVentasService } from '../Services/Admin/Comprobantes/ComprobanteVentasService';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
  NotaFormData,
  GuiaRemisionFormData,
  GetAllQueryParams,
  PDFFormat,
  VoidBillRequest,
} from '../Types/Admin/Comprobantes/Comprobante';

export function useComprobantes() {
  const [comprobantes, setComprobantes] = useState<ComprobanteSelectDto[]>([]);
  const [ventasDisponibles, setVentasDisponibles] = useState<VentaOrigenComprobanteDto[]>([]);
  const [productosDisponibles] = useState<ProductoComprobanteMockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingSunatId, setUpdatingSunatId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sameId = (left: string | number | null | undefined, right: string | number | null | undefined) =>
    String(left ?? '') === String(right ?? '');

  const loadComprobantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ventas, comprobantesVentas] = await Promise.all([
        ComprobanteVentasService.getVentasDisponibles(),
        ComprobanteVentasService.getComprobantes(),
      ]);
      setComprobantes(comprobantesVentas);
      setVentasDisponibles(ventas);
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
      const comprobante = await ComprobanteVentasService.emitir(formData);
      setComprobantes((previous) => [comprobante, ...previous]);

      // Solo mostrar mensaje de éxito si el comprobante fue enviado correctamente a SUNAT
      if (
        comprobante.estado === 'EMITIDO' &&
        (comprobante.estadoSunat === 'ACEPTADO' ||
          comprobante.estadoSunat === 'PENDIENTE')
      ) {
        const labels: Record<string, string> = {
          BOLETA: 'Boleta',
          FACTURA: 'Factura',
        };
        const tipoLabel = labels[comprobante.tipo] || 'Comprobante';
        const estadoLabel =
          comprobante.estadoSunat === 'PENDIENTE'
            ? 'enviada a SUNAT (pendiente de confirmación)'
            : 'generada correctamente';
        setSuccessMessage(
          `${tipoLabel} ${comprobante.serie}-${comprobante.numero} ${estadoLabel}.`,
        );
      } else {
        // Si hubo error con SUNAT, mostrar mensaje de error
        setError(
          `Error al generar comprobante: ${comprobante.mensajeSunat || 'Error en comunicación con SUNAT'}`,
        );
      }

      return comprobante;
    } catch {
      setError('No se pudo generar el comprobante. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const crearGuia = useCallback(async (formData: GuiaRemisionFormData) => {
    void formData;
    setError('Guías de remisión aún no tienen backend real en este proyecto.');
    return null;
  }, []);

  const crearNota = useCallback(async (formData: NotaFormData) => {
    void formData;
    setError('Notas aún no tienen backend real en este proyecto.');
    return null;
  }, []);

  const actualizarEstadoSunat = useCallback(async (id: string | number) => {
    try {
      setUpdatingSunatId(id);
      setError(null);
      setSuccessMessage(null);
      const actualizado = await ComprobanteVentasService.sincronizarEstadoSunat(String(id));
      setComprobantes((previous) =>
        previous.map((item) => (sameId(item.id, id) ? actualizado : item)),
      );
      setSuccessMessage(
        `El estado SUNAT de ${actualizado.serie}-${actualizado.numero} se actualizó correctamente.`,
      );
    } catch {
      setError('No se pudo actualizar el estado SUNAT. Intenta nuevamente.');
    } finally {
      setUpdatingSunatId(null);
    }
  }, [comprobantes]);

  const getById = useCallback(async (documentId: string) => {
    try {
      setError(null);
      return await ComprobanteVentasService.getById(documentId);
    } catch {
      setError('No se pudo obtener el documento. Intenta nuevamente.');
      return null;
    }
  }, [comprobantes]);

  const getAll = useCallback(async (params: GetAllQueryParams) => {
    try {
      setError(null);
      void params;
      const documents = await ComprobanteVentasService.getComprobantes();
      setComprobantes(documents);
      return documents;
    } catch {
      setError('No se pudieron cargar los documentos. Intenta nuevamente.');
      return [];
    }
  }, []);

  const getPDF = useCallback(async (documentId: string, format: PDFFormat, fileName: string) => {
    try {
      setError(null);
      const pdfBlob = await ComprobanteVentasService.getPDF(documentId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccessMessage('PDF descargado correctamente.');
      return true;
    } catch {
      setError('No se pudo generar el PDF. Intenta nuevamente.');
      return false;
    }
  }, [comprobantes]);

  const voidBill = useCallback(async (request: VoidBillRequest) => {
    try {
      setError(null);
      setSuccessMessage(null);
      const localId = request.documentId;
      const response = await ComprobanteVentasService.anular(String(localId), request.reason);
      
      setComprobantes((previous) =>
        previous.map((item) =>
          sameId(item.id, localId) ? response : item,
        ),
      );
      
      setSuccessMessage('Documento anulado correctamente.');
      return response;
    } catch {
      setError('No se pudo anular el documento. Intenta nuevamente.');
      return null;
    }
  }, [comprobantes]);

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
    crearGuia,
    crearNota,
    actualizarEstadoSunat,
    getById,
    getAll,
    getPDF,
    voidBill,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
