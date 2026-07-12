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
import {
  FiTag,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
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

const UnitsSection = () => {
  const { items: units, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<UnidadMedidaSelectDto, UnidadMedidaInsertDto, UnidadMedidaUpdateDto>(unidadCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<UnidadMedidaSelectDto>();

  const [filters, setFilters] = useState<UnidadFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: UnidadMedidaSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail });
    } else if (mode === 'delete' && record) {
      setFormState({ ...record });
    } else {
      setFormState({ ...EMPTY_FORM });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = async () => {
    try {
      if (dialogState.mode === 'create') {
        const payload: UnidadMedidaInsertDto = {
          nombre: formState.nombre || '',
          abreviatura: formState.abreviatura || '',
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: UnidadMedidaUpdateDto = {
          id: dialogState.record.id,
          nombre: formState.nombre || '',
          abreviatura: formState.abreviatura || '',
          estado: formState.estado !== false,
        };
        await updateItem(payload);
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        await deleteItem(dialogState.record.id);
      }
      closeDialog();
    } catch {
      // error shown via hook
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '100px',
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
          borderRadius: '4px',
          backgroundColor: 'var(--erp-accent-light)',
          color: 'var(--erp-accent)',
          fontSize: '12px'
        }}>
          {row.abreviatura}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: UnidadMedidaSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: UnidadMedidaSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleOpenDialog('view', row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleOpenDialog('edit', row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => handleOpenDialog('delete', row)} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
      {error && (
        <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>
          {error}
        </div>
      )}

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

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o abreviatura..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Unidad"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        extraActions={
          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
            onClick={() => setShowDisabled(prev => !prev)}
          >
            {showDisabled ? <FiEyeOff /> : <FiEye />}
            {showDisabled ? 'Ocultar deshabilitados' : 'Mostrar deshabilitados'}
          </button>
        }
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando unidades de medida...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron unidades de medida" />
            <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>

      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={saving}
        title={
          dialogState.mode === 'create' ? 'Agregar Unidad' :
          dialogState.mode === 'edit' ? 'Editar Unidad' :
          dialogState.mode === 'view' ? 'Detalle de Unidad' : 'Eliminar Unidad'
        }
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la unidad <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre de Unidad</label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                disabled={dialogState.mode === 'view'}
                placeholder="Ej: Kilogramos"
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Abreviatura / Símbolo</label>
              <input
                type="text"
                className="erp-input"
                value={formState.abreviatura || ''}
                onChange={e => setFormState(prev => ({ ...prev, abreviatura: e.target.value }))}
                disabled={dialogState.mode === 'view'}
                placeholder="Ej: KG"
              />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {dialogState.mode === 'view' ? (
                  <div style={{ paddingTop: '6px' }}><StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} /></div>
                ) : (
                  <select className="erp-input" value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'} onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                )}
              </div>
            )}
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default UnitsSection;
