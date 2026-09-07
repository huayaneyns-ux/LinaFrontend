import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import './AdminModuleLayout.css';
import '../../Styles/ERP/erp-form.css';

interface AdminFormPageLayoutProps {
  title: string;
  subtitle?: string;
  backTo: string;
  onSave?: (e: React.FormEvent) => void;
  saving?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminFormPageLayout: React.FC<AdminFormPageLayoutProps> = ({
  title,
  subtitle,
  backTo,
  onSave,
  saving = false,
  saveLabel = 'Guardar',
  saveDisabled = false,
  extraActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(e);
  };

  return (
    <form className="erp-view-container" onSubmit={handleSubmit}>
      {/* ── Header with Back Button ── */}
      <div className="erp-view-header">
        <div className="erp-view-header-left">
          <button
            type="button"
            className="erp-btn-back"
            onClick={() => navigate(backTo)}
          >
            <FiArrowLeft />
            <span>Volver</span>
          </button>
          <div>
            <h2 className="erp-view-title">{title}</h2>
            {subtitle && <p className="erp-view-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {extraActions}
          <button
            type="button"
            className="erp-btn erp-btn-sm erp-btn-secondary"
            onClick={() => navigate(backTo)}
            disabled={saving}
          >
            <FiX />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            className="erp-btn erp-btn-sm erp-btn-primary"
            disabled={saving || saveDisabled}
          >
            <FiSave />
            <span>{saving ? 'Guardando...' : saveLabel}</span>
          </button>
        </div>
      </div>

      {/* ── Form Content (Card Sections) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>

      {/* ── Sticky/Bottom Action Bar ── */}
      <div className="erp-form-footer">
        <button
          type="button"
          className="erp-btn erp-btn-sm erp-btn-secondary"
          onClick={() => navigate(backTo)}
          disabled={saving}
        >
          <FiX />
          <span>Cancelar</span>
        </button>
        <button
          type="submit"
          className="erp-btn erp-btn-sm erp-btn-primary"
          disabled={saving || saveDisabled}
        >
          <FiSave />
          <span>{saving ? 'Guardando...' : saveLabel}</span>
        </button>
      </div>
    </form>
  );
};

export default AdminFormPageLayout;
