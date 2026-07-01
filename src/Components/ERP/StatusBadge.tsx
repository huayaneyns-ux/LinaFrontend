import type { EstadoUsuario, RolUsuario } from '../../Types/Usuario';
import '../../Styles/ERP/erp-badges.css';

/* ── STATUS BADGE ── */
interface StatusBadgeProps {
  status: EstadoUsuario;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<EstadoUsuario, { label: string; className: string; dotClass: string }> = {
  ACTIVO:     { label: 'Activo',     className: 'erp-badge-activo',     dotClass: 'erp-status-dot-activo' },
  INACTIVO:   { label: 'Inactivo',   className: 'erp-badge-inactivo',   dotClass: 'erp-status-dot-inactivo' },
  SUSPENDIDO: { label: 'Suspendido', className: 'erp-badge-suspendido', dotClass: 'erp-status-dot-suspendido' },
  PENDIENTE:  { label: 'Pendiente',  className: 'erp-badge-pendiente',  dotClass: 'erp-status-dot-pendiente' },
};

export const StatusBadge = ({ status, showDot = true }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'erp-badge-role', dotClass: '' };
  return (
    <span className={`erp-badge ${config.className}`}>
      {showDot && <span className={`erp-status-dot ${config.dotClass}`} />}
      {config.label}
    </span>
  );
};

/* ── ROLE BADGE ── */
interface RoleBadgeProps {
  role: RolUsuario;
}

const ROLE_CONFIG: Record<RolUsuario, { label: string; className: string }> = {
  ADMINISTRADOR: { label: 'Administrador', className: 'erp-badge-role-admin' },
  SUPERVISOR:    { label: 'Supervisor',    className: 'erp-badge-role-supervisor' },
  CAJERO:        { label: 'Cajero',        className: 'erp-badge-role-cajero' },
  TRABAJADOR:    { label: 'Trabajador',    className: 'erp-badge-role-trabajador' },
  CLIENTE:       { label: 'Cliente',       className: 'erp-badge-role-cliente' },
};

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const config = ROLE_CONFIG[role] ?? { label: role, className: 'erp-badge-role' };
  return (
    <span className={`erp-badge ${config.className}`}>
      {config.label}
    </span>
  );
};
