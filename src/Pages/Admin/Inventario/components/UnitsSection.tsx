import { useState, useCallback, useMemo } from 'react';
import { UnidadMedidaService } from '../../../../Services/Admin/Inventario/UnidadMedida';
import type {
  UnidadMedidaSelectDto,
  UnidadMedidaInsertDto,
  UnidadMedidaUpdateDto,
} from '../../../../Types/Admin/Inventario/UnidadMedida';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import {
  FiTag,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
} from 'react-icons/fi';

interface UnidadFilters {
  estado: string;
}

const DEFAULT_FILTERS: UnidadFilters = { estado: '' };

const EMPTY_FORM: Partial<UnidadMedidaSelectDto> = {
  nombre: '',
  abreviatura: '',
  estado: true,
};

const unidadCrudService = {
  getAll: () => UnidadMedidaService.getUnidades(),
  getById: (id: number) => UnidadMedidaService.getUnidadById(id),
  create: (data: UnidadMedidaInsertDto) => UnidadMedidaService.createUnidad(data),
  update: (data: UnidadMedidaUpdateDto) => UnidadMedidaService.updateUnidad(data),
  delete: (id: number) => UnidadMedidaService.deleteUnidad(id),
};

export const UnitsSection = () => {
  const { items: units, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<UnidadMedidaSelectDto, UnidadMedidaInsertDto, UnidadMedidaUpdateDto>(unidadCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<UnidadMedidaSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<UnidadFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<UnidadMedidaSelectDto>>(EMPTY_FORM);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (uni: UnidadMedidaSelectDto) => {
      if (!showDisabled && !uni.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !uni.estado) return false;
        if (filters.estado === 'INACTIVO' && uni.estado) return false;
      }
      return true;
    },
    [filters, showDisabled]
  );

  const {
    processedData,
    totalItems,
    totalPages,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    pagination,
    setPage,
    setPageSize,
  } = useDataTable<UnidadMedidaSelectDto>({
    data: units,
    searchKeys: ['nombre', 'abreviatura'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = units.length;
    const activos = units.filter(u => u.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [units]);

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: UnidadMedidaSelectDto) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleStartView = async (record: UnidadMedidaSelectDto) => {
    setSelectedId(record.id);
    setFormMode('view');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;
    try {
      if (formMode === 'create') {
        const payload: UnidadMedidaInsertDto = {
          nombre: formState.nombre || '',
          abreviatura: formState.abreviatura || '',
        };
        await createItem(payload);
      } else if (formMode === 'edit' && selectedId) {
        const payload: UnidadMedidaUpdateDto = {
          id: selectedId,
          nombre: formState.nombre || '',
          abreviatura: formState.abreviatura || '',
        };
        await updateItem(payload);
      }
      setActiveTab('list');
    } catch {
      // error shown via hook
    }
  };

  const handleConfirmDelete = async () => {
    if (dialogState.record) {
      await deleteItem(dialogState.record.id);
      closeDialog();
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      render: (row: UnidadMedidaSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>#{row.id}</strong>
      ),
    },
    {
      key: 'nombre',
      header: 'Unidad de Medida',
      sortable: true,
      render: (row: UnidadMedidaSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>
      ),
    },
    {
      key: 'abreviatura',
      header: 'Abreviatura',
      sortable: true,
      width: '140px',
      render: (row: UnidadMedidaSelectDto) => (
        <span style={{
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '0px',
          backgroundColor: 'var(--erp-accent-light)',
          color: 'var(--erp-accent)',
          fontSize: '12px',
          border: '1px solid var(--erp-accent)'
        }}>
          {row.abreviatura}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: UnidadMedidaSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: UnidadMedidaSelectDto) => (
        <div className="erp-table-actions">
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleStartView(row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleStartEdit(row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => openDelete(row)} />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiTag /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Unidades</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Unidades Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Unidades Inactivas</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
          onClick={() => setShowDisabled(prev => !prev)}
        >
          {showDisabled ? <FiEyeOff /> : <FiEye />}
          <span>{showDisabled ? 'Ocultar inactivos' : 'Mostrar inactivos'}</span>
        </button>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o abreviatura..."
        onNew={handleStartCreate}
        newLabel="Nueva Unidad"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Estado</label>
            <select className="erp-filter-select" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando unidades...</div>
      ) : (
        <>
          <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron unidades" />
          <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
      <div className="erp-form-section">
        <h3 className="erp-form-section-title">
          {formMode === 'create' && 'Nueva Unidad de Medida'}
          {formMode === 'edit' && `Editando Unidad de Medida #${selectedId}`}
          {formMode === 'view' && `Detalle de Unidad de Medida #${selectedId}`}
        </h3>

        <div className="erp-form-fields">
          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                disabled={formMode === 'view'}
                placeholder="Ej: Unidad, Paquete, Docena, Caja"
                required
              />
            </div>

            <div className="erp-form-group">
              <label className="erp-form-label">Abreviatura <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.abreviatura || ''}
                onChange={e => setFormState(prev => ({ ...prev, abreviatura: e.target.value }))}
                disabled={formMode === 'view'}
                placeholder="Ej: UND, PQT, DOC, CJ"
                required
              />
            </div>
          </div>

          {(formMode === 'edit' || formMode === 'view') && (
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              {formMode === 'view' ? (
                <div className="erp-form-status-value">
                  <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
                </div>
              ) : (
                <select
                  className="erp-input"
                  value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'}
                  onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {formMode !== 'view' && (
        <div className="erp-form-actions">
          <button
            type="button"
            className="erp-btn erp-btn-secondary"
            onClick={() => setActiveTab('list')}
          >
            <FiX />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            className="erp-btn erp-btn-primary"
            disabled={saving}
          >
            <FiSave />
            <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Crear Unidad' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Unidades de Medida"
        subtitle="Define las unidades estándar para conteo, conversión y empaque de inventario"
        entityName="Unidad"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formMode={formMode}
        onNew={handleStartCreate}
        listContent={listContent}
        formContent={formContent}
      />

      <CrudDialog
        isOpen={dialogState.isOpen && dialogState.mode === 'delete'}
        mode="delete"
        onClose={closeDialog}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Eliminar Unidad de Medida"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la unidad <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      />
    </>
  );
};

export default UnitsSection;
