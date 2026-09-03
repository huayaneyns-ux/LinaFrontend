import { useCallback, useEffect, useState } from 'react';
import { ComprobanteVentasService } from '../Services/Admin/Comprobantes/ComprobanteVentasService';
import type {
  ComprobanteFormData,
  ComprobanteSelectDto,
  LiquidacionCompraDisponibleDto,
  LiquidacionCompraFormData,
  NotaComprobanteBaseDto,
  NotaFormData,
  PDFFormat,
  VentaOrigenComprobanteDto,
  VoidBillRequest,
} from '../Types/Admin/Comprobantes/Comprobante';

export function useComprobantes() {
  const [comprobantes, setComprobantes] = useState<ComprobanteSelectDto[]>([]);
  const [ventasDisponibles, setVentasDisponibles] = useState<VentaOrigenComprobanteDto[]>([]);
  const [notasBaseDisponibles, setNotasBaseDisponibles] = useState<NotaComprobanteBaseDto[]>([]);
  const [comprasDisponibles, setComprasDisponibles] = useState<LiquidacionCompraDisponibleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingSunatId, setUpdatingSunatId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadComprobantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ventas, documentos, notasBase, compras] = await Promise.all([
        ComprobanteVentasService.getVentasDisponibles(),
        ComprobanteVentasService.getComprobantes(),
        ComprobanteVentasService.getBasesNotas(),
        ComprobanteVentasService.getComprasDisponiblesLiquidacion(),
      ]);
      setVentasDisponibles(ventas);
      setComprobantes(documentos);
      setNotasBaseDisponibles(notasBase);
      setComprasDisponibles(compras);
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
      await loadComprobantes();
      setSuccessMessage(`${comprobante.tipo} ${comprobante.serie}-${comprobante.numero} emitido correctamente.`);
      return comprobante;
    } catch {
      setError('No se pudo generar el comprobante. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [loadComprobantes]);

  const crearNota = useCallback(async (formData: NotaFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      const base = notasBaseDisponibles.find((item) => item.id === String(formData.comprobanteRelacionado.id));
      if (!base) {
        setError('El comprobante base de la nota ya no está disponible.');
        return null;
      }

      await ComprobanteVentasService.emitirNota(formData, base);
      await loadComprobantes();
      setSuccessMessage(
        formData.tipo === 'NOTA_CREDITO'
          ? 'Nota de crédito emitida correctamente.'
          : 'Nota de débito emitida correctamente.',
      );
      return true;
    } catch {
      setError('No se pudo emitir la nota. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [loadComprobantes, notasBaseDisponibles]);

  const crearLiquidacion = useCallback(async (formData: LiquidacionCompraFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      await ComprobanteVentasService.emitirLiquidacion(formData);
      await loadComprobantes();
      setSuccessMessage('Liquidación de compra emitida correctamente.');
      return true;
    } catch {
      setError('No se pudo emitir la liquidación de compra. Intenta nuevamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [loadComprobantes]);

  const actualizarEstadoSunat = useCallback(async (id: string | number) => {
    try {
      setUpdatingSunatId(id);
      setError(null);
      setSuccessMessage(null);
      const actualizado = await ComprobanteVentasService.sincronizarEstadoSunat(String(id));
      await loadComprobantes();
      setSuccessMessage(
        `El estado SUNAT de ${actualizado.serie}-${actualizado.numero} se actualizó correctamente.`,
      );
    } catch {
      setError('No se pudo actualizar el estado SUNAT. Intenta nuevamente.');
    } finally {
      setUpdatingSunatId(null);
    }
  }, [loadComprobantes]);

  const getById = useCallback(async (documentId: string) => {
    try {
      setError(null);
      return await ComprobanteVentasService.getById(documentId);
    } catch {
      setError('No se pudo obtener el documento. Intenta nuevamente.');
      return null;
    }
  }, []);

  const getPDF = useCallback(async (documentId: string, format: PDFFormat, fileName: string) => {
    try {
      setError(null);
      const pdfBlob = await ComprobanteVentasService.getPDF(documentId, format);
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
  }, []);

  const voidBill = useCallback(async (request: VoidBillRequest) => {
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await ComprobanteVentasService.anular(String(request.documentId), request.reason);
      await loadComprobantes();
      setSuccessMessage(`Documento ${response.serie}-${response.numero} anulado correctamente.`);
      return response;
    } catch {
      setError('No se pudo anular el documento. Intenta nuevamente.');
      return null;
    }
  }, [loadComprobantes]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadComprobantes();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadComprobantes]);

  return {
    comprobantes,
    ventasDisponibles,
    notasBaseDisponibles,
    comprasDisponibles,
    loading,
    generating,
    updatingSunatId,
    error,
    successMessage,
    loadComprobantes,
    crearComprobante,
    crearNota,
    crearLiquidacion,
    actualizarEstadoSunat,
    getById,
    getPDF,
    voidBill,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
