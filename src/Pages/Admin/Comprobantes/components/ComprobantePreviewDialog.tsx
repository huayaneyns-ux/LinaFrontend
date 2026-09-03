import { useEffect, useState } from 'react';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import type { ComprobanteSelectDto } from '../../../../Types/Admin/Comprobantes/Comprobante';
import { API_BASE_URL } from '../../../../Services/apiService';
import ComprobanteStatusBadge from './ComprobanteStatusBadge';

interface ComprobantePreviewDialogProps {
  comprobante: ComprobanteSelectDto | null;
  onClose: () => void;
}

const TYPE_TITLES: Record<ComprobanteSelectDto['tipo'], string> = {
  BOLETA: 'BOLETA ELECTRÓNICA',
  FACTURA: 'FACTURA ELECTRÓNICA',
  NOTA_CREDITO: 'NOTA DE CRÉDITO ELECTRÓNICA',
  NOTA_DEBITO: 'NOTA DE DÉBITO ELECTRÓNICA',
  LIQUIDACION_COMPRA: 'LIQUIDACIÓN DE COMPRA',
  GUIA_REMISION_REMITENTE: 'GUÍA DE REMISIÓN REMITENTE',
  GUIA_REMISION_TRANSPORTISTA: 'GUÍA DE REMISIÓN TRANSPORTISTA',
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

const ComprobantePreviewDialog = ({ comprobante, onClose }: ComprobantePreviewDialogProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const loadPdf = async () => {
      if (!comprobante) {
        setPdfUrl(null);
        setPdfError(null);
        setLoadingPdf(false);
        return;
      }

      try {
        setLoadingPdf(true);
        setPdfError(null);
        const response = await fetch(`${API_BASE_URL}/facturacion/comprobantes/${comprobante.id}/pdf?format=A4`);
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `No se pudo cargar el PDF (${response.status}).`);
        }

        const blob = await response.blob();
        objectUrl = window.URL.createObjectURL(blob);
        if (active) {
          setPdfUrl(objectUrl);
        }
      } catch (error) {
        if (active) {
          setPdfUrl(null);
          setPdfError(error instanceof Error ? error.message : 'No se pudo cargar el PDF desde el backend.');
        }
      } finally {
        if (active) {
          setLoadingPdf(false);
        }
      }
    };

    void loadPdf();

    return () => {
      active = false;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [comprobante]);

  return (
  <CrudDialog
    isOpen={comprobante !== null}
    mode="view"
    onClose={onClose}
    onConfirm={onClose}
    title="Vista previa del comprobante"
    subtitle="PDF cargado desde el backend"
    size="lg"
  >
    {loadingPdf ? (
      <div style={{ minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--erp-text-muted)' }}>
        Cargando PDF desde el backend...
      </div>
    ) : pdfUrl ? (
      <iframe
        title={`Comprobante ${comprobante?.serie}-${comprobante?.numero}`}
        src={pdfUrl}
        style={{ width: '100%', minHeight: '520px', border: 0 }}
      />
    ) : pdfError ? (
      <div style={{ minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--erp-danger)', padding: '24px', textAlign: 'center' }}>
        <div>
          <strong>No se pudo cargar el PDF.</strong>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>{pdfError}</div>
        </div>
      </div>
    ) : comprobante ? (
      <article style={{ maxWidth: '560px', margin: '0 auto', border: '1px solid var(--erp-card-border)', padding: '28px', color: 'var(--erp-text-primary)', background: '#fff' }}>
        <header style={{ textAlign: 'center', borderBottom: '1px dashed var(--erp-border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <strong style={{ display: 'block', fontSize: '18px' }}>Comercial Lina S.A.C.</strong>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>RUC: 20600000000</span>
          <strong style={{ display: 'block', marginTop: '14px' }}>{TYPE_TITLES[comprobante.tipo]}</strong>
          <span style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{comprobante.serie}-{comprobante.numero}</span>
        </header>

        <div style={{ display: 'grid', gap: '7px', fontSize: '13px' }}>
          <div><strong>Fecha:</strong> {comprobante.fechaEmision}</div>
          <div><strong>Cliente:</strong> {comprobante.cliente}</div>
          <div><strong>{comprobante.tipoDocumentoCliente}:</strong> {comprobante.documentoCliente}</div>
          {comprobante.motivoTraslado && <div><strong>Motivo de traslado:</strong> {comprobante.motivoTraslado}</div>}
        </div>

        <div style={{ borderTop: '1px dashed var(--erp-border-color)', borderBottom: '1px dashed var(--erp-border-color)', padding: '14px 0', margin: '16px 0', fontSize: '13px' }}>
          {comprobante.detalle.map(item => (
            <div key={item.codigo} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
              <span>{item.cantidad} × {item.productoServicio}</span>
              <strong>{formatAmount(item.importe)}</strong>
            </div>
          ))}
        </div>

        {comprobante.total > 0 && (
          <div style={{ display: 'grid', gap: '6px', justifyContent: 'end', fontSize: '13px' }}>
            <span>Subtotal: {formatAmount(comprobante.subtotal)}</span>
            <span>IGV: {formatAmount(comprobante.igv)}</span>
            <strong style={{ fontSize: '16px' }}>TOTAL: {formatAmount(comprobante.total)}</strong>
          </div>
        )}

        <footer style={{ borderTop: '1px dashed var(--erp-border-color)', marginTop: '18px', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '12px' }}>
          <span>Estado SUNAT</span>
          <ComprobanteStatusBadge status={comprobante.estadoSunat} />
        </footer>
      </article>
    ) : null}
  </CrudDialog>
  );
};

export default ComprobantePreviewDialog;
