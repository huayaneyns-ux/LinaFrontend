import { useState, useCallback, useMemo } from 'react';
import { mockPedidos } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import type { Pedido } from '../../../../Types/Pedido';
import { FiFileText, FiCheckCircle, FiClock, FiActivity, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PedidosSection = () => {
  const [orders, setOrders] = useState<Pedido[]>(mockPedidos);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Pedido>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Pedido>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (order: Pedido) => {
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
  } = useDataTable<Pedido>({
    data: orders,
    searchKeys: ['codigo'],
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

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Pedido) => {
    setFormState(record ? { ...record } : { id: 'ped-' + (orders.length + 1), codigo: 'PED-' + (orders.length + 1001), fecha: new Date().toISOString(), estado: 'PENDIENTE_PAGO', tipoEntrega: 'RECOJO_TIENDA', subtotal: 0, igv: 0, total: 0, pagoPendiente: 0 });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newOrder: Pedido = {
        id: formState.id || 'ped-' + Date.now().toString().slice(-4),
        codigo: formState.codigo || 'PED-' + Date.now().toString().slice(-3),
        clienteId: 'c1',
        fecha: new Date().toISOString(),
        estado: formState.estado || 'PENDIENTE_PAGO',
        tipoEntrega: formState.tipoEntrega || 'RECOJO_TIENDA',
        detalles: [],
        subtotal: Number(formState.subtotal) || 0,
        igv: Number(formState.igv) || 0,
        total: Number(formState.total) || 0,
        pagoPendiente: Number(formState.pagoPendiente) || 0,
      };
      setOrders(prev => [newOrder, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setOrders(prev =>
        prev.map(o =>
          o.id === dialogState.record!.id ? { ...o, ...formState } as Pedido : o
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setOrders(prev => prev.filter(o => o.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const getBadgeStatus = (status: Pedido['estado']) => {
    if (status === 'ENTREGADO') return 'ACTIVO';
    if (status === 'CANCELADO') return 'INACTIVO';
    if (status === 'PENDIENTE_PAGO') return 'PENDIENTE';
    return 'SUSPENDIDO'; // EN_PROCESO, ENVIADO, PAGADO
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Pedido ID',
      sortable: true,
      width: '120px',
      render: (row: Pedido) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>,
    },
    {
      key: 'fecha',
      header: 'Fecha de Registro',
      sortable: true,
      width: '140px',
      render: (row: Pedido) => formatDate(row.fecha),
    },
    {
      key: 'tipoEntrega',
      header: 'Método Entrega',
      sortable: true,
      render: (row: Pedido) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.tipoEntrega === 'RECOJO_TIENDA' ? 'Recojo en Tienda' : 'Envío a Domicilio'}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Pago Pendiente: S/ {(row.pagoPendiente || 0).toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Cobrado',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: Pedido) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado de Pedido',
      sortable: true,
      width: '140px',
      render: (row: Pedido) => {
        const mappedStatus = getBadgeStatus(row.estado);
        return <StatusBadge status={mappedStatus} showDot />;
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Pedido) => (
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

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de pedido..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Pedido"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado de Pedido</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
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
              <select
                className="erp-input"
                value={filters.tipoEntrega || ''}
                onChange={e => setFilter('tipoEntrega', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
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
          emptyMessage="No se encontraron pedidos registrados"
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
          dialogState.mode === 'create' ? 'Crear Pedido' :
          dialogState.mode === 'edit' ? 'Editar Pedido' :
          dialogState.mode === 'view' ? 'Ver Detalles de Pedido' : 'Eliminar Pedido'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código de Pedido</label>
            <input
              type="text"
              className="erp-input"
              value={formState.codigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Tipo de Entrega</label>
            <select
              className="erp-input"
              value={formState.tipoEntrega || 'RECOJO_TIENDA'}
              onChange={e => setFormState(prev => ({ ...prev, tipoEntrega: e.target.value as Pedido['tipoEntrega'] }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="RECOJO_TIENDA">Recojo en Tienda</option>
              <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Subtotal (S/)</label>
            <input
              type="number"
              className="erp-input"
              value={formState.subtotal || 0}
              onChange={e => setFormState(prev => ({ ...prev, subtotal: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">IGV (18%)</label>
            <input
              type="number"
              className="erp-input"
              value={formState.igv || 0}
              onChange={e => setFormState(prev => ({ ...prev, igv: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Total Neto (S/)</label>
            <input
              type="number"
              className="erp-input"
              value={formState.total || 0}
              onChange={e => setFormState(prev => ({ ...prev, total: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Pago Pendiente (S/)</label>
            <input
              type="number"
              className="erp-input"
              value={formState.pagoPendiente || 0}
              onChange={e => setFormState(prev => ({ ...prev, pagoPendiente: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Estado de Despacho</label>
            <select
              className="erp-input"
              value={formState.estado || 'PENDIENTE_PAGO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value as Pedido['estado'] }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
              <option value="PAGADO">Pagado</option>
              <option value="EN_PROCESO">En Proceso (Almacén)</option>
              <option value="ENVIADO">Enviado (Ruta)</option>
              <option value="ENTREGADO">Entregado al Cliente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default PedidosSection;
