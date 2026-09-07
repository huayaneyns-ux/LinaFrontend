import { useState, useCallback, useMemo } from 'react';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import type {
  Proveedor,
  ProveedorInsert,
  ProveedorUpdate,
  ProveedorDeleteResponse,
} from '../../../../Types/Admin/Compras/Proveedor';

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

interface ProveedorFilters {
  estado: string;
}

const DEFAULT_FILTERS: ProveedorFilters = { estado: '' };

const EMPTY_FORM: Partial<Proveedor> = {
  ruc: '',
  razonSocial: '',
  nombreContacto: '',
  telefono: '',
  idDireccion: 0,
  direccion: '',
  distrito: '',
  provincia: '',
  departamento: '',
  estado: true,
};

const proveedorCrudService = {
  getAll: () => ProveedorService.getProveedores(),
  getById: (id: number) => ProveedorService.getProveedorById(id),
  create: (data: ProveedorInsert) => ProveedorService.createProveedor(data),
  update: (data: ProveedorUpdate) => ProveedorService.updateProveedor(data),
  delete: (id: number) => ProveedorService.deleteProveedor(id),
};

export const ProveedoresSection = () => {
  const { items: providers, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<Proveedor, ProveedorInsert, ProveedorUpdate>(proveedorCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<Proveedor>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<ProveedorFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<Proveedor>>(EMPTY_FORM);
  const [deleteAlert, setDeleteAlert] = useState<ProveedorDeleteResponse | null>(null);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (prov: Proveedor) => {
      if (!showDisabled && !prov.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !prov.estado) return false;
        if (filters.estado === 'INACTIVO' && prov.estado) return false;
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
  } = useDataTable<Proveedor>({
    data: providers,
    searchKeys: ['ruc', 'razonSocial', 'nombreContacto', 'telefono', 'direccion'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = providers.length;
    const activos = providers.filter(p => p.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [providers]);

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: Proveedor) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleStartView = async (record: Proveedor) => {
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
        const payload: ProveedorInsert = {
          ruc: formState.ruc || '',
          razonSocial: formState.razonSocial || '',
          nombreContacto: formState.nombreContacto || '',
          telefono: formState.telefono || '',
          idDireccion: Number(formState.idDireccion) || 0,
        };
        await createItem(payload);
      } else if (formMode === 'edit' && selectedId) {
        const payload: ProveedorUpdate = {
          id: selectedId,
          ruc: formState.ruc || '',
          razonSocial: formState.razonSocial || '',
          nombreContacto: formState.nombreContacto || '',
          telefono: formState.telefono || '',
          idDireccion: Number(formState.idDireccion) || 0,
          estado: formState.estado !== false,
        };
        await updateItem(payload);
      }
      setActiveTab('list');
    } catch {
      // hook handles error
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dialogState.record) return;
    try {
      const result = await deleteItem(dialogState.record.id);
      if (typeof result === 'object' && result !== null && 'tieneProductos' in result) {
        const alert = result as ProveedorDeleteResponse;
        if (alert.tieneProductos) {
          setDeleteAlert(alert);
          return;
        }
      }
      closeDialog();
    } catch {
      // hook handles error
    }
  };

  const columns = [
    {
      key: 'ruc',
      header: 'RUC',
      sortable: true,
      width: '130px',
      render: (row: Proveedor) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.ruc}</strong>
      ),
    },
    {
      key: 'razonSocial',
      header: 'Razón Social',
      sortable: true,
      render: (row: Proveedor) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.razonSocial}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>
            Contacto: {row.nombreContacto} | Tel: {row.telefono}
          </div>
        </div>
      ),
    },
    {
      key: 'direccion',
      header: 'Dirección',
      sortable: true,
      width: '200px',
      render: (row: Proveedor) =>
        [row.direccion, row.distrito, row.provincia].filter(Boolean).join(', ') || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: Proveedor) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: Proveedor) => (
        <div className="erp-table-actions">
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleStartView(row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleStartEdit(row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => { setDeleteAlert(null); openDelete(row); }} />
        </div>
      ),
    },
  ];

  return (
    <SubmoduleTwoTabsLayout
      title="Directorio de Proveedores"
      subtitle="Gestiona los socios comerciales, distribuidores y contactos para abastecimiento"
      entityName="Proveedor"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode={formMode}
      onNew={handleStartCreate}
      extraHeaderActions={
        activeTab === 'list' && (
          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
            onClick={() => setShowDisabled(prev => !prev)}
          >
            {showDisabled ? <FiEyeOff /> : <FiEye />}
            <span>{showDisabled ? 'Ocultar inactivos' : 'Mostrar inactivos'}</span>
          </button>
        )
      }
      listContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {error && (
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', border: '1px solid var(--erp-danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Indicadores Compactos */}
          <div className="erp-indicators-grid" style={{ marginBottom: 0 }}>
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
                <span className="erp-indicator-label">Inactivos</span>
              </div>
            </div>
          </div>

          {/* Filtros Toolbar */}
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar por RUC, razón social o contacto..."
            onNew={handleStartCreate}
            newLabel="Nuevo Proveedor"
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(prev => !prev)}
            filterCount={filterCount}
            onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
            alwaysShowFilters={true}
            filterPanel={
              <div className="erp-filter-group">
                <label className="erp-filter-label">Estado</label>
                <select className="erp-filter-select" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            }
          />

          {/* Data Table */}
          <div className="erp-table-card">
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando proveedores...</div>
            ) : (
              <>
                <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron proveedores registrados" />
                <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
              </>
            )}
          </div>

          {/* Modal Pequeño de Confirmación de Eliminación */}
          <CrudDialog
            isOpen={dialogState.isOpen && dialogState.mode === 'delete'}
            mode="delete"
            onClose={closeDialog}
            onConfirm={handleDeleteConfirm}
            loading={saving}
            title="Confirmar Eliminación"
            size="sm"
            deleteMessage={
              deleteAlert?.tieneProductos ? (
                <div>
                  <p>{deleteAlert.mensaje}</p>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '12px' }}>
                    {deleteAlert.productos.map(p => (
                      <li key={p.id}>{p.codigo} — {p.nombre}</li>
                    ))}
                  </ul>
                </div>
              ) : dialogState.record ? (
                <>¿Está seguro de eliminar al proveedor <strong>{dialogState.record.razonSocial}</strong>?</>
              ) : undefined
            }
          />
        </div>
      }
      formContent={
        <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              {formMode === 'create' ? 'Registro de Nuevo Proveedor' : formMode === 'edit' ? `Modificación de Proveedor #${selectedId}` : `Ficha Detallada de Proveedor #${selectedId}`}
            </h3>

          {error && (
            <div style={{ padding: '8px 12px', marginBottom: '14px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', border: '1px solid var(--erp-danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div className="erp-form-fields">
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">RUC (11 dígitos) <span className="required-star">*</span></label>
                <input
                  type="text"
                  maxLength={11}
                  className="erp-input"
                  value={formState.ruc || ''}
                  onChange={e => setFormState(prev => ({ ...prev, ruc: e.target.value.replace(/\D/g, '') }))}
                  disabled={formMode === 'view'}
                  placeholder="Ej: 20100200301"
                  required
                />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Razón Social <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.razonSocial || ''}
                  onChange={e => setFormState(prev => ({ ...prev, razonSocial: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Nombre legal de la empresa"
                  required
                />
              </div>
            </div>
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">Nombre del Contacto</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.nombreContacto || ''}
                  onChange={e => setFormState(prev => ({ ...prev, nombreContacto: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.telefono || ''}
                  onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Ej: 999888777"
                />
              </div>
            </div>
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">ID Dirección Fiscal</label>
                <input
                  type="number"
                  className="erp-input"
                  value={formState.idDireccion ?? 0}
                  onChange={e => setFormState(prev => ({ ...prev, idDireccion: Number(e.target.value) }))}
                  disabled={formMode === 'view'}
                />
              </div>
              {formMode !== 'create' ? (
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado Operativo</label>
                  {formMode === 'view' ? (
                    <div className="erp-form-status-value">
                      <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
                    </div>
                  ) : (
                    <select
                      className="erp-input"
                      value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'}
                      onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  )}
                </div>
              ) : (
                <div className="erp-form-group" />
              )}
            </div>

            <div className="erp-form-group">
              <label className="erp-form-label">Dirección / Ubicación Registrada</label>
              <input
                type="text"
                className="erp-input"
                value={[formState.direccion, formState.distrito, formState.provincia, formState.departamento].filter(Boolean).join(', ') || ''}
                disabled
                placeholder="Dirección registrada en base de datos"
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
                <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}</span>
              </button>
            </div>
          )}
        </form>
      }
    />
  );
};

export default ProveedoresSection;
