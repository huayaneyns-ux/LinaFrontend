import { useState, useCallback, useMemo } from 'react';

import { RolService } from '../../../../Services/Admin/Seguridad/Rol';
import type {
  RolSelectDto,
  RolInsertDto,
  RolUpdateDto,
} from '../../../../Types/Admin/Seguridad/Rol';

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
  FiLock,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
} from 'react-icons/fi';

interface RolFilters {
  estado: string;
}

const DEFAULT_FILTERS: RolFilters = { estado: '' };

const EMPTY_FORM: Partial<RolSelectDto> = {
  nombre: '',
  descripcion: '',
  estado: true,
};

const rolCrudService = {
  getAll: () => RolService.getRoles(),
  getById: (id: number) => RolService.getRolById(id),
  create: (data: RolInsertDto) => RolService.createRol(data),
  update: (data: RolUpdateDto) => RolService.updateRol(data),
  delete: (id: number) => RolService.deleteRol(id),
};

const RolesSection = () => {
  const { items: roles, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<RolSelectDto, RolInsertDto, RolUpdateDto>(rolCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<RolSelectDto>();

  const [filters, setFilters] = useState<RolFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<RolSelectDto>>(EMPTY_FORM);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (rol: RolSelectDto) => {
      if (!showDisabled && !rol.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !rol.estado) return false;
        if (filters.estado === 'INACTIVO' && rol.estado) return false;
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
  } = useDataTable<RolSelectDto>({
    data: roles,
    searchKeys: ['nombre', 'descripcion'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = roles.length;
    const activos = roles.filter(r => r.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [roles]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: RolSelectDto) => {
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
        const payload: RolInsertDto = {
          nombre: formState.nombre || '',
          descripcion: formState.descripcion || '',
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: RolUpdateDto = {
          id: dialogState.record.id,
          nombre: formState.nombre || '',
          descripcion: formState.descripcion || '',
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
      render: (row: RolSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.id}</strong>
      ),
    },
    {
      key: 'nombre',
      header: 'Rol / Cargo',
      sortable: true,
      width: '180px',
      render: (row: RolSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción del Acceso',
      sortable: true,
      render: (row: RolSelectDto) => (
        <span style={{ color: 'var(--erp-text-secondary)', fontSize: '12px' }}>{row.descripcion}</span>
      ),
    },
    {
      key: 'usuariosAsignados',
      header: 'Asignados',
      sortable: true,
      align: 'center' as const,
      width: '120px',
      render: (row: RolSelectDto) => (
        <span style={{
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--erp-accent-light)',
          color: 'var(--erp-accent)',
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
      render: (row: RolSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: RolSelectDto) => (
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

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o descripción..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Rol"
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
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando roles...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron roles de usuario" />
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
          dialogState.mode === 'create' ? 'Agregar Rol de Sistema' :
          dialogState.mode === 'edit' ? 'Editar Rol' :
          dialogState.mode === 'view' ? 'Ver Detalles de Permisos' : 'Eliminar Rol'
        }
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar el rol <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre del Rol (Cargo)</label>
              <input type="text" className="erp-input" value={formState.nombre || ''} onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: SUPERVISOR" />
            </div>
            {(dialogState.mode === 'view' || dialogState.mode === 'edit') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Usuarios Asignados</label>
                <input type="number" className="erp-input" value={formState.usuariosAsignados ?? 0} disabled />
              </div>
            )}
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
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
        )}
      </CrudDialog>
    </div>
  );
};

export default RolesSection;
