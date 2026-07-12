import { useState, useEffect, useMemo, useCallback } from 'react';
import { VentaRealizadaService } from '../../../../Services/Admin/Ventas/Venta';
import type {
  VentaRealizadaSelectDto,
  VentaRealizadaDetalleDto,
  VentaRealizadaPagoDto,
} from '../../../../Types/Admin/Ventas/Venta';
import { formatDate } from '../../../../Utils/formatters';
import { useDataTable } from '../../../../Hooks/useDataTable';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import {
  FiDollarSign,
  FiChevronDown,
  FiChevronRight,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
} from 'react-icons/fi';
import './VentasSection.css';

interface VentaFilters {
  estado: string;
}

const DEFAULT_FILTERS: VentaFilters = { estado: '' };

const fmt = (n?: number) => `S/ ${(n ?? 0).toFixed(2)}`;

const VentasSection = () => {
  const [sales, setSales] = useState<VentaRealizadaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [filters, setFilters] = useState<VentaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [rowDetailsMap, setRowDetailsMap] = useState<Record<number, VentaRealizadaDetalleDto[]>>({});
  const [rowPaymentsMap, setRowPaymentsMap] = useState<Record<number, VentaRealizadaPagoDto[]>>({});

  const loadSalesList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VentaRealizadaService.getVentas();
      setSales(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesList();
  }, [loadSalesList]);

  const loadSaleDetails = async (saleId: number) => {
    setLoadingDetailId(saleId);
    try {
      const [details, payments] = await Promise.all([
        VentaRealizadaService.getDetalleVenta(saleId),
        VentaRealizadaService.getPagoVenta(saleId),
      ]);
      setRowDetailsMap(prev => ({ ...prev, [saleId]: details }));
      setRowPaymentsMap(prev => ({ ...prev, [saleId]: payments }));
    } catch {
      setRowDetailsMap(prev => ({ ...prev, [saleId]: [] }));
      setRowPaymentsMap(prev => ({ ...prev, [saleId]: [] }));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const toggleRow = (saleId: number) => {
    if (expandedRowId === saleId) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(saleId);
      if (!rowDetailsMap[saleId]) {
        loadSaleDetails(saleId);
      }
    }
  };

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (sale: VentaRealizadaSelectDto) => {
      if (filters.estado && sale.estado !== filters.estado) return false;
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
  } = useDataTable<VentaRealizadaSelectDto>({
    data: sales,
    searchKeys: ['cliente', 'vendedor', 'id'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const totalMonto = sales.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const activosCount = sales.filter(s => s.estado === 'ACTIVO').length;
    const pendientesCount = sales.filter(s => s.estado === 'PENDIENTE').length;
    return { totalMonto, activosCount, pendientesCount, totalCount: sales.length };
  }, [sales]);

  const columns = [
    {
      key: 'expand',
      header: '',
      width: '40px',
      align: 'center' as const,
      render: (row: VentaRealizadaSelectDto) => (
        <button
          type="button"
          className="venta-expand-btn"
          onClick={() => toggleRow(row.id)}
          aria-label="Ver detalle"
        >
          {expandedRowId === row.id ? <FiChevronDown /> : <FiChevronRight />}
        </button>
      ),
    },
    {
      key: 'id',
      header: 'Comprobante',
      sortable: true,
      width: '110px',
      render: (row: VentaRealizadaSelectDto) => (
        <strong>#{row.id}</strong>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: VentaRealizadaSelectDto) => (
        <div>
          <div className="venta-cell-main">{row.cliente || 'Cliente General'}</div>
          <div className="venta-cell-sub">Vendedor: {row.vendedor || 'Sistema'}</div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      width: '140px',
      render: (row: VentaRealizadaSelectDto) => formatDate(row.fecha),
    },
    {
      key: 'cantidadProductos',
      header: 'Items',
      sortable: true,
      align: 'center' as const,
      width: '70px',
      render: (row: VentaRealizadaSelectDto) => <strong>{row.cantidadProductos ?? 0}</strong>,
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: VentaRealizadaSelectDto) => fmt(row.total),
    },
  ];

  const renderExpanded = (row: VentaRealizadaSelectDto) => {
    const details = rowDetailsMap[row.id] ?? [];
    const payments = rowPaymentsMap[row.id] ?? [];
    const isLoading = loadingDetailId === row.id;

    return (
      <div className="venta-expanded">
        {isLoading ? (
          <p className="venta-expanded-loading">Cargando detalle...</p>
        ) : (
          <>
            <div className="venta-expanded-section">
              <h4>Detalle de artículos</h4>
              <table className="venta-detail-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">P. Unit.</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="venta-empty-row">Sin artículos registrados</td>
                    </tr>
                  ) : (
                    details.map(det => (
                      <tr key={det.id}>
                        <td className="mono">{det.codigo}</td>
                        <td>{det.nombre}</td>
                        <td className="text-center">{det.cantidad}</td>
                        <td className="text-right">{fmt(det.precioUnitario)}</td>
                        <td className="text-right"><strong>{fmt(det.subtotal)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="venta-expanded-section venta-payments-section">
              <h4><FiCreditCard /> Pagos realizados</h4>
              {payments.length === 0 ? (
                <p className="venta-empty-row">Sin pagos registrados</p>
              ) : (
                <table className="venta-payments-table">
                  <thead>
                    <tr>
                      <th>Método</th>
                      <th className="text-right">Monto</th>
                      <th>Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(pago => (
                      <tr key={pago.id}>
                        <td className="venta-payment-method">{pago.metodoPago}</td>
                        <td className="text-right venta-payment-amount">{fmt(pago.monto)}</td>
                        <td className="venta-payment-ref">{pago.codigoOperacion || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="ventas-section">
      {error && <div className="ventas-alert-error">{error}</div>}

      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiDollarSign /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{fmt(indicators.totalMonto)}</span>
            <span className="erp-indicator-label">Total Liquidado</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activosCount}</span>
            <span className="erp-indicator-label">Boletas Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientesCount}</span>
            <span className="erp-indicator-label">Boletas Pendientes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.totalCount}</span>
            <span className="erp-indicator-label">Total Boletas</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por cliente o vendedor..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div className="ventas-filter-panel">
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos</option>
                <option value="ACTIVO">Activa</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card ventas-table-card">
        {loading ? (
          <div className="ventas-loading">Cargando historial de ventas...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={processedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              rowKey={row => row.id}
              expandedRowKey={expandedRowId ?? undefined}
              renderExpanded={renderExpanded}
              emptyMessage="No se encontraron comprobantes registrados"
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

export default VentasSection;
