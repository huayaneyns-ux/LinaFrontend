import type { ReactNode } from 'react';
import { FiPlus, FiFilter, FiX, FiRefreshCw } from 'react-icons/fi';
import SearchInput from './SearchInput';
import '../../Styles/ERP/erp-toolbar.css';

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onNew?: () => void;
  newLabel?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterCount?: number;
  onResetFilters?: () => void;
  filterPanel?: ReactNode;
  extraActions?: ReactNode;
}

const Toolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onNew,
  newLabel = 'Nuevo registro',
  showFilters,
  onToggleFilters,
  filterCount = 0,
  onResetFilters,
  filterPanel,
  extraActions,
}: ToolbarProps) => {
  return (
    <div className="erp-toolbar">
      {/* Main row */}
      <div className="erp-toolbar-main">
        <div className="erp-toolbar-search">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="erp-toolbar-actions">
          {extraActions}

          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showFilters ? ' active' : ''}`}
            onClick={onToggleFilters}
            aria-pressed={showFilters}
            id="btn-toggle-filters"
          >
            <FiFilter />
            Filtros
            {filterCount > 0 && (
              <span className="erp-filter-count">{filterCount}</span>
            )}
          </button>

          {onNew && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-primary"
              onClick={onNew}
              id="btn-new-record"
            >
              <FiPlus />
              {newLabel}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="erp-filter-panel">
          {filterPanel}

          {filterCount > 0 && onResetFilters && (
            <div className="erp-filter-reset">
              <button
                type="button"
                className="erp-btn erp-btn-sm erp-btn-secondary"
                onClick={onResetFilters}
                title="Limpiar todos los filtros"
              >
                <FiX />
                <FiRefreshCw />
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
