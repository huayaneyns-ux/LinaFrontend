import { useState, useCallback, useMemo } from 'react';
import { mockDevoluciones } from '../../../../Constantes/Data/MockData';
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
import { FiCornerUpLeft, FiCheckCircle, FiClock, FiActivity, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Devolucion {
  id: string;
  codigo: string;
  ventaCodigo: string;
  cliente: string;
  fecha: string;
  motivo: string;
  total: number;
  estado: string;
}

const DevolucionesSection = () => {
  const [returns, setReturns] = useState<Devolucion[]>(mockDevoluciones);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Devolucion>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Devolucion>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (dev: Devolucion) => {
      if (filters.estado && dev.estado !== filters.estado) return false;
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
  } = useDataTable<Devolucion>({
    data: returns,
    searchKeys: ['codigo', 'ventaCodigo', 'cliente', 'motivo'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = returns.length;
    const procesados = returns.filter(r => r.estado === 'ACTIVO').length;
    const pendientes = total - procesados;
    const montoReembolsado = returns.reduce((sum, r) => sum + r.total, 0);
    return { total, procesados, pendientes, montoReembolsado };
  }, [returns]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Devolucion) => {
    setFormState(record ? { ...record } : { id: 'D-' + (returns.length + 1).toString().padStart(3, '0'), codigo: 'DEV-' + (returns.length + 1).toString().padStart(3, '0'), ventaCodigo: 'VT-', cliente: '', fecha: new Date().toISOString(), motivo: '', total: 0, estado: 'PENDIENTE' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newDev: Devolucion = {
        id: formState.id || 'D-' + Date.now().toString().slice(-4),
        codigo: formState.codigo || 'DEV-' + Date.now().toString().slice(-3),
        ventaCodigo: formState.ventaCodigo || 'VT-001',
        cliente: formState.cliente || 'Cliente General',
        fecha: new Date().toISOString(),
        motivo: formState.motivo || '',
        total: Number(formState.total) || 0,
        estado: formState.estado || 'PENDIENTE',
      };
      setReturns(prev => [newDev, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      setReturns(prev =>
        prev.map(r =>
          r.id === dialogState.record!.id ? { ...r, ...formState } as Devolucion : r
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setReturns(prev => prev.filter(r => r.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Nota Devolución',
      sortable: true,
      width: '130px',
      render: (row: Devolucion) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>,
    },
    {
      key: 'ventaCodigo',
      header: 'Doc. Venta Ref.',
      sortable: true,
      width: '120px',
      render: (row: Devolucion) => <span style={{ fontWeight: 600 }}>{row.ventaCodigo}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: Devolucion) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cliente}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            Motivo: {row.motivo}
          </div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (row: Devolucion) => formatDate(row.fecha),
    },
    {
      key: 'total',
      header: 'Monto Devol.',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: Devolucion) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (row: Devolucion) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Devolucion) => (
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
          <div className="erp-indicator-icon"><FiCornerUpLeft /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Devoluciones</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.procesados}</span>
            <span className="erp-indicator-label">Aprobadas / Procesadas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientes}</span>
            <span className="erp-indicator-label">Pendiente Revisión</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.montoReembolsado.toFixed(2)}</span>
            <span className="erp-indicator-label">Monto Extornado</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de nota, documento venta o cliente..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Devolución"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado de Devolución</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ACTIVO">Aprobada</option>
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
          emptyMessage="No se encontraron devoluciones registradas"
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
          dialogState.mode === 'create' ? 'Registrar Devolución' :
          dialogState.mode === 'edit' ? 'Editar Devolución' :
          dialogState.mode === 'view' ? 'Ver Detalles Devolución' : 'Eliminar Registro'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código Nota Devolución</label>
            <input
              type="text"
              className="erp-input"
              value={formState.codigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Código Boleta/Factura Ref.</label>
            <input
              type="text"
              className="erp-input"
              value={formState.ventaCodigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, ventaCodigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: VT-001"
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
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Monto a Extornar (S/)</label>
            <input
              type="number"
              step="0.01"
              className="erp-input"
              value={formState.total || 0}
              onChange={e => setFormState(prev => ({ ...prev, total: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Motivo de Devolución</label>
            <input
              type="text"
              className="erp-input"
              value={formState.motivo || ''}
              onChange={e => setFormState(prev => ({ ...prev, motivo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Defecto de fábrica en repuestos"
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Estado</label>
            <select
              className="erp-input"
              value={formState.estado || 'PENDIENTE'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="PENDIENTE">Pendiente (En revisión)</option>
              <option value="ACTIVO">Aprobada (Extorno de caja)</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default DevolucionesSection;
