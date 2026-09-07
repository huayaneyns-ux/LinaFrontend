import React from 'react';
import { FiInbox, FiList } from 'react-icons/fi';
import './SubmoduleTwoTabsLayout.css';
import '../../Styles/ERP/erp-toolbar.css';

interface ERPEmptySelectionProps {
  icon?: React.ReactNode;
  title?: string;
  description: string;
  onBack?: () => void;
  backLabel?: string;
}

export const ERPEmptySelection: React.FC<ERPEmptySelectionProps> = ({
  icon,
  title = 'Ningún registro seleccionado',
  description,
  onBack,
  backLabel = 'Volver a Registros',
}) => {
  return (
    <div className="erp-empty-selection">
      <div className="erp-empty-selection-icon">
        {icon || <FiInbox />}
      </div>
      <h3 className="erp-empty-selection-title">{title}</h3>
      <p className="erp-empty-selection-desc">{description}</p>
      {onBack && (
        <button
          type="button"
          className="erp-btn erp-btn-sm erp-btn-primary"
          onClick={onBack}
        >
          <FiList />
          <span>{backLabel}</span>
        </button>
      )}
    </div>
  );
};

export default ERPEmptySelection;
