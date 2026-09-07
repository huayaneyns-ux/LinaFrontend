import React from 'react';
import './SubmoduleTwoTabsLayout.css';
import '../../Styles/ERP/erp-form.css';
import { FiList, FiEdit, FiEye } from 'react-icons/fi';

export interface SubmoduleTwoTabsLayoutProps {
  title: string;
  subtitle?: string;
  entityName?: string;
  activeTab: 'list' | 'form';
  onTabChange: (tab: 'list' | 'form') => void;
  formMode?: 'create' | 'edit' | 'view';
  formTabTitle?: string;
  onNew?: () => void;
  listContent: React.ReactNode;
  formContent?: React.ReactNode;
  extraHeaderActions?: React.ReactNode;
}

export const SubmoduleTwoTabsLayout: React.FC<SubmoduleTwoTabsLayoutProps> = ({
  title,
  subtitle,
  activeTab,
  onTabChange,
  formMode = 'create',
  formTabTitle,
  onNew,
  listContent,
  formContent,
  extraHeaderActions,
}) => {
  const formTabLabel = formTabTitle || 'Detalle';

  const FormIcon =
    formMode === 'create' ? FiEdit : formMode === 'edit' ? FiEdit : FiEye;

  const handleTabClick = (tab: 'list' | 'form') => {
    if (tab === 'form') {
      if (activeTab === 'list' && onNew && formMode === 'create') {
        onNew();
      }
      onTabChange('form');
    } else {
      onTabChange('list');
    }
  };

  return (
    <div className="submodule-container">
      {/* Header */}
      <div className="submodule-header">
        <div className="submodule-title-wrap">
          <h2 className="submodule-title">{title}</h2>
          {subtitle && <p className="submodule-subtitle">{subtitle}</p>}
        </div>
        {extraHeaderActions && <div>{extraHeaderActions}</div>}
      </div>

      {/* Tabs Navigation (Tab 1: Registros / Tab 2: Detalle) */}
      <div className="submodule-tabs-nav">
        <button
          type="button"
          className={`submodule-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabClick('list')}
        >
          <FiList />
          <span>Registros</span>
        </button>
        <button
          type="button"
          className={`submodule-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => handleTabClick('form')}
          disabled={!formContent && !onNew}
        >
          <FormIcon />
          <span>{formTabLabel}</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="submodule-tab-body">
        {activeTab === 'list' && listContent}
        {activeTab === 'form' && formContent}
      </div>
    </div>
  );
};

export default SubmoduleTwoTabsLayout;
