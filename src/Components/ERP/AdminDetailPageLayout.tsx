import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import './AdminModuleLayout.css';

interface AdminDetailPageLayoutProps {
  title: string;
  subtitle?: string;
  backTo: string;
  editTo?: string;
  onEdit?: () => void;
  statusBadge?: React.ReactNode;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminDetailPageLayout: React.FC<AdminDetailPageLayoutProps> = ({
  title,
  subtitle,
  backTo,
  editTo,
  onEdit,
  statusBadge,
  extraActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit) onEdit();
    else if (editTo) navigate(editTo);
  };

  return (
    <div className="erp-view-container">
      {/* ── Header with Back Button and Quick Actions ── */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="erp-view-title">{title}</h2>
              {statusBadge}
            </div>
            {subtitle && <p className="erp-view-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {extraActions}
          {(editTo || onEdit) && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-primary"
              onClick={handleEdit}
            >
              <FiEdit2 />
              <span>Editar Registro</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Detail Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminDetailPageLayout;
