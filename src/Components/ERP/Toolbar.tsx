import type { ReactNode } from 'react';
import { FiPlus, FiFilter, FiX, FiRotateCcw } from 'react-icons/fi';
import SearchInput from './SearchInput';
import '../../Styles/ERP/erp-toolbar.css';

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onNew?: () => void;
  newLabel?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filterCount?: number;
  onResetFilters?: () => void;
  filterPanel?: ReactNode;
  extraActions?: ReactNode;
  alwaysShowFilters?: boolean;
}

const Toolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onNew,
  newLabel = 'Nuevo registro',
  showFilters = true,
  onToggleFilters,
  filterCount = 0,
  onResetFilters,
  filterPanel,
  extraActions,
  alwaysShowFilters = true,
}: ToolbarProps) => {
  const isFiltersVisible = alwaysShowFilters || showFilters;

  return (
    <div className="erp-toolbar">
      <div className="erp-toolbar-row">
        {filterPanel && isFiltersVisible && (
          <div className="erp-toolbar-filter-inputs">
            {filterPanel}
          </div>
        )}

        <div className="erp-toolbar-search">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        {onResetFilters && isFiltersVisible && (
          <button
            type="button"
            className="erp-btn-clear-filters"
            onClick={onResetFilters}
            title="Limpiar todos los filtros"
          >
            <FiX style={{ color: '#ef4444' }} />
            <span>Limpiar</span>
          </button>
        )}

        <div className="erp-toolbar-actions">
          {extraActions}

          {!alwaysShowFilters && onToggleFilters && (
            <button
              type="button"
              className={`erp-btn erp-btn-sm erp-btn-secondary${showFilters ? ' active' : ''}`}
              onClick={onToggleFilters}
              aria-pressed={showFilters}
              id="btn-toggle-filters"
            >
              <FiFilter />
              <span>Filtros</span>
              {filterCount > 0 && (
                <span className="erp-filter-count">{filterCount}</span>
              )}
            </button>
          )}

          {onResetFilters && !alwaysShowFilters && filterCount > 0 && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-secondary"
              onClick={onResetFilters}
              title="Restablecer filtros"
            >
              <FiRotateCcw />
              <span>Limpiar</span>
            </button>
          )}

          {onNew && (
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-primary"
              onClick={onNew}
              id="btn-new-record"
            >
              <FiPlus />
              <span>{newLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
