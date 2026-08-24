import { useState, useCallback, useMemo, useEffect } from 'react';

import { UsuarioService } from '../../../../Services/Admin/Seguridad/Usuario';
import { RolService } from '../../../../Services/Admin/Seguridad/Rol';
import type {
  UsuarioSelectDto,
  UsuarioGuardarDto,
} from '../../../../Types/Admin/Seguridad/Usuario';
import type { RolSelectDto } from '../../../../Types/Admin/Seguridad/Rol';

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
  FiUsers,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
} from 'react-icons/fi';

interface UsuarioFilters {
  estado: string;
  idRol: string;
}

interface UsuarioFormState {
  idUsuario?: number | null;
  nombreApellido: string;
  dni: string;
  sexo: string;
  telefono: string;
  correo: string;
  contrasena: string;
  idRol: number;
  estado: boolean;
}

const DEFAULT_FILTERS: UsuarioFilters = { estado: '', idRol: '' };

const EMPTY_FORM: UsuarioFormState = {
  idUsuario: null,
  nombreApellido: '',
  dni: '',
  sexo: 'M',
  telefono: '',
  correo: '',
  contrasena: '',
  idRol: 0,
  estado: true,
};

const toFormState = (u: UsuarioSelectDto): UsuarioFormState => ({
  idUsuario: u.id,
  nombreApellido: u.nombreApellido || '',
  dni: u.dni || '',
  sexo: u.sexo || 'M',
  telefono: u.telefono || '',
  correo: u.correo || '',
  contrasena: '',
  idRol: u.idRol || 0,
  estado: u.estado !== false,
});

const usuarioCrudService = {
  getAll: () => UsuarioService.getUsuarios(),
  getById: (id: number) => UsuarioService.getUsuarioById(id),
  create: (data: UsuarioGuardarDto) => UsuarioService.guardarUsuario(data),
  update: (data: UsuarioGuardarDto) => UsuarioService.guardarUsuario(data),
  delete: (id: number) => UsuarioService.deleteUsuario(id),
};

const UsersSection = () => {
  const { items: users, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<UsuarioSelectDto, UsuarioGuardarDto, UsuarioGuardarDto>(usuarioCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<UsuarioSelectDto>();

  const [roles, setRoles] = useState<RolSelectDto[]>([]);
  const [filters, setFilters] = useState<UsuarioFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<UsuarioFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    RolService.getRoles()
      .then(data => setRoles(Array.isArray(data) ? data.filter(r => r.estado) : []))
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
      if (filters.idRol && user.idRol.toString() !== filters.idRol) return false;
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
    searchKeys: ['nombreApellido', 'dni', 'correo', 'rol', 'telefono'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = users.length;
    const activos = users.filter(u => u.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [users]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: UsuarioSelectDto) => {
    setFormError(null);
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState(toFormState(detail));
    } else if (mode === 'delete' && record) {
      setFormState(toFormState(record));
    } else {
      setFormState({
        ...EMPTY_FORM,
        idRol: roles[0]?.id || 0,
      });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const buildPayload = (): UsuarioGuardarDto => {
    const payload: UsuarioGuardarDto = {
      idUsuario: dialogState.mode === 'edit' ? formState.idUsuario ?? dialogState.record?.id ?? null : null,
      nombreApellido: formState.nombreApellido.trim(),
      dni: formState.dni.trim(),
      sexo: formState.sexo || undefined,
      telefono: formState.telefono.trim() || null,
      correo: formState.correo.trim(),
      idRol: Number(formState.idRol),
      estado: formState.estado !== false,
    };

    if (formState.contrasena.trim()) {
      payload.contrasena = formState.contrasena;
    }

    return payload;
  };

  const handleConfirm = async () => {
    try {
      if (dialogState.mode === 'create' || dialogState.mode === 'edit') {
        if (!formState.nombreApellido.trim()) {
          setFormError('Ingrese el nombre y apellido.');
          return;
        }
        if (!formState.dni.trim()) {
          setFormError('Ingrese el DNI.');
          return;
        }
        if (!formState.correo.trim()) {
          setFormError('Ingrese el correo.');
          return;
        }
        if (!formState.idRol) {
          setFormError('Seleccione un rol.');
          return;
        }
        if (dialogState.mode === 'create' && !formState.contrasena.trim()) {
          setFormError('Ingrese la contraseña.');
          return;
        }
        setFormError(null);
        if (dialogState.mode === 'create') {
          await createItem(buildPayload());
        } else {
          await updateItem(buildPayload());
        }
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        await deleteItem(dialogState.record.id);
      }
      closeDialog();
    } catch {
      // error via hook
    }
  };

  const isReadOnly = dialogState.mode === 'view';

  const columns = [
    {
      key: 'nombreApellido',
      header: 'Nombre',
      sortable: true,
      render: (row: UsuarioSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.nombreApellido || '—'}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{row.correo}</div>
        </div>
      ),
    },
    {
      key: 'dni',
      header: 'DNI',
      sortable: true,
      width: '110px',
      render: (row: UsuarioSelectDto) => row.dni || '—',
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      sortable: true,
      width: '120px',
      render: (row: UsuarioSelectDto) => row.telefono || '—',
    },
    {
      key: 'rol',
      header: 'Rol',
      sortable: true,
      width: '140px',
      render: (row: UsuarioSelectDto) => (
        <span className="erp-badge erp-badge-role">{row.rol || '—'}</span>
      ),
    },
    {
      key: 'sexo',
      header: 'Sexo',
      sortable: true,
      width: '80px',
      render: (row: UsuarioSelectDto) =>
        row.sexo === 'M' ? 'M' : row.sexo === 'F' ? 'F' : row.sexo || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
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
        searchPlaceholder="Buscar por nombre, DNI, correo o rol..."
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
              <select
                className="erp-input"
                value={filters.idRol}
                onChange={e => setFilters(prev => ({ ...prev, idRol: e.target.value }))}
              >
                <option value="">Todos</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado}
                onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
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
            <DataTable
              columns={columns}
              data={processedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              rowKey={row => row.id}
              emptyMessage="No se encontraron usuarios registrados"
            />
            <Pagination
              page={pagination.page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pagination.pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
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
          dialogState.mode === 'create' ? 'Nuevo usuario' :
          dialogState.mode === 'edit' ? 'Editar usuario' :
          dialogState.mode === 'view' ? 'Detalle de usuario' : 'Eliminar usuario'
        }
        size="lg"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar a <strong>{dialogState.record.nombreApellido}</strong> ({dialogState.record.correo})?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            {formError && (
              <div style={{ gridColumn: '1 / -1', padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>
                {formError}
              </div>
            )}
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre y apellido *</label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombreApellido}
                onChange={e => setFormState(prev => ({ ...prev, nombreApellido: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Ej: Ana Pérez"
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">DNI *</label>
              <input
                type="text"
                className="erp-input"
                value={formState.dni}
                maxLength={8}
                onChange={e => setFormState(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                disabled={isReadOnly}
                placeholder="8 dígitos"
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Correo *</label>
              <input
                type="email"
                className="erp-input"
                value={formState.correo}
                onChange={e => setFormState(prev => ({ ...prev, correo: e.target.value }))}
                disabled={isReadOnly}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Teléfono</label>
              <input
                type="text"
                className="erp-input"
                value={formState.telefono}
                onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))}
                disabled={isReadOnly}
                placeholder="999888777"
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Sexo</label>
              {isReadOnly ? (
                <div style={{ paddingTop: '6px' }}>
                  {formState.sexo === 'M' ? 'Masculino' : formState.sexo === 'F' ? 'Femenino' : formState.sexo || '—'}
                </div>
              ) : (
                <select
                  className="erp-input"
                  value={formState.sexo}
                  onChange={e => setFormState(prev => ({ ...prev, sexo: e.target.value }))}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              )}
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Rol *</label>
              <select
                className="erp-input"
                value={formState.idRol}
                onChange={e => setFormState(prev => ({ ...prev, idRol: Number(e.target.value) }))}
                disabled={isReadOnly}
              >
                <option value={0}>Seleccione rol...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>

            {(dialogState.mode === 'create' || dialogState.mode === 'edit') && (
              <div className="erp-form-group">
                <label className="erp-form-label">
                  Contraseña {dialogState.mode === 'create' ? '*' : '(opcional)'}
                </label>
                <input
                  type="password"
                  className="erp-input"
                  value={formState.contrasena}
                  onChange={e => setFormState(prev => ({ ...prev, contrasena: e.target.value }))}
                  placeholder={dialogState.mode === 'create' ? 'Contraseña inicial' : 'Dejar vacío para no cambiar'}
                />
              </div>
            )}

            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {isReadOnly ? (
                  <div style={{ paddingTop: '6px' }}>
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} />
                  </div>
                ) : (
                  <select
                    className="erp-input"
                    value={formState.estado ? 'ACTIVO' : 'INACTIVO'}
                    onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                  >
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
