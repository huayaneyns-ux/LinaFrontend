import { useState, useCallback, useMemo } from 'react';
import { mockMarcas } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import type { Marca } from '../../../../Types/Marca';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiBookmark, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const BrandsSection = () => {
  const [brands, setBrands] = useState<Marca[]>(mockMarcas);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Marca>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Marca>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (marca: Marca) => {
      if (filters.estado && marca.estado !== filters.estado) return false;
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
  } = useDataTable<Marca>({
    data: brands,
    searchKeys: ['nombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = brands.length;
    const activos = brands.filter(b => b.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [brands]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Marca) => {
    setFormState(record ? { ...record } : { nombre: '', estado: 'ACTIVO', url: '' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newBrand: Marca = {
        id: Date.now(),
        nombre: formState.nombre || '',
        estado: formState.estado || 'ACTIVO',
        url: formState.url || '',
      };
      setBrands(prev => [newBrand, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setBrands(prev =>
        prev.map(b =>
          b.id === dialogState.record!.id ? { ...b, ...formState } as Marca : b
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setBrands(prev => prev.filter(b => b.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      render: (row: Marca) => `#${row.id}`,
    },
    {
      key: 'logo',
      header: 'Logotipo',
      width: '80px',
      render: (row: Marca) => (
        <div style={{
          width: '42px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '2px'
        }}>
          {row.url ? (
            <img src={row.url} alt={row.nombre} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--erp-text-muted)' }}>M</span>
          )}
        </div>
      ),
    },
    {
      key: 'nombre',
      header: 'Marca',
      sortable: true,
      render: (row: Marca) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: Marca) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Marca) => (
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
          <div className="erp-indicator-icon"><FiBookmark /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Marcas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Marcas Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Marcas Inactivas</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Marca"
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
          emptyMessage="No se encontraron marcas"
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
          dialogState.mode === 'create' ? 'Agregar Marca' :
          dialogState.mode === 'edit' ? 'Editar Marca' :
          dialogState.mode === 'view' ? 'Detalle de Marca' : 'Eliminar Marca'
        }
        size="sm"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Nombre de Marca</label>
            <input
              type="text"
              className="erp-input"
              value={formState.nombre || ''}
              onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Faber-Castell"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">URL Logotipo (Opcional)</label>
            <input
              type="text"
              className="erp-input"
              value={formState.url || ''}
              onChange={e => setFormState(prev => ({ ...prev, url: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="https://ejemplo.com/logo.svg"
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

export default BrandsSection;
