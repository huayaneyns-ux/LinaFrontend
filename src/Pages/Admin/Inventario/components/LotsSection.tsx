import { useState, useCallback, useMemo } from 'react';
import { mockLotes, mockProductos } from '../../../../Constantes/Data/MockData';
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
import { FiLayers, FiAlertCircle, FiCheckSquare, FiCalendar, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Lote {
  id: string;
  productoId: number;
  productoNombre: string;
  cantidadInicial: number;
  cantidadActual: number;
  fechaIngreso: string;
  fechaVencimiento: string;
  estado: string;
}

const LotsSection = () => {
  const [lots, setLots] = useState<Lote[]>(mockLotes);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Lote>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Lote>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (lote: Lote) => {
      if (filters.estado && lote.estado !== filters.estado) return false;
      if (filters.producto && !lote.productoNombre.toLowerCase().includes(filters.producto.toLowerCase())) return false;
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
  } = useDataTable<Lote>({
    data: lots,
    searchKeys: ['id', 'productoNombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = lots.length;
    const stockTotal = lots.reduce((sum, l) => sum + l.cantidadActual, 0);
    const lotesActivos = lots.filter(l => l.estado === 'ACTIVO').length;
    // Calculate lots close to expiry or expired
    const proximosVencer = lots.filter(l => {
      if (!l.fechaVencimiento) return false;
      const days = (new Date(l.fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 90;
    }).length;
    return { total, stockTotal, lotesActivos, proximosVencer };
  }, [lots]);

  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Lote) => {
    setFormState(record ? { ...record } : { id: 'L-' + (lots.length + 1).toString().padStart(3, '0'), productoId: 1, cantidadInicial: 100, cantidadActual: 100, fechaIngreso: new Date().toISOString(), fechaVencimiento: '', estado: 'ACTIVO' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const selectedProd = mockProductos.find(p => p.id === Number(formState.productoId));
      const newLote: Lote = {
        id: formState.id || 'L-' + Date.now().toString().slice(-4),
        productoId: Number(formState.productoId) || 1,
        productoNombre: selectedProd?.nombre || 'Producto Desconocido',
        cantidadInicial: Number(formState.cantidadInicial) || 100,
        cantidadActual: Number(formState.cantidadActual) || 100,
        fechaIngreso: formState.fechaIngreso || new Date().toISOString(),
        fechaVencimiento: formState.fechaVencimiento || '',
        estado: formState.estado || 'ACTIVO',
      };
      setLots(prev => [newLote, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      const selectedProd = mockProductos.find(p => p.id === Number(formState.productoId));
      setLots(prev =>
        prev.map(l =>
          l.id === dialogState.record!.id
            ? { ...l, ...formState, productoNombre: selectedProd?.nombre || l.productoNombre } as Lote
            : l
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setLots(prev => prev.filter(l => l.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'Lote ID',
      sortable: true,
      width: '100px',
      render: (row: Lote) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.id}</strong>,
    },
    {
      key: 'productoNombre',
      header: 'Producto',
      sortable: true,
      render: (row: Lote) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productoNombre}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>ID Prod: #{row.productoId}</div>
        </div>
      ),
    },
    {
      key: 'cantidadActual',
      header: 'Cant. Actual',
      sortable: true,
      align: 'center' as const,
      width: '120px',
      render: (row: Lote) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cantidadActual}</div>
          <div style={{ fontSize: '10px', color: 'var(--erp-text-muted)' }}>Inicial: {row.cantidadInicial}</div>
        </div>
      ),
    },
    {
      key: 'fechaIngreso',
      header: 'Ingreso',
      sortable: true,
      width: '110px',
      render: (row: Lote) => formatDate(row.fechaIngreso),
    },
    {
      key: 'fechaVencimiento',
      header: 'Vencimiento',
      sortable: true,
      width: '110px',
      render: (row: Lote) => row.fechaVencimiento ? formatDate(row.fechaVencimiento) : <span style={{ color: 'var(--erp-text-muted)' }}>—</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: Lote) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Lote) => (
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
          <div className="erp-indicator-icon"><FiLayers /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Lotes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckSquare /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.stockTotal} und</span>
            <span className="erp-indicator-label">Stock en Lotes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiCalendar /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.proximosVencer}</span>
            <span className="erp-indicator-label">Próximos a vencer</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiAlertCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.lotesActivos}</span>
            <span className="erp-indicator-label">Lotes Activos</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por Lote ID o producto..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Lote"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Producto (Filtro rápido)</label>
              <input
                type="text"
                className="erp-input"
                placeholder="Nombre del producto..."
                value={filters.producto || ''}
                onChange={e => setFilter('producto', e.target.value)}
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
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
          emptyMessage="No se encontraron lotes registrados"
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
          dialogState.mode === 'create' ? 'Registrar Lote' :
          dialogState.mode === 'edit' ? 'Editar Lote' :
          dialogState.mode === 'view' ? 'Detalle de Lote' : 'Eliminar Lote'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código del Lote</label>
            <input
              type="text"
              className="erp-input"
              value={formState.id || ''}
              onChange={e => setFormState(prev => ({ ...prev, id: e.target.value }))}
              disabled={dialogState.mode !== 'create'}
              placeholder="Ej: L-100"
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Producto Asignado</label>
            <select
              className="erp-input"
              value={formState.productoId || 1}
              onChange={e => setFormState(prev => ({ ...prev, productoId: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            >
              {mockProductos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
              ))}
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Cantidad Inicial</label>
            <input
              type="number"
              className="erp-input"
              value={formState.cantidadInicial || 0}
              onChange={e => setFormState(prev => ({ ...prev, cantidadInicial: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Cantidad Actual</label>
            <input
              type="number"
              className="erp-input"
              value={formState.cantidadActual || 0}
              onChange={e => setFormState(prev => ({ ...prev, cantidadActual: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Fecha de Ingreso</label>
            <input
              type="date"
              className="erp-input"
              value={formState.fechaIngreso ? formState.fechaIngreso.slice(0, 10) : ''}
              onChange={e => setFormState(prev => ({ ...prev, fechaIngreso: new Date(e.target.value).toISOString() }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Fecha de Vencimiento (Opcional)</label>
            <input
              type="date"
              className="erp-input"
              value={formState.fechaVencimiento ? formState.fechaVencimiento.slice(0, 10) : ''}
              onChange={e => setFormState(prev => ({ ...prev, fechaVencimiento: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Estado de lote</label>
            <select
              className="erp-input"
              value={formState.estado || 'ACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ACTIVO">Activo (Disponible)</option>
              <option value="INACTIVO">Inactivo (Retirado / Agotado)</option>
            </select>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default LotsSection;
