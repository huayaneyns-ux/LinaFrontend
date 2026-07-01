import { useState, useCallback, useMemo } from 'react';
import { mockUnidades } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiTag, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Unidad {
  id: string;
  nombre: string;
  abreviatura: string;
  estado: string;
}

const UnitsSection = () => {
  const [units, setUnits] = useState<Unidad[]>(mockUnidades);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Unidad>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Unidad>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (uni: Unidad) => {
      if (filters.estado && uni.estado !== filters.estado) return false;
      return true;
    },
    [filters]
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
  } = useDataTable<Unidad>({
    data: units,
    searchKeys: ['nombre', 'abreviatura'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = units.length;
    const activos = units.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [units]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Unidad) => {
    setFormState(record ? { ...record } : { id: 'U-' + (units.length + 1).toString().padStart(3, '0'), nombre: '', abreviatura: '', estado: 'ACTIVO' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newUnit: Unidad = {
        id: formState.id || 'U-' + Date.now().toString().slice(-4),
        nombre: formState.nombre || '',
        abreviatura: formState.abreviatura || '',
        estado: formState.estado || 'ACTIVO',
      };
      setUnits(prev => [newUnit, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setUnits(prev =>
        prev.map(u =>
          u.id === dialogState.record!.id ? { ...u, ...formState } as Unidad : u
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setUnits(prev => prev.filter(u => u.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: (row: Unidad) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.id}</strong>,
    },
    {
      key: 'nombre',
      header: 'Unidad de Medida',
      sortable: true,
      render: (row: Unidad) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>,
    },
    {
      key: 'abreviatura',
      header: 'Abreviatura',
      sortable: true,
      width: '140px',
      render: (row: Unidad) => (
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
      render: (row: Unidad) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Unidad) => (
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
      {/* Indicators */}
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

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o abreviatura..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Unidad"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Table */}
      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={processedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          rowKey={(row) => row.id}
          emptyMessage="No se encontraron unidades de medida"
        />
        <Pagination
          page={pagination.page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pagination.pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Dialog */}
      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={
          dialogState.mode === 'create' ? 'Agregar Unidad' :
          dialogState.mode === 'edit' ? 'Editar Unidad' :
          dialogState.mode === 'view' ? 'Detalle de Unidad' : 'Eliminar Unidad'
        }
        size="sm"
      >
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
          <div className="erp-form-group">
            <label className="erp-form-label">Estado</label>
            <select
              className="erp-input"
              value={formState.estado || 'ACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default UnitsSection;
