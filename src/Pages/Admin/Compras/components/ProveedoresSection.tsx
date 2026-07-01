import { useState, useCallback, useMemo } from 'react';
import { mockProveedores } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiUsers, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Proveedor {
  id: string;
  ruc: string;
  razonSocial: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: string;
}

const ProveedoresSection = () => {
  const [providers, setProviders] = useState<Proveedor[]>(mockProveedores);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Proveedor>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Proveedor>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (prov: Proveedor) => {
      if (filters.estado && prov.estado !== filters.estado) return false;
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
  } = useDataTable<Proveedor>({
    data: providers,
    searchKeys: ['ruc', 'razonSocial', 'contacto', 'email'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = providers.length;
    const activos = providers.filter(p => p.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [providers]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Proveedor) => {
    setFormState(record ? { ...record } : { id: 'P-' + (providers.length + 1).toString().padStart(3, '0'), ruc: '', razonSocial: '', contacto: '', email: '', telefono: '', direccion: '', estado: 'ACTIVO' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newProv: Proveedor = {
        id: formState.id || 'P-' + Date.now().toString().slice(-4),
        ruc: formState.ruc || '',
        razonSocial: formState.razonSocial || '',
        contacto: formState.contacto || '',
        email: formState.email || '',
        telefono: formState.telefono || '',
        direccion: formState.direccion || '',
        estado: formState.estado || 'ACTIVO',
      };
      setProviders(prev => [newProv, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setProviders(prev =>
        prev.map(p =>
          p.id === dialogState.record!.id ? { ...p, ...formState } as Proveedor : p
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setProviders(prev => prev.filter(p => p.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'ruc',
      header: 'RUC / Código',
      sortable: true,
      width: '130px',
      render: (row: Proveedor) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.ruc}</strong>,
    },
    {
      key: 'razonSocial',
      header: 'Razón Social / Empresa',
      sortable: true,
      render: (row: Proveedor) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.razonSocial}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            Contacto: {row.contacto} | Tel: {row.telefono}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Correo Electrónico',
      sortable: true,
      width: '180px',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Proveedor) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Proveedor) => (
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
          <div className="erp-indicator-icon"><FiUsers /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Proveedores</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Socios Activos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Proveedores Inactivos</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por ruc, razón social o contacto..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Proveedor"
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
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
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
          emptyMessage="No se encontraron proveedores"
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
          dialogState.mode === 'create' ? 'Agregar Proveedor' :
          dialogState.mode === 'edit' ? 'Editar Proveedor' :
          dialogState.mode === 'view' ? 'Ver Detalles de Proveedor' : 'Eliminar Proveedor'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">RUC (11 dígitos)</label>
            <input
              type="text"
              maxLength={11}
              className="erp-input"
              value={formState.ruc || ''}
              onChange={e => setFormState(prev => ({ ...prev, ruc: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: 20100200301"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Razón Social</label>
            <input
              type="text"
              className="erp-input"
              value={formState.razonSocial || ''}
              onChange={e => setFormState(prev => ({ ...prev, razonSocial: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Distribuidora Continental S.A."
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Nombre del Contacto</label>
            <input
              type="text"
              className="erp-input"
              value={formState.contacto || ''}
              onChange={e => setFormState(prev => ({ ...prev, contacto: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Alberto Ruiz"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Teléfono de Contacto</label>
            <input
              type="text"
              className="erp-input"
              value={formState.telefono || ''}
              onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: 998877665"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Correo Electrónico</label>
            <input
              type="email"
              className="erp-input"
              value={formState.email || ''}
              onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="ventas@proveedor.com"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Estado de la cuenta</label>
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
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Dirección Fiscal</label>
            <input
              type="text"
              className="erp-input"
              value={formState.direccion || ''}
              onChange={e => setFormState(prev => ({ ...prev, direccion: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Av, Calle, Nro, Distrito, Provincia"
            />
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default ProveedoresSection;
