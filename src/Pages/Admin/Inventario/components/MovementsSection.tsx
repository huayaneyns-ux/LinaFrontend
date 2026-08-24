import { useState, useEffect, useMemo, useCallback } from 'react';
import { MovimientoService } from '../../../../Services/Admin/Inventario/Movimiento';
import type { MovimientoSelectDto } from '../../../../Types/Admin/Inventario/Movimiento';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate, formatDateTime } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import {
  FiArrowUpRight,
  FiArrowDownLeft,
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

const MovementsSection = () => {
  const [movements, setMovements] = useState<MovimientoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [showFilters, setShowFilters] = useState(true);

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
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
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
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {error && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--erp-danger-light)',
            color: 'var(--erp-danger)',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total movimientos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-info">
            <span className="erp-indicator-value" style={{ color: '#10b981' }}>
              {indicators.ingresos}
            </span>
            <span className="erp-indicator-label">Entradas (+)</span>
          </div>
        </div>
        <div className="erp-indicator-card">
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
        filterPanel={
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              width: '100%',
            }}
          >
            <div className="erp-form-group" style={{ margin: 0 }}>
              <label className="erp-form-label">Tipo de movimiento</label>
              <select
                className="erp-input"
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
          </div>
        }
      />

      <div
        className="erp-table-card"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
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
    </div>
  );
};

export default MovementsSection;
