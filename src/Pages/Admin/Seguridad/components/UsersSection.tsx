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
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import {
  FiUsers,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
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

export const UsersSection = () => {
  const { items: users, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<UsuarioSelectDto, UsuarioGuardarDto, UsuarioGuardarDto>(usuarioCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<UsuarioSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [roles, setRoles] = useState<RolSelectDto[]>([]);
  const [filters, setFilters] = useState<UsuarioFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
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

  const handleStartCreate = () => {
    setFormError(null);
    setSelectedId(null);
    setFormState({
      ...EMPTY_FORM,
      idRol: roles[0]?.id || 0,
    });
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: UsuarioSelectDto) => {
    setFormError(null);
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState(toFormState(detail));
  };

  const handleStartView = async (record: UsuarioSelectDto) => {
    setFormError(null);
    setSelectedId(record.id);
    setFormMode('view');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState(toFormState(detail));
  };

  const buildPayload = (): UsuarioGuardarDto => {
    const payload: UsuarioGuardarDto = {
      idUsuario: formMode === 'edit' ? selectedId : null,
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

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

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
    if (formMode === 'create' && !formState.contrasena.trim()) {
      setFormError('Ingrese la contraseña.');
      return;
    }

    setFormError(null);
    try {
      if (formMode === 'create') {
        await createItem(buildPayload());
      } else {
        await updateItem(buildPayload());
      }
      setActiveTab('list');
    } catch {
      // error handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (dialogState.record) {
      await deleteItem(dialogState.record.id);
      closeDialog();
    }
  };

  const isReadOnly = formMode === 'view';

  const columns = [
    {
      key: 'nombreApellido',
      header: 'Nombre y Apellidos',
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
      header: 'Rol de Acceso',
      sortable: true,
      width: '150px',
      render: (row: UsuarioSelectDto) => (
        <span className="erp-badge erp-badge-role" style={{ padding: '2px 8px', borderRadius: '0px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '11.5px', border: '1px solid #bae6fd' }}>
          {row.rol || '—'}
        </span>
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
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: UsuarioSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: UsuarioSelectDto) => (
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
        searchPlaceholder="Buscar por nombre, DNI, correo o rol..."
        onNew={handleStartCreate}
        newLabel="Nuevo Usuario"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Rol</label>
              <select
                className="erp-filter-select"
                value={filters.idRol}
                onChange={e => setFilters(prev => ({ ...prev, idRol: e.target.value }))}
              >
                <option value="">Todos los roles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Estado</label>
              <select
                className="erp-filter-select"
                value={filters.estado}
                onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

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
  );

  const formContent = (
    <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
      <div className="erp-form-section">
        <h3 className="erp-form-section-title">
          {formMode === 'create' && 'Nuevo Usuario'}
          {formMode === 'edit' && `Editando Usuario #${selectedId}`}
          {formMode === 'view' && `Detalle de Usuario #${selectedId}`}
        </h3>

        {formError && (
          <div style={{ padding: '8px 12px', marginBottom: '14px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
            {formError}
          </div>
        )}

        <div className="erp-form-fields">
          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre y apellido <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombreApellido}
                onChange={e => setFormState(prev => ({ ...prev, nombreApellido: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Ej: Ana Pérez"
                required
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">DNI <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.dni}
                maxLength={8}
                onChange={e => setFormState(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                disabled={isReadOnly}
                placeholder="8 dígitos"
                required
              />
            </div>
          </div>

          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Correo electrónico <span className="required-star">*</span></label>
              <input
                type="email"
                className="erp-input"
                value={formState.correo}
                onChange={e => setFormState(prev => ({ ...prev, correo: e.target.value }))}
                disabled={isReadOnly}
                placeholder="correo@ejemplo.com"
                required
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
          </div>

          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Sexo</label>
              {isReadOnly ? (
                <div className="erp-form-status-value">
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
              <label className="erp-form-label">Rol de Acceso <span className="required-star">*</span></label>
              <select
                className="erp-input"
                value={formState.idRol}
                onChange={e => setFormState(prev => ({ ...prev, idRol: Number(e.target.value) }))}
                disabled={isReadOnly}
                required
              >
                <option value={0}>Seleccione rol...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {!isReadOnly && (
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">
                  Contraseña {formMode === 'create' ? <span className="required-star">*</span> : '(opcional)'}
                </label>
                <input
                  type="password"
                  className="erp-input"
                  value={formState.contrasena}
                  onChange={e => setFormState(prev => ({ ...prev, contrasena: e.target.value }))}
                  placeholder={formMode === 'create' ? 'Contraseña inicial' : 'Dejar vacío para no cambiar'}
                  required={formMode === 'create'}
                />
              </div>
              {(formMode === 'edit') && (
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado</label>
                  <select
                    className="erp-input"
                    value={formState.estado ? 'ACTIVO' : 'INACTIVO'}
                    onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {formMode === 'view' && (
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <div className="erp-form-status-value">
                <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
              </div>
            </div>
          )}
        </div>
      </div>

      {!isReadOnly && (
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
            <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Usuarios y Empleados del Sistema"
        subtitle="Administra cuentas de usuario, credenciales de inicio de sesión y asignación de roles"
        entityName="Usuario"
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
        title="Eliminar Usuario"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar a <strong>{dialogState.record.nombreApellido}</strong> ({dialogState.record.correo})?</>
          ) : undefined
        }
      />
    </>
  );
};

export default UsersSection;
