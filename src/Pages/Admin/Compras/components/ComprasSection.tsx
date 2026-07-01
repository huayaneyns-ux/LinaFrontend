import { useState, useCallback, useMemo } from 'react';
import { mockCompras, mockProveedores } from '../../../../Constantes/Data/MockData';
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
import { FiShoppingCart, FiCheckCircle, FiClock, FiActivity, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Compra {
  id: string;
  codigo: string;
  proveedor: string;
  fecha: string;
  estado: string;
  total: number;
}

const ComprasSection = () => {
  const [purchases, setPurchases] = useState<Compra[]>(mockCompras);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Compra>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Compra>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (purchase: Compra) => {
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
  } = useDataTable<Compra>({
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

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Compra) => {
    setFormState(record ? { ...record } : { id: 'C-' + (purchases.length + 1004), codigo: 'COM-' + (purchases.length + 1).toString().padStart(3, '0'), proveedor: mockProveedores[0]?.razonSocial || '', fecha: new Date().toISOString(), estado: 'PENDIENTE', total: 0 });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newCompra: Compra = {
        id: formState.id || 'C-' + Date.now().toString().slice(-4),
        codigo: formState.codigo || 'COM-' + Date.now().toString().slice(-3),
        proveedor: formState.proveedor || 'Proveedor General',
        fecha: new Date().toISOString(),
        estado: formState.estado || 'PENDIENTE',
        total: Number(formState.total) || 0,
      };
      setPurchases(prev => [newCompra, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setPurchases(prev =>
        prev.map(c =>
          c.id === dialogState.record!.id ? { ...c, ...formState } as Compra : c
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setPurchases(prev => prev.filter(c => c.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Orden Compra',
      sortable: true,
      width: '130px',
      render: (row: Compra) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>,
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      sortable: true,
      render: (row: Compra) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.proveedor}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>ID Interno: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha Registro',
      sortable: true,
      width: '120px',
      render: (row: Compra) => formatDate(row.fecha),
    },
    {
      key: 'total',
      header: 'Importe Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: Compra) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Compra) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Compra) => (
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

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de orden o proveedor..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Orden Compra"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado de Compra</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ACTIVO">Aprobada / Pagada</option>
                <option value="PENDIENTE">Pendiente / Emitida</option>
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
          emptyMessage="No se encontraron compras registradas"
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
          dialogState.mode === 'create' ? 'Crear Orden de Compra' :
          dialogState.mode === 'edit' ? 'Editar Orden' :
          dialogState.mode === 'view' ? 'Ver Detalles Orden' : 'Eliminar Registro'
        }
        size="md"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código Orden Compra</label>
            <input
              type="text"
              className="erp-input"
              value={formState.codigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Proveedor</label>
            <select
              className="erp-input"
              value={formState.proveedor || ''}
              onChange={e => setFormState(prev => ({ ...prev, proveedor: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              {mockProveedores.map(p => (
                <option key={p.id} value={p.razonSocial}>{p.razonSocial}</option>
              ))}
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Importe Negociado (S/)</label>
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
            <label className="erp-form-label">Estado</label>
            <select
              className="erp-input"
              value={formState.estado || 'PENDIENTE'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="PENDIENTE">Emitida (Pendiente de pago / entrega)</option>
              <option value="ACTIVO">Liquidada (Almacén abastecido)</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default ComprasSection;
