import { useState, useCallback, useMemo } from 'react';
import { mockCategorias } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import type { Categoria } from '../../../../Types/Producto';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiFolder, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Categoria[]>(mockCategorias);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Categoria>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Categoria>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (cat: Categoria) => {
      if (filters.estado) {
        const wantsActive = filters.estado === 'ACTIVO';
        if (cat.estado !== wantsActive) return false;
      }
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
  } = useDataTable<Categoria>({
    data: categories,
    searchKeys: ['nombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = categories.length;
    const activos = categories.filter(c => c.estado).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [categories]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Categoria) => {
    setFormState(record ? { ...record } : { nombre: '', estado: true });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newCat: Categoria = {
        id: Date.now(),
        nombre: formState.nombre || '',
        estado: formState.estado !== undefined ? formState.estado : true,
        url: '',
      };
      setCategories(prev => [newCat, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setCategories(prev =>
        prev.map(c =>
          c.id === dialogState.record!.id ? { ...c, ...formState } as Categoria : c
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setCategories(prev => prev.filter(c => c.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      render: (row: Categoria) => `#${row.id}`,
    },
    {
      key: 'nombre',
      header: 'Nombre de Categoría',
      sortable: true,
      render: (row: Categoria) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: Categoria) => <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Categoria) => (
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
          <div className="erp-indicator-icon"><FiFolder /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Categorías</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Categorías Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Categorías Inactivas</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Categoría"
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
          emptyMessage="No se encontraron categorías"
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
          dialogState.mode === 'create' ? 'Agregar Categoría' :
          dialogState.mode === 'edit' ? 'Editar Categoría' :
          dialogState.mode === 'view' ? 'Detalle de Categoría' : 'Eliminar Categoría'
        }
        size="sm"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Nombre de Categoría</label>
            <input
              type="text"
              className="erp-input"
              value={formState.nombre || ''}
              onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Lápices y Lapiceros"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Estado</label>
            <select
              className="erp-input"
              value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
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

export default CategoriesSection;
