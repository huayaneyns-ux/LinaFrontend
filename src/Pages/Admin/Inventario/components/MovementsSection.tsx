import { useState, useCallback, useMemo } from 'react';
import { mockMovimientos, mockProductos } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import { formatDateTime } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiActivity, FiArrowUpRight, FiArrowDownLeft, FiEye, FiPlus } from 'react-icons/fi';

interface Movimiento {
  id: string;
  tipo: string; // INGRESO or SALIDA
  productoNombre: string;
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

const MovementsSection = () => {
  const [movements, setMovements] = useState<Movimiento[]>(mockMovimientos);
  const { dialogState, openCreate, openView, closeDialog } = useDialog<Movimiento>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  const [formState, setFormState] = useState<Partial<Movimiento>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (mov: Movimiento) => {
      if (filters.tipo && mov.tipo !== filters.tipo) return false;
      if (filters.usuario && !mov.usuario.toLowerCase().includes(filters.usuario.toLowerCase())) return false;
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
  } = useDataTable<Movimiento>({
    data: movements,
    searchKeys: ['id', 'productoNombre', 'motivo', 'usuario'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = movements.length;
    const ingresos = movements.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.cantidad, 0);
    const salidas = movements.filter(m => m.tipo === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0);
    return { total, ingresos, salidas };
  }, [movements]);

  const handleOpenDialog = (mode: 'create' | 'view', record?: Movimiento) => {
    setFormState(record ? { ...record } : { id: 'M-' + (movements.length + 1).toString().padStart(3, '0'), tipo: 'INGRESO', productoNombre: mockProductos[0]?.nombre || '', cantidad: 10, motivo: 'Reabastecimiento local', fecha: new Date().toISOString(), usuario: 'Carlos Mendoza' });
    if (mode === 'create') openCreate();
    else openView(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const newMov: Movimiento = {
        id: formState.id || 'M-' + Date.now().toString().slice(-4),
        tipo: formState.tipo || 'INGRESO',
        productoNombre: formState.productoNombre || '',
        cantidad: Number(formState.cantidad) || 0,
        motivo: formState.motivo || '',
        fecha: new Date().toISOString(),
        usuario: formState.usuario || 'Usuario Central',
      };
      setMovements(prev => [newMov, ...prev]);
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'id',
      header: 'Kardex ID',
      sortable: true,
      width: '100px',
      render: (row: Movimiento) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.id}</strong>,
    },
    {
      key: 'tipo',
      header: 'Operación',
      sortable: true,
      width: '120px',
      render: (row: Movimiento) => {
        const isIngreso = row.tipo === 'INGRESO';
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: isIngreso ? 'var(--erp-success-light)' : 'rgba(239, 68, 68, 0.08)',
            color: isIngreso ? 'var(--erp-success)' : '#ef4444'
          }}>
            {isIngreso ? <FiArrowDownLeft /> : <FiArrowUpRight />}
            {row.tipo}
          </span>
        );
      },
    },
    {
      key: 'productoNombre',
      header: 'Producto / Ítem',
      sortable: true,
      render: (row: Movimiento) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productoNombre}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{row.motivo}</div>
        </div>
      ),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: Movimiento) => (
        <span style={{ fontWeight: 700, color: row.tipo === 'INGRESO' ? 'var(--erp-success)' : '#ef4444' }}>
          {row.tipo === 'INGRESO' ? '+' : '-'}{row.cantidad}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha y Hora',
      sortable: true,
      width: '160px',
      render: (row: Movimiento) => formatDateTime(row.fecha),
    },
    {
      key: 'usuario',
      header: 'Registrado por',
      sortable: true,
      width: '140px',
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '60px',
      render: (row: Movimiento) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton icon={<FiEye />} tooltip="Ver detalles" variant="primary" onClick={() => handleOpenDialog('view', row)} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
      {/* Indicators */}
      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Movimientos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiArrowDownLeft /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">+{indicators.ingresos} und</span>
            <span className="erp-indicator-label">Ingresos Registrados</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiArrowUpRight /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">-{indicators.salidas} und</span>
            <span className="erp-indicator-label">Salidas Registradas</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por kardex ID, producto o motivo..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Registrar Movimiento"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Tipo de Movimiento</label>
              <select
                className="erp-input"
                value={filters.tipo || ''}
                onChange={e => setFilter('tipo', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="INGRESO">Ingresos (Ingreso físico)</option>
                <option value="SALIDA">Salidas (Despacho / Consumo)</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Usuario</label>
              <input
                type="text"
                className="erp-input"
                placeholder="Nombre de usuario..."
                value={filters.usuario || ''}
                onChange={e => setFilter('usuario', e.target.value)}
              />
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
          emptyMessage="No se encontraron movimientos en la bitácora"
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
        title={dialogState.mode === 'create' ? 'Registrar Transacción Física' : 'Detalles de Transacción'}
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Tipo de Transacción</label>
            <select
              className="erp-input"
              value={formState.tipo || 'INGRESO'}
              onChange={e => setFormState(prev => ({ ...prev, tipo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="INGRESO">INGRESO (Sumar al stock)</option>
              <option value="SALIDA">SALIDA (Restar del stock)</option>
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Producto</label>
            {dialogState.mode === 'create' ? (
              <select
                className="erp-input"
                value={formState.productoNombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, productoNombre: e.target.value }))}
              >
                {mockProductos.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            ) : (
              <input type="text" className="erp-input" value={formState.productoNombre || ''} disabled />
            )}
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Cantidad</label>
            <input
              type="number"
              className="erp-input"
              value={formState.cantidad || 0}
              onChange={e => setFormState(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Responsable</label>
            <input
              type="text"
              className="erp-input"
              value={formState.usuario || ''}
              onChange={e => setFormState(prev => ({ ...prev, usuario: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Motivo o Justificación</label>
            <input
              type="text"
              className="erp-input"
              value={formState.motivo || ''}
              onChange={e => setFormState(prev => ({ ...prev, motivo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Inventario cíclico trimestral"
            />
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default MovementsSection;
