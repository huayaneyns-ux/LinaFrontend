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
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import {
  FiLock,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
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

export const RolesSection = () => {
  const { items: roles, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<RolSelectDto, RolInsertDto, RolUpdateDto>(rolCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<RolSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: RolSelectDto) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleStartView = async (record: RolSelectDto) => {
    setSelectedId(record.id);
    setFormMode('view');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

    try {
      if (formMode === 'create') {
        const payload: RolInsertDto = {
          nombre: formState.nombre || '',
          descripcion: formState.descripcion || '',
        };
        await createItem(payload);
      } else if (formMode === 'edit' && selectedId) {
        const payload: RolUpdateDto = {
          id: selectedId,
          nombre: formState.nombre || '',
          descripcion: formState.descripcion || '',
          estado: formState.estado !== false,
        };
        await updateItem(payload);
      }
      setActiveTab('list');
    } catch {
      // error shown via hook
    }
  };

  const handleConfirmDelete = async () => {
    if (dialogState.record) {
      await deleteItem(dialogState.record.id);
      closeDialog();
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
          borderRadius: '0px',
          backgroundColor: 'var(--erp-accent-light)',
          color: 'var(--erp-accent)',
          border: '1px solid var(--erp-accent)',
          fontSize: '11.5px',
        }}>
          {row.usuariosAsignados} usuarios
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: RolSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: RolSelectDto) => (
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
        searchPlaceholder="Buscar por nombre o descripción..."
        onNew={handleStartCreate}
        newLabel="Nuevo Rol"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
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
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando roles...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={processedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            rowKey={row => row.id}
            emptyMessage="No se encontraron roles registrados"
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
          {formMode === 'create' && 'Nuevo Rol'}
          {formMode === 'edit' && `Editando Rol #${selectedId}`}
          {formMode === 'view' && `Detalle de Rol #${selectedId}`}
        </h3>

        <div className="erp-form-fields">
          {(formMode === 'edit' || formMode === 'view') ? (
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">Nombre del Rol <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.nombre || ''}
                  onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Ej: Administrador, Cajero, Almacenero"
                  required
                />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {formMode === 'view' ? (
                  <div className="erp-form-status-value">
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
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
            </div>
          ) : (
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre del Rol <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Administrador, Cajero, Almacenero"
                required
              />
            </div>
          )}

          <div className="erp-form-group">
            <label className="erp-form-label">Descripción del Acceso</label>
            <textarea
              className="erp-input"
              style={{ minHeight: '60px', height: 'auto' }}
              value={formState.descripcion || ''}
              onChange={e => setFormState(prev => ({ ...prev, descripcion: e.target.value }))}
              disabled={formMode === 'view'}
              placeholder="Descripción de funciones y responsabilidades del rol..."
            />
          </div>
        </div>
      </div>

      {formMode !== 'view' && (
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
            <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Roles y Permisos de Usuarios"
        subtitle="Administra los roles de acceso, cargos y niveles de autorización dentro del sistema"
        entityName="Rol"
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
        title="Eliminar Rol"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar el rol <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      />
    </>
  );
};

export default RolesSection;
