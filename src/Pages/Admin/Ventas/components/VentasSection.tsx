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
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ERPEmptySelection from '../../../../Components/ERP/ERPEmptySelection';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiDollarSign,
  FiActivity,
  FiCreditCard,
  FiEye,
  FiShoppingCart,
} from 'react-icons/fi';
import './VentasSection.css';

interface VentaFilters {
  estado: string;
}

const DEFAULT_FILTERS: VentaFilters = { estado: '' };

const fmt = (n?: number) => `S/ ${(n ?? 0).toFixed(2)}`;

export const VentasSection = () => {
  const [sales, setSales] = useState<VentaRealizadaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [selectedSale, setSelectedSale] = useState<VentaRealizadaSelectDto | null>(null);
  const [saleDetails, setSaleDetails] = useState<VentaRealizadaDetalleDto[]>([]);
  const [salePayments, setSalePayments] = useState<VentaRealizadaPagoDto[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [filters, setFilters] = useState<VentaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);

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

  const handleSelectSale = async (sale: VentaRealizadaSelectDto) => {
    setSelectedSale(sale);
    setActiveTab('form');
    setLoadingDetail(true);
    try {
      const [details, payments] = await Promise.all([
        VentaRealizadaService.getDetalleVenta(sale.id),
        VentaRealizadaService.getPagoVenta(sale.id),
      ]);
      setSaleDetails(details);
      setSalePayments(payments);
    } catch {
      setSaleDetails([]);
      setSalePayments([]);
    } finally {
      setLoadingDetail(false);
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
    const totalCount = sales.length;
    return { totalMonto, totalCount };
  }, [sales]);

  const columns = [
    {
      key: 'id',
      header: 'Comprobante',
      sortable: true,
      width: '120px',
      render: (row: VentaRealizadaSelectDto) => (
        <strong style={{ color: 'var(--erp-accent)' }}>#{row.id}</strong>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: VentaRealizadaSelectDto) => (
        <div>
          <div className="venta-cell-main" style={{ fontWeight: 600 }}>{row.cliente || 'Cliente General'}</div>
          <div className="venta-cell-sub" style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Vendedor: {row.vendedor || 'Sistema'}</div>
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
      width: '80px',
      render: (row: VentaRealizadaSelectDto) => <strong>{row.cantidadProductos ?? 0}</strong>,
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: VentaRealizadaSelectDto) => (
        <strong style={{ color: '#0369a1' }}>{fmt(row.total)}</strong>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: VentaRealizadaSelectDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver Detalle y Pagos"
            variant="primary"
            onClick={() => handleSelectSale(row)}
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
            <span className="erp-indicator-value">{indicators.totalCount}</span>
            <span className="erp-indicator-label">Total Ventas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiDollarSign /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{fmt(indicators.totalMonto)}</span>
            <span className="erp-indicator-label">Ingresos Totales</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por cliente, vendedor o número de comprobante..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Estado</label>
            <select
              className="erp-filter-select"
              value={filters.estado}
              onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Completada</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando ventas...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={processedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            rowKey={row => row.id}
            emptyMessage="No se encontraron ventas registradas"
            onRowClick={handleSelectSale}
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
      {loadingDetail ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando detalle de venta...</div>
      ) : selectedSale ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              Comprobante de Venta #{selectedSale.id}
            </h3>

            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Cliente</label>
                  <input className="erp-input" readOnly value={selectedSale.cliente || 'Cliente General'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Vendedor</label>
                  <input className="erp-input" readOnly value={selectedSale.vendedor || 'Sistema'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha</label>
                  <input className="erp-input" readOnly value={formatDate(selectedSale.fecha)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Artículos</label>
                  <input className="erp-input" readOnly value={`${selectedSale.cantidadProductos ?? 0} items`} />
                </div>
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Total Cobrado</label>
                <input className="erp-input" readOnly value={fmt(selectedSale.total)} />
              </div>
            </div>
          </div>

          <div className="erp-form-section">
            <h3 className="erp-form-section-title">Detalle de Artículos</h3>
            <div style={{ border: '1px solid var(--erp-border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--erp-bg-secondary)', borderBottom: '1px solid var(--erp-border)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Descripción</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cant.</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>P. Unit.</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {saleDetails.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Sin artículos registrados</td>
                    </tr>
                  ) : (
                    saleDetails.map(det => (
                      <tr key={det.id} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                        <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{det.codigo}</td>
                        <td style={{ padding: '6px 8px' }}>{det.nombre}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{det.cantidad}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(det.precioUnitario)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}><strong>{fmt(det.subtotal)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-form-section">
            <h3 className="erp-form-section-title"><FiCreditCard style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Métodos de Pago</h3>
            <div style={{ border: '1px solid var(--erp-border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--erp-bg-secondary)', borderBottom: '1px solid var(--erp-border)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Método</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Monto</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Cód. Operación</th>
                  </tr>
                </thead>
                <tbody>
                  {salePayments.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Sin pagos registrados</td>
                    </tr>
                  ) : (
                    salePayments.map(pago => (
                      <tr key={pago.id} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{pago.metodoPago}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}><strong>{fmt(pago.monto)}</strong></td>
                        <td style={{ padding: '6px 8px', color: 'var(--erp-text-secondary)' }}>{pago.codigoOperacion || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <ERPEmptySelection
          icon={<FiShoppingCart />}
          title="Ninguna venta seleccionada"
          description="Seleccione una venta en la pestaña Registros para ver su desglose, comprobante emitido y métodos de pago."
          onBack={() => setActiveTab('list')}
          backLabel="Ir a Historial de Ventas"
        />
      )}
    </div>
  );

  return (
    <SubmoduleTwoTabsLayout
      title="Historial de Ventas y Comprobantes"
      subtitle="Supervisa las ventas concretadas en tienda, sus detalles de artículos y métodos de cobro"
      entityName="Venta"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode="view"
      listContent={listContent}
      formContent={formContent}
    />
  );
};

export default VentasSection;
