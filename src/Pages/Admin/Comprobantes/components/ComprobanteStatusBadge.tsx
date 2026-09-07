import type {
  ComprobanteEstado,
  ComprobanteEstadoSunat,
} from '../../../../Types/Admin/Comprobantes/Comprobante';
import { StatusBadge, type StatusTone } from '../../../../Components/ERP/StatusBadge';
import '../../../../Styles/ERP/erp-badges.css';

interface ComprobanteStatusBadgeProps {
  status: ComprobanteEstado | ComprobanteEstadoSunat;
  /** Detail/dialogs: show label. Tables: leave false (dot + tooltip). */
  showText?: boolean;
}

const STATUS_CONFIG: Record<
  ComprobanteEstado | ComprobanteEstadoSunat,
  { label: string; tone: StatusTone }
> = {
  BORRADOR: { label: 'Borrador', tone: 'warning' },
  EMITIDO: { label: 'Emitido', tone: 'success' },
  ANULADO: { label: 'Anulado', tone: 'danger' },
  RECHAZADO: { label: 'Rechazado', tone: 'danger' },
  PENDIENTE: { label: 'Pendiente', tone: 'warning' },
  ENVIADO: { label: 'Enviado', tone: 'info' },
  OBSERVADO: { label: 'Observado', tone: 'warning' },
  EXCEPCION: { label: 'Excepción', tone: 'danger' },
  ACEPTADO: { label: 'Aceptado', tone: 'success' },
};

const ComprobanteStatusBadge = ({ status, showText = false }: ComprobanteStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: String(status), tone: 'muted' as StatusTone };

  return (
    <StatusBadge
      status={status}
      label={config.label}
      tone={config.tone}
      showText={showText}
    />
  );
};

export default ComprobanteStatusBadge;
