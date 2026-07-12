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
import {
  FiUsers,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
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

const ProveedoresSection = () => {
  const { items: providers, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<Proveedor, ProveedorInsert, ProveedorUpdate>(proveedorCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<Proveedor>();

  const [filters, setFilters] = useState<ProveedorFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: Proveedor) => {
    setDeleteAlert(null);
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
        const payload: ProveedorInsert = {
          ruc: formState.ruc || '',
          razonSocial: formState.razonSocial || '',
          nombreContacto: formState.nombreContacto || '',
          telefono: formState.telefono || '',
          idDireccion: Number(formState.idDireccion) || 0,
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: ProveedorUpdate = {
          id: dialogState.record.id,
          ruc: formState.ruc || '',
          razonSocial: formState.razonSocial || '',
          nombreContacto: formState.nombreContacto || '',
          telefono: formState.telefono || '',
          idDireccion: Number(formState.idDireccion) || 0,
          estado: formState.estado !== false,
        };
        await updateItem(payload);
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        const result = await deleteItem(dialogState.record.id);
        if (typeof result === 'object' && result !== null && 'tieneProductos' in result) {
          const alert = result as ProveedorDeleteResponse;
          if (alert.tieneProductos) {
            setDeleteAlert(alert);
            return;
          }
        }
      }
      closeDialog();
    } catch {
      // error shown via hook
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
      width: '180px',
      render: (row: Proveedor) =>
        [row.direccion, row.distrito, row.provincia].filter(Boolean).join(', ') || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Proveedor) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
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

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por RUC, razón social o contacto..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Proveedor"
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
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando proveedores...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron proveedores" />
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
          dialogState.mode === 'create' ? 'Agregar Proveedor' :
          dialogState.mode === 'edit' ? 'Editar Proveedor' :
          dialogState.mode === 'view' ? 'Ver Detalles de Proveedor' : 'Eliminar Proveedor'
        }
        size="lg"
        deleteMessage={
          deleteAlert?.tieneProductos ? (
            <div>
              <p>{deleteAlert.mensaje}</p>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {deleteAlert.productos.map(p => (
                  <li key={p.id}>{p.codigo} — {p.nombre}</li>
                ))}
              </ul>
            </div>
          ) : dialogState.record ? (
            <>¿Está seguro de eliminar a <strong>{dialogState.record.razonSocial}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">RUC (11 dígitos)</label>
              <input type="text" maxLength={11} className="erp-input" value={formState.ruc || ''} onChange={e => setFormState(prev => ({ ...prev, ruc: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: 20100200301" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Razón Social</label>
              <input type="text" className="erp-input" value={formState.razonSocial || ''} onChange={e => setFormState(prev => ({ ...prev, razonSocial: e.target.value }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre del Contacto</label>
              <input type="text" className="erp-input" value={formState.nombreContacto || ''} onChange={e => setFormState(prev => ({ ...prev, nombreContacto: e.target.value }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Teléfono</label>
              <input type="text" className="erp-input" value={formState.telefono || ''} onChange={e => setFormState(prev => ({ ...prev, telefono: e.target.value }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">ID Dirección</label>
              <input type="number" className="erp-input" value={formState.idDireccion ?? 0} onChange={e => setFormState(prev => ({ ...prev, idDireccion: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {dialogState.mode === 'view' ? (
                  <div style={{ paddingTop: '6px' }}><StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} /></div>
                ) : (
                  <select className="erp-input" value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'} onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                )}
              </div>
            )}
            <div className="erp-form-group col-span-2">
              <label className="erp-form-label">Dirección</label>
              <input type="text" className="erp-input" value={formState.direccion || ''} disabled placeholder="Se carga desde la BD por idDireccion" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Distrito</label>
              <input type="text" className="erp-input" value={formState.distrito || ''} disabled />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Provincia</label>
              <input type="text" className="erp-input" value={formState.provincia || ''} disabled />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Departamento</label>
              <input type="text" className="erp-input" value={formState.departamento || ''} disabled />
            </div>
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default ProveedoresSection;
