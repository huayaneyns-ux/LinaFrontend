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
  const [notasBaseDebitoDisponibles, setNotasBaseDebitoDisponibles] = useState<NotaComprobanteBaseDto[]>([]);
  const [comprasDisponibles, setComprasDisponibles] = useState<LiquidacionCompraDisponibleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingSunatId, setUpdatingSunatId] = useState<string | number | null>(null);
  const [resendingSunatId, setResendingSunatId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getErrorMessage = (fallback: string, error: unknown) => {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  };

  const loadComprobantes = useCallback(async (background = false) => {
    try {
      if (!background) {
        setLoading(true);
      }
      setError(null);
      const [ventas, documentos, notasBase, notasBaseDebito, compras] = await Promise.all([
        ComprobanteVentasService.getVentasDisponibles(),
        ComprobanteVentasService.getComprobantes(),
        ComprobanteVentasService.getBasesNotas(),
        ComprobanteVentasService.getBasesNotasDebito(),
        ComprobanteVentasService.getComprasDisponiblesLiquidacion(),
      ]);
      setVentasDisponibles(ventas);
      setComprobantes(documentos);
      setNotasBaseDisponibles(notasBase);
      setNotasBaseDebitoDisponibles(notasBaseDebito);
      setComprasDisponibles(compras);
    } catch (error) {
      setError(getErrorMessage('No se pudieron cargar los comprobantes. Intenta nuevamente.', error));
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, []);

  const crearComprobante = useCallback(async (formData: ComprobanteFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      const comprobante = await ComprobanteVentasService.emitir(formData);
      setSuccessMessage(`${comprobante.tipo} ${comprobante.serie}-${comprobante.numero} emitido correctamente.`);
      window.setTimeout(() => {
        void loadComprobantes(true);
      }, 0);
      return comprobante;
    } catch (error) {
      setError(getErrorMessage('No se pudo generar el comprobante. Intenta nuevamente.', error));
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
      const bases = formData.tipo === 'NOTA_DEBITO' ? notasBaseDebitoDisponibles : notasBaseDisponibles;
      const base = bases.find((item) => item.id === String(formData.comprobanteRelacionado.id));
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
    } catch (error) {
      setError(getErrorMessage('No se pudo emitir la nota. Intenta nuevamente.', error));
      return null;
    } finally {
      setGenerating(false);
    }
  }, [loadComprobantes, notasBaseDisponibles, notasBaseDebitoDisponibles]);

  const crearLiquidacion = useCallback(async (formData: LiquidacionCompraFormData) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      await ComprobanteVentasService.emitirLiquidacion(formData);
      await loadComprobantes();
      setSuccessMessage('Liquidación de compra emitida correctamente.');
      return true;
    } catch (error) {
      setError(getErrorMessage('No se pudo emitir la liquidación de compra. Intenta nuevamente.', error));
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
    } catch (error) {
      setError(getErrorMessage('No se pudo actualizar el estado SUNAT. Intenta nuevamente.', error));
    } finally {
      setUpdatingSunatId(null);
    }
  }, [loadComprobantes]);

  const reenviarSunat = useCallback(async (id: string | number) => {
    try {
      setResendingSunatId(id);
      setError(null);
      setSuccessMessage(null);
      const actualizado = await ComprobanteVentasService.reenviarSunat(String(id));
      await loadComprobantes();
      setSuccessMessage(
        `El documento ${actualizado.serie}-${actualizado.numero} fue reenviado a SUNAT.`,
      );
      return actualizado;
    } catch (error) {
      setError(getErrorMessage('No se pudo reenviar el documento a SUNAT. Intenta nuevamente.', error));
      return null;
    } finally {
      setResendingSunatId(null);
    }
  }, [loadComprobantes]);

  const reenviarTodos = useCallback(async (ids: Array<string | number>) => {
    if (ids.length === 0) return 0;

    let enviados = 0;
    setError(null);
    setSuccessMessage(null);
    for (const id of ids) {
      const resultado = await reenviarSunat(id);
      if (resultado) enviados += 1;
    }
    await loadComprobantes(true);
    setSuccessMessage(`${enviados} documento(s) fueron enviados nuevamente a SUNAT.`);
    return enviados;
  }, [loadComprobantes, reenviarSunat]);

  const getById = useCallback(async (documentId: string) => {
    try {
      setError(null);
      return await ComprobanteVentasService.getById(documentId);
    } catch (error) {
      setError(getErrorMessage('No se pudo obtener el documento. Intenta nuevamente.', error));
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
    } catch (error) {
      setError(getErrorMessage('No se pudo generar el PDF. Intenta nuevamente.', error));
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
    } catch (error) {
      setError(getErrorMessage('No se pudo anular el documento. Intenta nuevamente.', error));
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
    notasBaseDebitoDisponibles,
    comprasDisponibles,
    loading,
    generating,
    updatingSunatId,
    resendingSunatId,
    error,
    successMessage,
    loadComprobantes,
    crearComprobante,
    crearNota,
    crearLiquidacion,
    crearGuia: async (_form?: unknown) => true,
    actualizarEstadoSunat,
    reenviarSunat,
    reenviarTodos,
    getById,
    getPDF,
    voidBill,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
