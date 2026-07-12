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
// import CrudDialog from '../../../../Components/ERP/CrudDialog'; // No longer used
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiDollarSign,
  FiChevronDown, FiChevronRight,
  FiActivity,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

interface VentaFilters {
  estado: string;
}

const DEFAULT_FILTERS: VentaFilters = { estado: '' };

const VentasSection = () => {
  const [sales, setSales] = useState<VentaRealizadaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal States
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Filtering States
  const [filters, setFilters] = useState<VentaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

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

  // View Sale Details (Calls the other 3 endpoints)
  const loadSaleDetails = async (saleId: number) => {
    try {
      const [, details, payments] = await Promise.all([
        VentaRealizadaService.getVentaById(saleId),
        VentaRealizadaService.getDetalleVenta(saleId),
        VentaRealizadaService.getPagoVenta(saleId),
      ]);
      return { details, payments };
    } catch (err) {
      console.error('Error al cargar detalles de venta:', err);
      return { details: [], payments: [] };
    }
  };

  const toggleRow = (saleId: number) => {
    if (expandedRowId === saleId) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(saleId);
      // preload details for the row
      loadSaleDetails(saleId).then(({ details, payments }) => {
        // Store in state maps for rendering without modal
        setRowDetailsMap(prev => ({ ...prev, [saleId]: details }));
        setRowPaymentsMap(prev => ({ ...prev, [saleId]: payments }));
      });
    }
  };

  // Maps to store details per row for inline rendering
  const [rowDetailsMap, setRowDetailsMap] = useState<Record<number, VentaRealizadaDetalleDto[]>>({});
  const [rowPaymentsMap, setRowPaymentsMap] = useState<Record<number, VentaRealizadaPagoDto[]>>({});

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
    const totalMonto = sales.reduce((sum, s) => sum + s.total, 0);
    const activosCount = sales.filter(s => s.estado === 'ACTIVO').length;
    const pendientesCount = sales.filter(s => s.estado === 'PENDIENTE').length;
    const totalCount = sales.length;
    return { totalMonto, activosCount, pendientesCount, totalCount };
  }, [sales]);

  const columns = [
    {
      key: 'id',
      header: 'Comprobante',
      sortable: true,
      width: '120px',
      render: (row: VentaRealizadaSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>Boleta #{row.id}</strong>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: VentaRealizadaSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cliente || 'Cliente General'}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Vendedor: {row.vendedor || 'Sistema'}</div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha de Registro',
      sortable: true,
      width: '150px',
      render: (row: VentaRealizadaSelectDto) => formatDate(row.fecha),
    },
    {
      key: 'cantidadProductos',
      header: 'Cant. Items',
      sortable: true,
      align: 'center' as const,
      width: '100px',
      render: (row: VentaRealizadaSelectDto) => (
        <span style={{ fontWeight: 600 }}>{row.cantidadProductos || 0}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total Cobrado',
      sortable: true,
      align: 'right' as const,
      width: '120px',
      render: (row: VentaRealizadaSelectDto) => `S/ ${(row.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: VentaRealizadaSelectDto) => (
        <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '80px',
      render: (row: VentaRealizadaSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton
            icon={expandedRowId === row.id ? <FiChevronDown /> : <FiChevronRight />}
            tooltip="Ver detalle"
            variant="primary"
            onClick={() => toggleRow(row.id)}
          />
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

      {/* Sales indicators */}
      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiDollarSign /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.totalMonto.toFixed(2)}</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
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

      {/* Main Table */}
      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando historial de ventas...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={processedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              rowKey={row => row.id}
              expandedRowKey={expandedRowId ?? undefined}
              renderExpanded={row => (
                <div style={{ padding: '12px', backgroundColor: '#f9fafb' }}>
                  {/* Product Details */}
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Detalle de Artículos</strong>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '4px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--erp-border)', backgroundColor: '#f1f5f9' }}>
                          <th style={{ padding: '4px', fontWeight: 600 }}>Código</th>
                          <th style={{ padding: '4px', fontWeight: 600 }}>Descripción</th>
                          <th style={{ padding: '4px', fontWeight: 600, textAlign: 'center' }}>Cant.</th>
                          <th style={{ padding: '4px', fontWeight: 600, textAlign: 'right' }}>P.Unit.</th>
                          <th style={{ padding: '4px', fontWeight: 600, textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rowDetailsMap[row.id] || []).map(det => (
                          <tr key={det.id} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                            <td style={{ padding: '4px', fontFamily: 'monospace', fontWeight: 600 }}>{det.codigo}</td>
                            <td style={{ padding: '4px' }}>{det.nombre}</td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>{det.cantidad}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>S/ {det.precioUnitario.toFixed(2)}</td>
                            <td style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>S/ {det.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Payments */}
                  <div>
                    <strong>Pagos</strong>
                    <div style={{ marginTop: '4px' }}>
                      {(rowPaymentsMap[row.id] || []).map(pago => (
                        <div key={pago.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', border: '1px solid var(--erp-border)', borderRadius: '4px', marginBottom: '4px' }}>
                          <span style={{ color: pago.metodoPago === 'YAPE' ? '#28a745' : pago.metodoPago === 'Plin' ? '#1e90ff' : '#555' }}>
                            {pago.metodoPago}
                          </span>
                          <span>Monto: S/ {pago.monto.toFixed(2)}</span>
                        </div>
                      ))}
                      {(rowPaymentsMap[row.id] || []).length === 0 && (
                        <div style={{ color: 'var(--erp-text-muted)', fontSize: '12px' }}>Sin pagos registrados</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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

      {/* Invoice Details Dialog */}

    </div>
  );
};

export default VentasSection;
