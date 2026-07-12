import { useState, useCallback, useMemo, useEffect } from 'react';

import { UsuarioService } from '../../../../Services/Admin/Seguridad/Usuario';
import { RolService } from '../../../../Services/Admin/Seguridad/Rol';
import type {
  UsuarioSelectDto,
  UsuarioInsertDto,
  UsuarioUpdateDto,
} from '../../../../Types/Admin/Seguridad/Usuario';
import type { RolSelectDto } from '../../../../Types/Admin/Seguridad/Rol';
import type { RolUsuario } from '../../../../Types/Usuario';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge, RoleBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiUsers,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
} from 'react-icons/fi';

const SUCURSALES = ['Sede Central', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Este'];

interface UsuarioFilters {
  estado: string;
  rol: string;
  sucursal: string;
}

const DEFAULT_FILTERS: UsuarioFilters = { estado: '', rol: '', sucursal: '' };

const EMPTY_FORM: Partial<UsuarioSelectDto> & { password?: string } = {
  username: '',
  nombres: '',
  apellidos: '',
  rol: 'TRABAJADOR',
  email: '',
  estado: true,
  sucursal: 'Sede Central',
  telefono: '',
  password: '',
};

const usuarioCrudService = {
  getAll: () => UsuarioService.getUsuarios(),
  getById: (id: number) => UsuarioService.getUsuarioById(id),
  create: (data: UsuarioInsertDto) => UsuarioService.createUsuario(data),
  update: (data: UsuarioUpdateDto) => UsuarioService.updateUsuario(data),
  delete: (id: number) => UsuarioService.deleteUsuario(id),
};

const UsersSection = () => {
  const { items: users, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<UsuarioSelectDto, UsuarioInsertDto, UsuarioUpdateDto>(usuarioCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<UsuarioSelectDto>();

  const [roles, setRoles] = useState<RolSelectDto[]>([]);
  const [filters, setFilters] = useState<UsuarioFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<UsuarioSelectDto> & { password?: string }>(EMPTY_FORM);

  useEffect(() => {
    RolService.getRoles()
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (user: UsuarioSelectDto) => {
      if (!showDisabled && !user.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !user.estado) return false;
        if (filters.estado === 'INACTIVO' && user.estado) return false;
      }
      if (filters.rol && user.rol !== filters.rol) return false;
      if (filters.sucursal && user.sucursal !== filters.sucursal) return false;
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
  } = useDataTable<UsuarioSelectDto>({
    data: users,
    searchKeys: ['username', 'nombres', 'apellidos', 'email', 'sucursal'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = users.length;
    const activos = users.filter(u => u.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [users]);

  const roleOptions = useMemo(() => {
    const fromApi = roles.filter(r => r.estado).map(r => r.nombre);
    if (fromApi.length > 0) return fromApi;
    return ['ADMINISTRADOR', 'SUPERVISOR', 'CAJERO', 'TRABAJADOR', 'CLIENTE'];
  }, [roles]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: UsuarioSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail, password: '' });
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
        const payload: UsuarioInsertDto = {
          username: formState.username || '',
          nombres: formState.nombres || '',
          apellidos: formState.apellidos || '',
          rol: formState.rol || 'TRABAJADOR',
          email: formState.email || '',
          sucursal: formState.sucursal || 'Sede Central',
          telefono: formState.telefono || '',
          password: formState.password || '',
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: UsuarioUpdateDto = {
          id: dialogState.record.id,
          username: formState.username || '',
          nombres: formState.nombres || '',
          apellidos: formState.apellidos || '',
          rol: formState.rol || 'TRABAJADOR',
          email: formState.email || '',
          estado: formState.estado !== false,
          sucursal: formState.sucursal || '',
          telefono: formState.telefono || '',
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
      key: 'username',
      header: 'Usuario',
      sortable: true,
      render: (row: UsuarioSelectDto) => (
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
      render: (row: UsuarioSelectDto) => `${row.nombres} ${row.apellidos}`,
    },
    {
      key: 'rol',
      header: 'Rol de Sistema',
      sortable: true,
      width: '140px',
      render: (row: UsuarioSelectDto) => <RoleBadge role={row.rol as RolUsuario} />,
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
      render: (row: UsuarioSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: UsuarioSelectDto) => (
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

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, usuario, email o sucursal..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Usuario"
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
              <label className="erp-form-label">Rol</label>
              <select className="erp-input" value={filters.rol} onChange={e => setFilters(prev => ({ ...prev, rol: e.target.value }))}>
                <option value="">Todos</option>
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Sucursal</label>
              <select className="erp-input" value={filters.sucursal} onChange={e => setFilters(prev => ({ ...prev, sucursal: e.target.value }))}>
                <option value="">Todas</option>
                {SUCURSALES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando usuarios...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron cuentas registradas" />
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
          dialogState.mode === 'create' ? 'Agregar Usuario' :
          dialogState.mode === 'edit' ? 'Editar Usuario' :
          dialogState.mode === 'view' ? 'Ver Detalles de Cuenta' : 'Eliminar Usuario'
        }
        size="lg"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar al usuario <strong>@{dialogState.record.username}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre de Usuario (Username)</label>
              <input type="text" className="erp-input" value={formState.username || ''} onChange={e => setFormState(prev => ({ ...prev, username: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: jsmith" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Nombres</label>
              <input type="text" className="erp-input" value={formState.nombres || ''} onChange={e => setFormState(prev => ({ ...prev, nombres: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: John" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Apellidos</label>
              <input type="text" className="erp-input" value={formState.apellidos || ''} onChange={e => setFormState(prev => ({ ...prev, apellidos: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: Smith" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Correo Electrónico</label>
              <input type="email" className="erp-input" value={formState.email || ''} onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="email@lina.pe" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Rol del Sistema</label>
              <select className="erp-input" value={formState.rol || 'TRABAJADOR'} onChange={e => setFormState(prev => ({ ...prev, rol: e.target.value }))} disabled={dialogState.mode === 'view'}>
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Sucursal Asignada</label>
              <select className="erp-input" value={formState.sucursal || 'Sede Central'} onChange={e => setFormState(prev => ({ ...prev, sucursal: e.target.value }))} disabled={dialogState.mode === 'view'}>
                {SUCURSALES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Teléfono</label>
              <input type="text" className="erp-input" value={formState.telefono || ''} onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: 999888777" />
            </div>
            {dialogState.mode === 'create' && (
              <div className="erp-form-group">
                <label className="erp-form-label">Contraseña</label>
                <input type="password" className="erp-input" value={formState.password || ''} onChange={e => setFormState(prev => ({ ...prev, password: e.target.value }))} placeholder="Contraseña inicial" />
              </div>
            )}
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado de la cuenta</label>
                {dialogState.mode === 'view' ? (
                  <div style={{ paddingTop: '6px' }}>
                    <StatusBadge status={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'} />
                  </div>
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

export default UsersSection;
