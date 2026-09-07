import { useState, useEffect, useMemo, useCallback } from 'react';
import { MovimientoService } from '../../../../Services/Admin/Inventario/Movimiento';
import type { MovimientoSelectDto } from '../../../../Types/Admin/Inventario/Movimiento';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate, formatDateTime } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ERPEmptySelection from '../../../../Components/ERP/ERPEmptySelection';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiActivity,
  FiEye,
  FiRepeat,
} from 'react-icons/fi';

/** 10 tipos de movimiento de inventario */
const TIPOS_MOVIMIENTO: Record<number, { label: string; color: string; bg: string; isInput: boolean }> = {
  1: { label: 'Entrada Compra', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isInput: true },
  2: { label: 'Venta', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isInput: false },
  3: { label: 'Devolución Cliente', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isInput: true },
  4: { label: 'Devolución Proveedor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isInput: false },
  5: { label: 'Merma', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isInput: false },
  6: { label: 'Ajuste Positivo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isInput: true },
  7: { label: 'Ajuste Negativo', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isInput: false },
  8: { label: 'Paquete Abierto', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', isInput: false },
  9: { label: 'Reserva', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', isInput: false },
  10: { label: 'Liberación Reserva', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', isInput: true },
};

export const MovementsSection = () => {
  const [movements, setMovements] = useState<MovimientoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [selectedMovement, setSelectedMovement] = useState<MovimientoSelectDto | null>(null);

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MovimientoService.getMovimientos(
        tipoFiltro ? { tipo: Number(tipoFiltro) } : undefined
      );
      setMovements(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial de movimientos');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [tipoFiltro]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

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
  } = useDataTable<MovimientoSelectDto>({
    data: movements,
    searchKeys: ['idMovimiento', 'producto', 'codigoProducto', 'codigoLote', 'usuario', 'motivo', 'tipoMovimiento'],
    defaultPageSize: 10,
  });

  const indicators = useMemo(() => {
    const total = movements.length;
    const ingresos = movements.filter(m => TIPOS_MOVIMIENTO[m.idTipoMovimiento]?.isInput).length;
    const salidas = total - ingresos;
    return { total, ingresos, salidas };
  }, [movements]);

  const handleSelectRow = (record: MovimientoSelectDto) => {
    setSelectedMovement(record);
    setActiveTab('form');
  };

  const renderTipoBadge = (tipoId: number, tipoNombre?: string) => {
    const config = TIPOS_MOVIMIENTO[tipoId] || {
      label: tipoNombre || `Tipo ${tipoId}`,
      color: '#6b7280',
      bg: '#f3f4f6',
      isInput: true,
    };
    const Icon = config.isInput ? FiArrowDownLeft : FiArrowUpRight;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: config.color,
          backgroundColor: config.bg,
          padding: '3px 8px',
          borderRadius: '0px',
          fontSize: '11px',
          fontWeight: 'bold',
          border: `1px solid ${config.color}`,
        }}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'idMovimiento',
      header: 'ID',
      sortable: true,
      width: '80px',
      render: (row: MovimientoSelectDto) => (
        <strong style={{ color: 'var(--erp-primary)' }}>#{row.idMovimiento}</strong>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      width: '150px',
      render: (row: MovimientoSelectDto) =>
        row.fecha?.includes('T') ? formatDateTime(row.fecha) : formatDate(row.fecha),
    },
    {
      key: 'idTipoMovimiento',
      header: 'Tipo',
      sortable: true,
      width: '180px',
      render: (row: MovimientoSelectDto) =>
        renderTipoBadge(row.idTipoMovimiento, row.tipoMovimiento),
    },
    {
      key: 'producto',
      header: 'Producto',
      sortable: true,
      render: (row: MovimientoSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.producto || '—'}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>
            {row.codigoProducto || '—'}
            {row.codigoLote ? ` · Lote: ${row.codigoLote}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      sortable: true,
      width: '130px',
      render: (row: MovimientoSelectDto) => row.usuario || '—',
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: MovimientoSelectDto) => {
        const config = TIPOS_MOVIMIENTO[row.idTipoMovimiento];
        const esIngreso = config ? config.isInput : true;
        return (
          <strong style={{ color: esIngreso ? '#10b981' : '#ef4444' }}>
            {esIngreso ? '+' : '-'}
            {row.cantidad}
          </strong>
        );
      },
    },
    {
      key: 'stockActual',
      header: 'Stock act.',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: MovimientoSelectDto) => `${row.stockActual ?? 0} und`,
    },
    {
      key: 'motivo',
      header: 'Motivo',
      sortable: true,
      render: (row: MovimientoSelectDto) =>
        row.motivo ? (
          <span style={{ fontSize: '12px', color: 'var(--erp-text-secondary)' }}>{row.motivo}</span>
        ) : (
          <span style={{ color: 'var(--erp-text-muted)' }}>—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: MovimientoSelectDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver Detalle"
            variant="primary"
            onClick={() => handleSelectRow(row)}
          />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            <span className="erp-indicator-value" style={{ color: '#10b981' }}>
              {indicators.ingresos}
            </span>
            <span className="erp-indicator-label">Entradas (+)</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiArrowUpRight /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value" style={{ color: '#ef4444' }}>
              {indicators.salidas}
            </span>
            <span className="erp-indicator-label">Salidas (-)</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por producto, lote, usuario o motivo..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={tipoFiltro ? 1 : 0}
        onResetFilters={tipoFiltro ? () => setTipoFiltro('') : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Tipo de Movimiento</label>
            <select
              className="erp-filter-select"
              value={tipoFiltro}
              onChange={e => setTipoFiltro(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS_MOVIMIENTO).map(([id, info]) => (
                <option key={id} value={id}>
                  {id}. {info.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--erp-danger-light)',
            color: 'var(--erp-danger)',
            borderRadius: '0px',
            fontSize: '13px',
            border: '1px solid var(--erp-danger)',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
          Cargando movimientos...
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={processedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            rowKey={row => row.idMovimiento}
            emptyMessage="No se encontraron movimientos"
            onRowClick={handleSelectRow}
          />
          <Pagination
            page={pagination.page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pagination.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );

  const formContent = (
    <div className="erp-form">
      {selectedMovement ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              Detalle de Movimiento #{selectedMovement.idMovimiento}
            </h3>

            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">ID Movimiento</label>
                  <input className="erp-input" readOnly value={`#${selectedMovement.idMovimiento}`} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha</label>
                  <input className="erp-input" readOnly value={selectedMovement.fecha ? formatDateTime(selectedMovement.fecha) : '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Tipo</label>
                  <div className="erp-form-status-value">
                    {renderTipoBadge(selectedMovement.idTipoMovimiento, selectedMovement.tipoMovimiento)}
                  </div>
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Usuario</label>
                  <input className="erp-input" readOnly value={selectedMovement.usuario || '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Producto</label>
                  <input className="erp-input" readOnly value={selectedMovement.producto || '—'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Cód. Producto</label>
                  <input className="erp-input" readOnly value={selectedMovement.codigoProducto || '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Lote</label>
                  <input className="erp-input" readOnly value={selectedMovement.codigoLote || 'N/A'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Cantidad</label>
                  <input className="erp-input" readOnly value={`${selectedMovement.cantidad} und`} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Stock Posterior</label>
                  <input className="erp-input" readOnly value={`${selectedMovement.stockActual ?? 0} und`} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Motivo / Observación</label>
                  <input className="erp-input" readOnly value={selectedMovement.motivo || 'Sin observaciones'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ERPEmptySelection
          icon={<FiRepeat />}
          title="Ningún movimiento seleccionado"
          description="Seleccione un registro en la pestaña Registros para auditar los detalles y motivos del movimiento."
          onBack={() => setActiveTab('list')}
          backLabel="Ir a Registros de Movimientos"
        />
      )}
    </div>
  );

  return (
    <SubmoduleTwoTabsLayout
      title="Kardex & Movimientos de Inventario"
      subtitle="Historial detallado de entradas, salidas, mermas y ajustes de inventario"
      entityName="Movimiento"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode="view"
      listContent={listContent}
      formContent={formContent}
    />
  );
};

export default MovementsSection;
