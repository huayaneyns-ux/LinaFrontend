import { useState, useCallback, useMemo } from 'react';
import { mockVentas } from '../../../../Constantes/Data/MockData';
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
import { FiDollarSign, FiCheckCircle, FiClock, FiActivity, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Venta {
  id: string;
  codigo: string;
  cliente: string;
  fecha: string;
  metodoPago: string;
  total: number;
  estado: string;
}

const VentasSection = () => {
  const [sales, setSales] = useState<Venta[]>(mockVentas);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Venta>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Venta>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (sale: Venta) => {
      if (filters.estado && sale.estado !== filters.estado) return false;
      if (filters.metodoPago && sale.metodoPago !== filters.metodoPago) return false;
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
  } = useDataTable<Venta>({
    data: sales,
    searchKeys: ['codigo', 'cliente'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const totalMonto = sales.reduce((sum, s) => sum + s.total, 0);
    const activosCount = sales.filter(s => s.estado === 'ACTIVO').length;
    const pendientesCount = sales.filter(s => s.estado === 'PENDIENTE').length;
    const totalCount = sales.length;
    return { totalMonto, activosCount, pendientesCount, totalCount };
  }, [sales]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Venta) => {
    setFormState(record ? { ...record } : { id: 'V-' + (sales.length + 1001), codigo: 'VT-' + (sales.length + 1).toString().padStart(3, '0'), cliente: '', fecha: new Date().toISOString(), metodoPago: 'EFECTIVO', total: 0, estado: 'ACTIVO' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newSale: Venta = {
        id: formState.id || 'V-' + Date.now().toString().slice(-4),
        codigo: formState.codigo || 'VT-' + Date.now().toString().slice(-3),
        cliente: formState.cliente || 'Consumidor Final',
        fecha: new Date().toISOString(),
        metodoPago: formState.metodoPago || 'EFECTIVO',
        total: Number(formState.total) || 0,
        estado: formState.estado || 'ACTIVO',
      };
      setSales(prev => [newSale, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setSales(prev =>
        prev.map(s =>
          s.id === dialogState.record!.id ? { ...s, ...formState } as Venta : s
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setSales(prev => prev.filter(s => s.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Boleta / Factura',
      sortable: true,
      width: '130px',
      render: (row: Venta) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: Venta) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cliente}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>ID Transacción: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (row: Venta) => formatDate(row.fecha),
    },
    {
      key: 'metodoPago',
      header: 'Forma de Pago',
      sortable: true,
      width: '140px',
      render: (row: Venta) => {
        const met = row.metodoPago.toUpperCase();
        let color = '#475569';
        let bg = '#f1f5f9';
        if (met === 'YAPE' || met === 'PLIN') { color = '#7c3aed'; bg = 'rgba(124, 58, 237, 0.08)'; }
        else if (met === 'VISA' || met === 'MASTERCARD') { color = '#2563eb'; bg = 'rgba(37, 99, 235, 0.08)'; }
        else if (met === 'EFECTIVO') { color = '#16a34a'; bg = 'rgba(22, 163, 74, 0.08)'; }

        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            color,
            backgroundColor: bg
          }}>
            {row.metodoPago}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: 'Monto Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: Venta) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: Venta) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Venta) => (
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
          <div className="erp-indicator-icon"><FiDollarSign /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.totalMonto.toFixed(2)}</span>
            <span className="erp-indicator-label">Monto Liquidado</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activosCount}</span>
            <span className="erp-indicator-label">Ventas Cobradas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientesCount}</span>
            <span className="erp-indicator-label">Ventas Pendientes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.totalCount}</span>
            <span className="erp-indicator-label">Total Transacciones</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de venta o cliente..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Venta"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Forma de Pago</label>
              <select
                className="erp-input"
                value={filters.metodoPago || ''}
                onChange={e => setFilter('metodoPago', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ACTIVO">Liquidada</option>
                <option value="PENDIENTE">Pendiente</option>
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
          emptyMessage="No se encontraron ventas registradas"
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
          dialogState.mode === 'create' ? 'Agregar Venta' :
          dialogState.mode === 'edit' ? 'Editar Venta' :
          dialogState.mode === 'view' ? 'Detalle de Comprobante' : 'Eliminar Venta'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código de Venta</label>
            <input
              type="text"
              className="erp-input"
              value={formState.codigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Cliente</label>
            <input
              type="text"
              className="erp-input"
              value={formState.cliente || ''}
              onChange={e => setFormState(prev => ({ ...prev, cliente: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Monto de Transacción (S/)</label>
            <input
              type="number"
              step="0.01"
              className="erp-input"
              value={formState.total || 0}
              onChange={e => setFormState(prev => ({ ...prev, total: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Método de Pago</label>
            <select
              className="erp-input"
              value={formState.metodoPago || 'EFECTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, metodoPago: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="VISA">Visa</option>
              <option value="MASTERCARD">Mastercard</option>
            </select>
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Estado de Transacción</label>
            <select
              className="erp-input"
              value={formState.estado || 'ACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ACTIVO">Liquidado (Pagado)</option>
              <option value="PENDIENTE">Pendiente de Liquidación</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default VentasSection;
