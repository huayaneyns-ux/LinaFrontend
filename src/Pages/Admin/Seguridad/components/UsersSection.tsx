import { useState, useCallback, useMemo } from 'react';
import { mockUsuarios, SUCURSALES } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import { generateId, formatDate } from '../../../../Utils/formatters';
import type { Usuario, RolUsuario } from '../../../../Types/Usuario';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge, RoleBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiUsers, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const UsersSection = () => {
  const [users, setUsers] = useState<Usuario[]>(mockUsuarios);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Usuario>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Usuario>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (user: Usuario) => {
      if (filters.estado && user.estado !== filters.estado) return false;
      if (filters.rol && user.rol !== filters.rol) return false;
      if (filters.sucursal && user.sucursal !== filters.sucursal) return false;
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
  } = useDataTable<Usuario>({
    data: users,
    searchKeys: ['username', 'nombres', 'apellidos', 'email', 'sucursal'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = users.length;
    const activos = users.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [users]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Usuario) => {
    setFormState(record ? { ...record } : { username: '', nombres: '', apellidos: '', rol: 'TRABAJADOR', email: '', estado: 'ACTIVO', sucursal: 'Sede Central', telefono: '' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newUser: Usuario = {
        id: generateId(),
        username: formState.username || '',
        nombres: formState.nombres || '',
        apellidos: formState.apellidos || '',
        rol: formState.rol || 'TRABAJADOR',
        email: formState.email || '',
        estado: formState.estado || 'ACTIVO',
        sucursal: formState.sucursal || 'Sede Central',
        telefono: formState.telefono || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setUsers(prev =>
        prev.map(u =>
          u.id === dialogState.record!.id ? { ...u, ...formState, updatedAt: new Date().toISOString() } as Usuario : u
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setUsers(prev => prev.filter(u => u.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'username',
      header: 'Usuario',
      sortable: true,
      render: (row: Usuario) => (
        <div>
          <div style={{ fontWeight: 600 }}>@{row.username}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'nombres',
      header: 'Nombre Completo',
      sortable: true,
      render: (row: Usuario) => `${row.nombres} ${row.apellidos}`,
    },
    {
      key: 'rol',
      header: 'Rol de Sistema',
      sortable: true,
      width: '140px',
      render: (row: Usuario) => <RoleBadge role={row.rol} />,
    },
    {
      key: 'sucursal',
      header: 'Sucursal asignada',
      sortable: true,
      width: '150px',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Usuario) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Usuario) => (
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
            <span className="erp-indicator-label">Total Cuentas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Usuarios Activos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Usuarios Inactivos</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, usuario, email o sucursal..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Usuario"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Rol</label>
              <select
                className="erp-input"
                value={filters.rol || ''}
                onChange={e => setFilter('rol', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ADMINISTRADOR">Administradores</option>
                <option value="SUPERVISOR">Supervisores</option>
                <option value="CAJERO">Cajeros</option>
                <option value="TRABAJADOR">Trabajadores</option>
                <option value="CLIENTE">Clientes</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Sucursal</label>
              <select
                className="erp-input"
                value={filters.sucursal || ''}
                onChange={e => setFilter('sucursal', e.target.value)}
              >
                <option value="">Todas</option>
                {SUCURSALES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
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
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="PENDIENTE">Pendiente</option>
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
          emptyMessage="No se encontraron cuentas registradas"
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
          dialogState.mode === 'create' ? 'Agregar Usuario' :
          dialogState.mode === 'edit' ? 'Editar Usuario' :
          dialogState.mode === 'view' ? 'Ver Detalles de Cuenta' : 'Eliminar Usuario'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Nombre de Usuario (Username)</label>
            <input
              type="text"
              className="erp-input"
              value={formState.username || ''}
              onChange={e => setFormState(prev => ({ ...prev, username: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: jsmith"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Nombres</label>
            <input
              type="text"
              className="erp-input"
              value={formState.nombres || ''}
              onChange={e => setFormState(prev => ({ ...prev, nombres: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: John"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Apellidos</label>
            <input
              type="text"
              className="erp-input"
              value={formState.apellidos || ''}
              onChange={e => setFormState(prev => ({ ...prev, apellidos: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Smith"
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
              placeholder="email@lina.pe"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Rol del Sistema</label>
            <select
              className="erp-input"
              value={formState.rol || 'TRABAJADOR'}
              onChange={e => setFormState(prev => ({ ...prev, rol: e.target.value as RolUsuario }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="CAJERO">Cajero</option>
              <option value="TRABAJADOR">Trabajador</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Sucursal Asignada</label>
            <select
              className="erp-input"
              value={formState.sucursal || 'Sede Central'}
              onChange={e => setFormState(prev => ({ ...prev, sucursal: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              {SUCURSALES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Teléfono</label>
            <input
              type="text"
              className="erp-input"
              value={formState.telefono || ''}
              onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: 999888777"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Estado de la cuenta</label>
            <select
              className="erp-input"
              value={formState.estado || 'ACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value as any }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default UsersSection;
