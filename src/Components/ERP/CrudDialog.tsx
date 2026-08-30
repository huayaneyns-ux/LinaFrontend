import type { ReactNode } from 'react';
import type { DialogMode } from '../../Hooks/useDialog';
import { FiX, FiPlus, FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import '../../Styles/ERP/erp-dialog.css';
import '../../Styles/ERP/erp-form.css';

interface CrudDialogProps {
  isOpen: boolean;
  mode: DialogMode;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  // Delete mode props
  deleteMessage?: ReactNode;
  // Button labels
  confirmLabel?: string;
  cancelLabel?: string;
  // Loading state
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideFooter?: boolean;
}

const MODE_CONFIG: Record<DialogMode, { icon: ReactNode; iconClass: string; defaultTitle: string; defaultConfirm: string }> = {
  create: { icon: <FiPlus />,   iconClass: 'create', defaultTitle: 'Nuevo registro',   defaultConfirm: 'Guardar' },
  edit:   { icon: <FiEdit2 />,  iconClass: 'edit',   defaultTitle: 'Editar registro',   defaultConfirm: 'Guardar cambios' },
  view:   { icon: <FiEye />,    iconClass: 'view',   defaultTitle: 'Ver registro',      defaultConfirm: 'Cerrar' },
  delete: { icon: <FiTrash2 />, iconClass: 'delete', defaultTitle: 'Eliminar registro', defaultConfirm: 'Eliminar' },
};

const CrudDialog = ({
  isOpen,
  mode,
  onClose,
  onConfirm,
  title,
  subtitle,
  children,
  deleteMessage,
  confirmLabel,
  cancelLabel = 'Cancelar',
  loading = false,
  size = 'md',
  hideFooter = false,
}: CrudDialogProps) => {
  if (!isOpen) return null;

  const config = MODE_CONFIG[mode];
  const resolvedTitle = title ?? config.defaultTitle;
  const resolvedConfirm = confirmLabel ?? config.defaultConfirm;
  const isViewMode = mode === 'view';
  const isDeleteMode = mode === 'delete';

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div className="erp-dialog-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={`erp-dialog${size === 'sm' ? ' erp-dialog-sm' : size === 'lg' ? ' erp-dialog-lg' : size === 'xl' ? ' erp-dialog-xl' : ''}`}>
        {/* Header */}
        <div className="erp-dialog-header">
          <div className="erp-dialog-header-left">
            <div className={`erp-dialog-icon ${config.iconClass}`}>
              {config.icon}
            </div>
            <div>
              <h2 className="erp-dialog-title">{resolvedTitle}</h2>
              {subtitle && <p className="erp-dialog-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="erp-dialog-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="erp-dialog-body">
          {isDeleteMode ? (
            <div className="erp-delete-dialog-content">
              <div className="erp-delete-icon-wrap">
                <FiTrash2 />
              </div>
              <h3 className="erp-delete-title">¿Confirmar eliminación?</h3>
              <p className="erp-delete-message">
                {deleteMessage ?? 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?'}
              </p>
            </div>
          ) : (
            <div className="erp-dialog-form">{children}</div>
          )}
        </div>

        {/* Footer */}
        {!hideFooter && <div className="erp-dialog-footer">
          {!isViewMode && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-secondary"
              onClick={onClose}
              disabled={loading}
              id="dialog-cancel-btn"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`erp-btn erp-btn-sm${isDeleteMode ? ' erp-btn-danger' : isViewMode ? ' erp-btn-secondary' : ' erp-btn-primary'}`}
            onClick={isViewMode ? onClose : onConfirm}
            disabled={loading}
            id="dialog-confirm-btn"
          >
            {loading ? (mode === 'view' ? 'Cerrando...' : 'Guardando...') : resolvedConfirm}
          </button>
        </div>}
      </div>
    </div>
  );
};

export default CrudDialog;
