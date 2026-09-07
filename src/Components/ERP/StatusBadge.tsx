import React from 'react';
import type { EstadoUsuario, RolUsuario } from '../../Types/Usuario';
import '../../Styles/ERP/erp-badges.css';

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'muted';

/* ── STATUS BADGE (Small dot indicator with tooltip) ── */
interface StatusBadgeProps {
  status?: string | boolean | number | EstadoUsuario | null;
  /** Override display label (also used as tooltip) */
  label?: string;
  /** Force a color tone regardless of status string */
  tone?: StatusTone;
  /** Show label next to the dot (detail/view). Tables keep showText=false */
  showText?: boolean;
  /** @deprecated unused — dots are always shown */
  showDot?: boolean;
}

const TONE_COLORS: Record<StatusTone, string> = {
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#eab308',
  info: '#3b82f6',
  primary: '#2563eb',
  muted: '#6b7280',
};

const SUCCESS_KEYS = new Set([
  'ACTIVO', 'COMPLETADA', 'COMPLETADO', 'ENTREGADO', 'VIGENTE', 'TRUE',
  'RECIBIDO', 'ACEPTADO', 'EMITIDO', 'PAGO APROBADO', 'PAGO_APROBADO',
]);

const DANGER_KEYS = new Set([
  'INACTIVO', 'ANULADA', 'ANULADO', 'CANCELADO', 'VENCIDO', 'FALSE',
  'RECHAZADO', 'PAGO RECHAZADO', 'PAGO_RECHAZADO', 'EXCEPCION',
]);

const WARNING_KEYS = new Set([
  'PENDIENTE', 'SUSPENDIDO', 'EN_PROCESO', 'EN PROCESO', 'POR_VENCER',
  'POR VENCER', 'BORRADOR', 'OBSERVADO',
  'PENDIENTE DE VALIDACIÓN', 'PENDIENTE DE VALIDACION',
]);

const INFO_KEYS = new Set([
  'ENVIADO', 'EN CAMINO', 'ALISTANDO PEDIDO', 'LISTO PARA RECOGER',
  'PAGO APROBADO', 'PAGO_APROBADO',
]);

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const normalizeStatus = (
  status: string | boolean | number | EstadoUsuario | null | undefined,
  labelOverride?: string,
  toneOverride?: StatusTone,
): { label: string; dotColor: string } => {
  if (typeof status === 'boolean') {
    return status
      ? { label: labelOverride || 'Activo', dotColor: TONE_COLORS[toneOverride || 'success'] }
      : { label: labelOverride || 'Inactivo', dotColor: TONE_COLORS[toneOverride || 'danger'] };
  }

  if (typeof status === 'number') {
    // Numeric codes without domain map — gray unless tone/label provided
    return {
      label: labelOverride || `Estado ${status}`,
      dotColor: TONE_COLORS[toneOverride || 'muted'],
    };
  }

  const raw = String(status ?? '').trim();
  const s = raw.toUpperCase();
  const label = labelOverride || (raw ? titleCase(raw.replace(/_/g, ' ')) : '—');

  if (toneOverride) {
    return { label, dotColor: TONE_COLORS[toneOverride] };
  }

  if (SUCCESS_KEYS.has(s)) {
    return { label: labelOverride || (s === 'TRUE' ? 'Activo' : label), dotColor: TONE_COLORS.success };
  }
  if (DANGER_KEYS.has(s)) {
    return { label: labelOverride || (s === 'FALSE' ? 'Inactivo' : label), dotColor: TONE_COLORS.danger };
  }
  if (INFO_KEYS.has(s)) {
    return { label, dotColor: TONE_COLORS.info };
  }
  if (WARNING_KEYS.has(s)) {
    return { label, dotColor: TONE_COLORS.warning };
  }

  // Soft heuristics for free-text / API names
  if (/activ|complet|entreg|recib|acept|aprob|vigente|emitid/i.test(raw)) {
    return { label, dotColor: TONE_COLORS.success };
  }
  if (/inactiv|anul|cancel|vencid|rechaz|excep/i.test(raw)) {
    return { label, dotColor: TONE_COLORS.danger };
  }
  if (/pend|proceso|borrador|observ|alist|camino|recoger|por\s*venc/i.test(raw)) {
    return { label, dotColor: TONE_COLORS.warning };
  }

  return { label: label || '—', dotColor: TONE_COLORS.muted };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label: labelProp,
  tone,
  showText = false,
}) => {
  const { label, dotColor } = normalizeStatus(status, labelProp, tone);

  return (
    <span
      className="erp-status-circle-wrap"
      title={label}
      aria-label={label}
    >
      <span
        className="erp-status-circle"
        style={{ backgroundColor: dotColor }}
      />
      {showText && <span className="erp-status-text">{label}</span>}
    </span>
  );
};

/* ── ROLE BADGE ── */
interface RoleBadgeProps {
  role: RolUsuario | string;
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  ADMINISTRADOR: { label: 'Administrador', className: 'erp-badge-role-admin' },
  SUPERVISOR:    { label: 'Supervisor',    className: 'erp-badge-role-supervisor' },
  CAJERO:        { label: 'Cajero',        className: 'erp-badge-role-cajero' },
  TRABAJADOR:    { label: 'Trabajador',    className: 'erp-badge-role-trabajador' },
  CLIENTE:       { label: 'Cliente',       className: 'erp-badge-role-cliente' },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config = ROLE_CONFIG[String(role).toUpperCase()] ?? { label: String(role), className: 'erp-badge-role' };
  return (
    <span className={`erp-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
