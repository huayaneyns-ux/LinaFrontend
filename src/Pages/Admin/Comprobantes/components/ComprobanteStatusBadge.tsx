import type {
  ComprobanteEstado,
  ComprobanteEstadoSunat,
} from '../../../../Types/Admin/Comprobantes/Comprobante';
import '../../../../Styles/ERP/erp-badges.css';

interface ComprobanteStatusBadgeProps {
  status: ComprobanteEstado | ComprobanteEstadoSunat;
}

const STATUS_CONFIG: Record<ComprobanteEstado | ComprobanteEstadoSunat, { label: string; className: string; dotClass: string }> = {
  BORRADOR: { label: 'Borrador', className: 'erp-badge-pendiente', dotClass: 'erp-status-dot-pendiente' },
  EMITIDO: { label: 'Emitido', className: 'erp-badge-activo', dotClass: 'erp-status-dot-activo' },
  ANULADO: { label: 'Anulado', className: 'erp-badge-inactivo', dotClass: 'erp-status-dot-inactivo' },
  RECHAZADO: { label: 'Rechazado', className: 'erp-badge-suspendido', dotClass: 'erp-status-dot-suspendido' },
  PENDIENTE: { label: 'Pendiente', className: 'erp-badge-pendiente', dotClass: 'erp-status-dot-pendiente' },
  ENVIADO: { label: 'Enviado', className: 'erp-badge-pendiente', dotClass: 'erp-status-dot-pendiente' },
  OBSERVADO: { label: 'Observado', className: 'erp-badge-suspendido', dotClass: 'erp-status-dot-suspendido' },
  EXCEPCION: { label: 'Excepción', className: 'erp-badge-suspendido', dotClass: 'erp-status-dot-suspendido' },
  ACEPTADO: { label: 'Aceptado', className: 'erp-badge-activo', dotClass: 'erp-status-dot-activo' },
};

const ComprobanteStatusBadge = ({ status }: ComprobanteStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`erp-badge ${config.className}`}>
      <span className={`erp-status-dot ${config.dotClass}`} />
      {config.label}
    </span>
  );
};

export default ComprobanteStatusBadge;
