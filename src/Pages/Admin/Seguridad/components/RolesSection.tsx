import { useState, useCallback, useMemo } from 'react';
import { mockRoles } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiLock, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  estado: string;
}

const RolesSection = () => {
  const [roles, setRoles] = useState<Rol[]>(mockRoles);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Rol>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Rol>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (rol: Rol) => {
      if (filters.estado && rol.estado !== filters.estado) return false;
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
  } = useDataTable<Rol>({
    data: roles,
    searchKeys: ['nombre', 'descripcion'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = roles.length;
    const activos = roles.filter(r => r.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [roles]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Rol) => {
    setFormState(record ? { ...record } : { id: 'R-' + (roles.length + 1).toString().padStart(3, '0'), nombre: '', descripcion: '', usuariosAsignados: 0, estado: 'ACTIVO' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newRol: Rol = {
        id: formState.id || 'R-' + Date.now().toString().slice(-4),
        nombre: formState.nombre || '',
        descripcion: formState.descripcion || '',
        usuariosAsignados: Number(formState.usuariosAsignados) || 0,
        estado: formState.estado || 'ACTIVO',
      };
      setRoles(prev => [newRol, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setRoles(prev =>
        prev.map(r =>
          r.id === dialogState.record!.id ? { ...r, ...formState } as Rol : r
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setRoles(prev => prev.filter(r => r.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: (row: Rol) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.id}</strong>,
    },
    {
      key: 'nombre',
      header: 'Rol / Cargo',
      sortable: true,
      width: '180px',
      render: (row: Rol) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>,
    },
    {
      key: 'descripcion',
      header: 'Descripción del Acceso',
      sortable: true,
      render: (row: Rol) => <span style={{ color: 'var(--erp-text-secondary)', fontSize: '12px' }}>{row.descripcion}</span>,
    },
    {
      key: 'usuariosAsignados',
      header: 'Asignados',
      sortable: true,
      align: 'center' as const,
      width: '120px',
      render: (row: Rol) => (
        <span style={{
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--erp-accent-light)',
          color: 'var(--erp-accent)'
        }}>
          {row.usuariosAsignados} usuarios
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Rol) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Rol) => (
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
          <div className="erp-indicator-icon"><FiLock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Roles</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Roles Activos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Roles Inactivos</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o descripción..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Rol"
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
          emptyMessage="No se encontraron roles de usuario"
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
          dialogState.mode === 'create' ? 'Agregar Rol de Sistema' :
          dialogState.mode === 'edit' ? 'Editar Rol' :
          dialogState.mode === 'view' ? 'Ver Detalles de Permisos' : 'Eliminar Rol'
        }
        size="sm"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Nombre del Rol (Cargo)</label>
            <input
              type="text"
              className="erp-input"
              value={formState.nombre || ''}
              onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: SUPERVISOR"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Usuarios Asignados</label>
            <input
              type="number"
              className="erp-input"
              value={formState.usuariosAsignados || 0}
              onChange={e => setFormState(prev => ({ ...prev, usuariosAsignados: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
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
          <div className="erp-form-group">
            <label className="erp-form-label">Descripción de Accesos</label>
            <textarea
              className="erp-input"
              rows={3}
              value={formState.descripcion || ''}
              onChange={e => setFormState(prev => ({ ...prev, descripcion: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Acceso a lectoescritura de comprobantes..."
              style={{ resize: 'none', height: '64px', padding: '6px' }}
            />
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default RolesSection;
