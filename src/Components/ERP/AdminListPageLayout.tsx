import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import './AdminModuleLayout.css';

interface AdminListPageLayoutProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  newButtonLabel?: string;
  onNew?: () => void;
  newTo?: string;
  extraHeaderActions?: React.ReactNode;
  filterPanel?: React.ReactNode;
  indicators?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminListPageLayout: React.FC<AdminListPageLayoutProps> = ({
  title,
  subtitle,
  badge,
  newButtonLabel,
  onNew,
  newTo,
  extraHeaderActions,
  filterPanel,
  indicators,
  children,
}) => {
  const navigate = useNavigate();

  const handleNew = () => {
    if (onNew) {
      onNew();
    } else if (newTo) {
      navigate(newTo);
    }
  };

  return (
    <div className="erp-view-container">
      {/* ── Submodule Header (Title & Action Buttons) ── */}
      <div className="erp-view-header">
        <div className="erp-view-header-left">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="erp-view-title">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="erp-view-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {extraHeaderActions}
          {(newButtonLabel || newTo || onNew) && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-primary"
              onClick={handleNew}
            >
              <FiPlus />
              <span>{newButtonLabel || 'Nuevo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Indicators / Metric summary ── */}
      {indicators}

      {/* ── Filter / Search Bar (Ant Design Pro Style) ── */}
      {filterPanel}

      {/* ── Content (DataTable & Pagination) ── */}
      <div
        className="erp-table-card"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminListPageLayout;
