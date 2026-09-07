import type { SunatTransmissionItemDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { FiX, FiClock, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiLayers } from 'react-icons/fi';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';

interface SunatTransmissionDetailModalProps {
  transmission: SunatTransmissionItemDto | null;
  onClose: () => void;
}

const TYPE_NAMES: Record<string, string> = {
  '01': 'Factura Electrónica',
  '03': 'Boleta de Venta',
  '04': 'Liquidación de Compra',
  '07': 'Nota de Crédito',
  '08': 'Nota de Débito',
  '09': 'Guía de Remisión',
};

export const SunatTransmissionDetailModal = ({
  transmission,
  onClose,
}: SunatTransmissionDetailModalProps) => {
  if (!transmission) return null;

  const typeName = transmission.voucherTypeCode
    ? (TYPE_NAMES[transmission.voucherTypeCode] || `Tipo ${transmission.voucherTypeCode}`)
    : 'Comprobante';

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleString('es-PE');
  };

  const isSuccess = transmission.transmissionStatus === 'SUCCESS';
  const isError = transmission.transmissionStatus === 'ERROR';
  const sunatStatusNormalized = (transmission.sunatStatus ?? '').toString().toUpperCase();
  const showErrorDetails =
    Boolean(transmission.errorMessage) &&
    (isError || sunatStatusNormalized === 'EXCEPCION' || sunatStatusNormalized === 'EXCEPTION' || sunatStatusNormalized === 'ERROR' || sunatStatusNormalized === 'RECHAZADO');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          borderRadius: '10px 10px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#eff6ff',
              color: isSuccess ? '#059669' : isError ? '#dc2626' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              {isSuccess ? <FiCheckCircle /> : isError ? <FiAlertTriangle /> : <FiClock />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Detalle de Transmisión SUNAT
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Registro técnico en tabla <code>dbo.SunatTransmission</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Banner de tiempo y estado principal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            backgroundColor: '#f8fafc',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', display: 'block' }}>
                TIEMPO DE RESPUESTA
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: transmission.responseTimeMs && transmission.responseTimeMs > 2500 ? '#dc2626' : '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '2px',
              }}>
                <FiClock style={{ fontSize: '16px' }} />
                {transmission.responseTimeMs !== null ? `${transmission.responseTimeMs} ms` : 'Sin respuesta'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', display: 'block' }}>
                ESTADO SUNAT
              </span>
              <div style={{ marginTop: '4px' }}>
                {transmission.sunatStatus ? (
                  <ComprobanteStatusBadge status={transmission.sunatStatus} />
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Pendiente</span>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', display: 'block' }}>
                CÓDIGO HTTP
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: transmission.httpStatus === 200 ? '#dcfce7' : transmission.httpStatus ? '#fee2e2' : '#f1f5f9',
                color: transmission.httpStatus === 200 ? '#15803d' : transmission.httpStatus ? '#b91c1c' : '#64748b',
              }}>
                {transmission.httpStatus ? `HTTP ${transmission.httpStatus}` : 'N/A (Timeout)'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', display: 'block' }}>
                ESTADO TÉCNICO
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-block',
                marginTop: '4px',
                color: isSuccess ? '#15803d' : isError ? '#b91c1c' : '#1d4ed8',
              }}>
                {transmission.transmissionStatus}
              </span>
            </div>
          </div>

          {/* Información del Comprobante Vinculado (dbo.Voucher) */}
          <div>
            <h4 style={{
              margin: '0 0 10px 0',
              fontSize: '13px',
              fontWeight: '700',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <FiLayers style={{ color: '#4f46e5' }} />
              Comprobante Vinculado (dbo.Voucher)
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12.5px',
            }}>
              <div>
                <strong style={{ color: '#64748b' }}>Tipo de Comprobante:</strong>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#1e293b' }}>
                  {typeName} {transmission.voucherTypeCode ? `(${transmission.voucherTypeCode})` : ''}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Serie y Número:</strong>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#1e293b' }}>
                  {transmission.series && transmission.number
                    ? `${transmission.series}-${transmission.number}`
                    : 'No disponible'}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Cliente / Receptor:</strong>
                <p style={{ margin: '2px 0 0 0', color: '#1e293b' }}>
                  {transmission.customerName || 'No registrado'}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Importe Total:</strong>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#1e293b' }}>
                  {transmission.total !== undefined ? `S/ ${transmission.total.toFixed(2)}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Registro Técnico de la Transmisión (dbo.SunatTransmission) */}
          <div>
            <h4 style={{
              margin: '0 0 10px 0',
              fontSize: '13px',
              fontWeight: '700',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <FiInfo style={{ color: '#4f46e5' }} />
              Registro Técnico (dbo.SunatTransmission)
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12.5px',
            }}>
              <div>
                <strong style={{ color: '#64748b' }}>ID de Transmisión:</strong>
                <p style={{ margin: '2px 0 0 0', fontFamily: 'monospace', fontSize: '11px', color: '#475569', wordBreak: 'break-all' }}>
                  {transmission.id}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Voucher ID:</strong>
                <p style={{ margin: '2px 0 0 0', fontFamily: 'monospace', fontSize: '11px', color: '#475569', wordBreak: 'break-all' }}>
                  {transmission.voucherId}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Tipo de Operación (OperationType):</strong>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#1e293b' }}>
                  {transmission.operationType}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Número de Intento (AttemptNumber):</strong>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#1e293b' }}>
                  Intento #{transmission.attemptNumber}
                  {transmission.attemptNumber > 1 && (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '11px',
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      Reintento
                    </span>
                  )}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>ID Documento APISUNAT:</strong>
                <p style={{ margin: '2px 0 0 0', fontFamily: 'monospace', color: '#1e293b' }}>
                  {transmission.sunatDocumentId || 'No asignado'}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Envío (CreatedAt):</strong>
                <p style={{ margin: '2px 0 0 0', color: '#1e293b' }}>
                  {formatDateTime(transmission.createdAt)}
                </p>
              </div>

              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Respuesta (RespondedAt):</strong>
                <p style={{ margin: '2px 0 0 0', color: '#1e293b' }}>
                  {formatDateTime(transmission.respondedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de Error si existió */}
          {showErrorDetails && transmission.errorMessage && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '700', fontSize: '13px' }}>
                <FiAlertCircle />
                Error registrado (ErrorMessage):
              </div>
              <p style={{
                margin: '6px 0 0 0',
                fontSize: '12.5px',
                color: '#991b1b',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #fecaca',
              }}>
                {transmission.errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          borderRadius: '0 0 10px 10px',
        }}>
          <button
            type="button"
            className="erp-btn erp-btn-sm erp-btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
