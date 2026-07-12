import { useState, useCallback, useMemo, useEffect } from 'react';

import { CompraService } from '../../../../Services/Admin/Compras/Compra';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import type {
  CompraSelectDto,
  CompraInsertDto,
  CompraUpdateDto,
} from '../../../../Types/Admin/Compras/Compra';
import type { Proveedor } from '../../../../Types/Admin/Compras/Proveedor';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiEye,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';

interface CompraFilters {
  estado: string;
}

const DEFAULT_FILTERS: CompraFilters = { estado: '' };

const EMPTY_FORM: Partial<CompraSelectDto> = {
  codigo: '',
  idProveedor: 0,
  fecha: new Date().toISOString(),
  estado: 'PENDIENTE',
  total: 0,
};

const compraCrudService = {
  getAll: () => CompraService.getCompras(),
  getById: (id: number) => CompraService.getCompraById(id),
  create: (data: CompraInsertDto) => CompraService.createCompra(data),
  update: (data: CompraUpdateDto) => CompraService.updateCompra(data),
  delete: (id: number) => CompraService.deleteCompra(id),
};

const ComprasSection = () => {
  const { items: purchases, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<CompraSelectDto, CompraInsertDto, CompraUpdateDto>(compraCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<CompraSelectDto>();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filters, setFilters] = useState<CompraFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [formState, setFormState] = useState<Partial<CompraSelectDto>>(EMPTY_FORM);

  useEffect(() => {
    ProveedorService.getProveedores()
      .then(setProveedores)
      .catch(() => setProveedores([]));
  }, []);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (purchase: CompraSelectDto) => {
      if (filters.estado && purchase.estado !== filters.estado) return false;
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
  } = useDataTable<CompraSelectDto>({
    data: purchases,
    searchKeys: ['codigo', 'proveedor'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = purchases.length;
    const activos = purchases.filter(c => c.estado === 'ACTIVO').length;
    const pendientes = total - activos;
    const montoTotal = purchases.reduce((sum, c) => sum + c.total, 0);
    return { total, activos, pendientes, montoTotal };
  }, [purchases]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: CompraSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail });
    } else if (mode === 'delete' && record) {
      setFormState({ ...record });
    } else {
      const firstProveedor = proveedores.find(p => p.estado)?.id ?? proveedores[0]?.id ?? 0;
      setFormState({ ...EMPTY_FORM, idProveedor: firstProveedor, fecha: new Date().toISOString() });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = async () => {
    try {
      if (dialogState.mode === 'create') {
        const payload: CompraInsertDto = {
          codigo: formState.codigo || '',
          idProveedor: Number(formState.idProveedor) || 0,
          fecha: formState.fecha || new Date().toISOString(),
          total: Number(formState.total) || 0,
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: CompraUpdateDto = {
          id: dialogState.record.id,
          codigo: formState.codigo || '',
          idProveedor: Number(formState.idProveedor) || 0,
          fecha: formState.fecha || dialogState.record.fecha,
          estado: formState.estado || 'PENDIENTE',
          total: Number(formState.total) || 0,
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
      key: 'codigo',
      header: 'Orden Compra',
      sortable: true,
      width: '130px',
      render: (row: CompraSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>
      ),
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      sortable: true,
      render: (row: CompraSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.proveedor}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>ID: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha Registro',
      sortable: true,
      width: '120px',
      render: (row: CompraSelectDto) => formatDate(row.fecha),
    },
    {
      key: 'total',
      header: 'Importe Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: CompraSelectDto) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: CompraSelectDto) => (
        <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: CompraSelectDto) => (
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
          <div className="erp-indicator-icon"><FiShoppingCart /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Órdenes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Órdenes Pagadas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientes}</span>
            <span className="erp-indicator-label">Por Despachar</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.montoTotal.toFixed(2)}</span>
            <span className="erp-indicator-label">Monto Invertido</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de orden o proveedor..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Orden Compra"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado de Compra</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos</option>
                <option value="ACTIVO">Aprobada / Pagada</option>
                <option value="PENDIENTE">Pendiente / Emitida</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando compras...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron compras registradas" />
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
          dialogState.mode === 'create' ? 'Crear Orden de Compra' :
          dialogState.mode === 'edit' ? 'Editar Orden' :
          dialogState.mode === 'view' ? 'Ver Detalles Orden' : 'Eliminar Registro'
        }
        size="md"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la orden <strong>{dialogState.record.codigo}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">Código Orden Compra</label>
              <input type="text" className="erp-input" value={formState.codigo || ''} onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Proveedor</label>
              <select
                className="erp-input"
                value={formState.idProveedor ?? 0}
                onChange={e => setFormState(prev => ({ ...prev, idProveedor: Number(e.target.value) }))}
                disabled={dialogState.mode === 'view'}
              >
                <option value={0}>Seleccionar proveedor</option>
                {proveedores.filter(p => p.estado).map(p => (
                  <option key={p.id} value={p.id}>{p.razonSocial}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Importe Negociado (S/)</label>
              <input type="number" step="0.01" className="erp-input" value={formState.total || 0} onChange={e => setFormState(prev => ({ ...prev, total: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {dialogState.mode === 'view' ? (
                  <div style={{ paddingTop: '6px' }}>
                    <StatusBadge status={formState.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />
                  </div>
                ) : (
                  <select className="erp-input" value={formState.estado || 'PENDIENTE'} onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}>
                    <option value="PENDIENTE">Emitida (Pendiente de pago / entrega)</option>
                    <option value="ACTIVO">Liquidada (Almacén abastecido)</option>
                  </select>
                )}
              </div>
            )}
            {(dialogState.mode === 'view' || dialogState.mode === 'edit') && formState.fecha && (
              <div className="erp-form-group">
                <label className="erp-form-label">Fecha Registro</label>
                <input type="text" className="erp-input" value={formatDate(formState.fecha)} disabled />
              </div>
            )}
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default ComprasSection;
