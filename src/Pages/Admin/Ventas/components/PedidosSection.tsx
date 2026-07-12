import { useState, useCallback, useMemo } from 'react';

import { PedidoService } from '../../../../Services/Admin/Ventas/Pedido';
import type {
  PedidoSelectDto,
  PedidoInsertDto,
  PedidoUpdateDto,
} from '../../../../Types/Admin/Ventas/Pedido';

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
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiEye,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';

interface PedidoFilters {
  estado: string;
  tipoEntrega: string;
}

const DEFAULT_FILTERS: PedidoFilters = { estado: '', tipoEntrega: '' };

const EMPTY_FORM: Partial<PedidoSelectDto> = {
  codigo: '',
  clienteId: '',
  tipoEntrega: 'RECOJO_TIENDA',
  estado: 'PENDIENTE_PAGO',
  subtotal: 0,
  igv: 0,
  total: 0,
  pagoPendiente: 0,
};

const pedidoCrudService = {
  getAll: () => PedidoService.getPedidos(),
  getById: (id: number) => PedidoService.getPedidoById(id),
  create: (data: PedidoInsertDto) => PedidoService.createPedido(data),
  update: (data: PedidoUpdateDto) => PedidoService.updatePedido(data),
  delete: (id: number) => PedidoService.deletePedido(id),
};

const getBadgeStatus = (status: string) => {
  if (status === 'ENTREGADO') return 'ACTIVO';
  if (status === 'CANCELADO') return 'INACTIVO';
  if (status === 'PENDIENTE_PAGO') return 'PENDIENTE';
  return 'SUSPENDIDO';
};

const PedidosSection = () => {
  const { items: orders, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<PedidoSelectDto, PedidoInsertDto, PedidoUpdateDto>(pedidoCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<PedidoSelectDto>();

  const [filters, setFilters] = useState<PedidoFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [formState, setFormState] = useState<Partial<PedidoSelectDto>>(EMPTY_FORM);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (order: PedidoSelectDto) => {
      if (filters.estado && order.estado !== filters.estado) return false;
      if (filters.tipoEntrega && order.tipoEntrega !== filters.tipoEntrega) return false;
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
  } = useDataTable<PedidoSelectDto>({
    data: orders,
    searchKeys: ['codigo', 'cliente'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = orders.length;
    const entregados = orders.filter(o => o.estado === 'ENTREGADO').length;
    const pendientes = orders.filter(o => o.estado !== 'ENTREGADO' && o.estado !== 'CANCELADO').length;
    const montoTotal = orders.reduce((sum, o) => sum + o.total, 0);
    return { total, entregados, pendientes, montoTotal };
  }, [orders]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: PedidoSelectDto) => {
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
        const payload: PedidoInsertDto = {
          codigo: formState.codigo || '',
          clienteId: formState.clienteId || '',
          tipoEntrega: formState.tipoEntrega || 'RECOJO_TIENDA',
          subtotal: Number(formState.subtotal) || 0,
          igv: Number(formState.igv) || 0,
          total: Number(formState.total) || 0,
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: PedidoUpdateDto = {
          id: dialogState.record.id,
          codigo: formState.codigo || '',
          clienteId: formState.clienteId || '',
          estado: formState.estado || 'PENDIENTE_PAGO',
          tipoEntrega: formState.tipoEntrega || 'RECOJO_TIENDA',
          subtotal: Number(formState.subtotal) || 0,
          igv: Number(formState.igv) || 0,
          total: Number(formState.total) || 0,
          pagoPendiente: Number(formState.pagoPendiente) || 0,
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
      header: 'Pedido ID',
      sortable: true,
      width: '120px',
      render: (row: PedidoSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha de Registro',
      sortable: true,
      width: '140px',
      render: (row: PedidoSelectDto) => formatDate(row.fecha),
    },
    {
      key: 'tipoEntrega',
      header: 'Método Entrega',
      sortable: true,
      render: (row: PedidoSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {row.tipoEntrega === 'RECOJO_TIENDA' ? 'Recojo en Tienda' : 'Envío a Domicilio'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>
            Pago Pendiente: S/ {(row.pagoPendiente || 0).toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Cobrado',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: PedidoSelectDto) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado de Pedido',
      sortable: true,
      width: '140px',
      render: (row: PedidoSelectDto) => (
        <StatusBadge status={getBadgeStatus(row.estado)} showDot />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: PedidoSelectDto) => (
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
          <div className="erp-indicator-icon"><FiFileText /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Pedidos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.entregados}</span>
            <span className="erp-indicator-label">Pedidos Entregados</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientes}</span>
            <span className="erp-indicator-label">En Curso / Pendiente</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.montoTotal.toFixed(2)}</span>
            <span className="erp-indicator-label">Monto de Pedidos</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de pedido..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Pedido"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado de Pedido</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos los estados</option>
                <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
                <option value="PAGADO">Pagado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Tipo de Entrega</label>
              <select className="erp-input" value={filters.tipoEntrega} onChange={e => setFilters(prev => ({ ...prev, tipoEntrega: e.target.value }))}>
                <option value="">Todos los tipos</option>
                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando pedidos...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron pedidos registrados" />
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
          dialogState.mode === 'create' ? 'Crear Pedido' :
          dialogState.mode === 'edit' ? 'Editar Pedido' :
          dialogState.mode === 'view' ? 'Ver Detalles de Pedido' : 'Eliminar Pedido'
        }
        size="lg"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar el pedido <strong>{dialogState.record.codigo}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            <div className="erp-form-group">
              <label className="erp-form-label">Código de Pedido</label>
              <input type="text" className="erp-input" value={formState.codigo || ''} onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">ID Cliente</label>
              <input type="text" className="erp-input" value={formState.clienteId || ''} onChange={e => setFormState(prev => ({ ...prev, clienteId: e.target.value }))} disabled={dialogState.mode === 'view'} placeholder="Ej: c1" />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Tipo de Entrega</label>
              <select className="erp-input" value={formState.tipoEntrega || 'RECOJO_TIENDA'} onChange={e => setFormState(prev => ({ ...prev, tipoEntrega: e.target.value }))} disabled={dialogState.mode === 'view'}>
                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Subtotal (S/)</label>
              <input type="number" className="erp-input" value={formState.subtotal || 0} onChange={e => setFormState(prev => ({ ...prev, subtotal: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">IGV (18%)</label>
              <input type="number" className="erp-input" value={formState.igv || 0} onChange={e => setFormState(prev => ({ ...prev, igv: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Total Neto (S/)</label>
              <input type="number" className="erp-input" value={formState.total || 0} onChange={e => setFormState(prev => ({ ...prev, total: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <>
                <div className="erp-form-group">
                  <label className="erp-form-label">Pago Pendiente (S/)</label>
                  <input type="number" className="erp-input" value={formState.pagoPendiente || 0} onChange={e => setFormState(prev => ({ ...prev, pagoPendiente: Number(e.target.value) }))} disabled={dialogState.mode === 'view'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado de Despacho</label>
                  {dialogState.mode === 'view' ? (
                    <div style={{ paddingTop: '6px' }}>
                      <StatusBadge status={getBadgeStatus(formState.estado || '')} showDot />
                    </div>
                  ) : (
                    <select className="erp-input" value={formState.estado || 'PENDIENTE_PAGO'} onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}>
                      <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
                      <option value="PAGADO">Pagado</option>
                      <option value="EN_PROCESO">En Proceso (Almacén)</option>
                      <option value="ENVIADO">Enviado (Ruta)</option>
                      <option value="ENTREGADO">Entregado al Cliente</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default PedidosSection;
