import { useState, useEffect, useMemo, useCallback } from 'react';
import { LoteService } from '../../../../Services/Admin/Inventario/Lote';
import type { LoteSelectListarDto, LoteSelectDto } from '../../../../Types/Admin/Inventario/Lote';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ERPEmptySelection from '../../../../Components/ERP/ERPEmptySelection';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiLayers,
  FiActivity,
  FiAlertTriangle,
  FiPackage,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiEye,
} from 'react-icons/fi';

interface LoteFilters {
  producto: string;
  estado: string;
}

const DEFAULT_FILTERS: LoteFilters = { producto: '', estado: '' };

const getMovimientoConfig = (tipo: string | number) => {
  const t = String(tipo).trim().toLowerCase();
  const isIngreso = t.includes('entrada') || t.includes('positivo') || t.includes('devolucion') || t.includes('liberacion');
  
  if (t === '1' || t.includes('compra')) return { label: 'Entrada Compra', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <FiArrowDownLeft />, sign: '+' };
  if (t === '2' || t.includes('venta')) return { label: 'Venta', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <FiArrowUpRight />, sign: '-' };
  if (t === '3' || t.includes('cliente')) return { label: 'Dev. Cliente', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <FiArrowDownLeft />, sign: '+' };
  if (t === '4' || t.includes('proveedor')) return { label: 'Dev. Proveedor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <FiArrowUpRight />, sign: '-' };
  if (t === '5' || t.includes('merma')) return { label: 'Merma', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <FiAlertTriangle />, sign: '-' };
  if (t === '6' || t.includes('ajuste positivo')) return { label: 'Aj. Positivo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <FiArrowDownLeft />, sign: '+' };
  if (t === '7' || t.includes('ajuste negativo')) return { label: 'Aj. Negativo', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <FiArrowUpRight />, sign: '-' };
  if (t === '8' || t.includes('paquete abierto')) return { label: 'Pqt. Abierto', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <FiArrowUpRight />, sign: '-' };
  if (t === '9' || (t.includes('reserva') && !t.includes('liber'))) return { label: 'Reserva', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: <FiArrowUpRight />, sign: '-' };
  if (t === '10' || t.includes('liberacion')) return { label: 'Lib. Reserva', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: <FiArrowDownLeft />, sign: '+' };

  return { label: tipo, color: isIngreso ? '#10b981' : '#ef4444', bg: isIngreso ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', icon: isIngreso ? <FiArrowDownLeft /> : <FiArrowUpRight />, sign: isIngreso ? '+' : '-' };
};

const formatMoney = (val?: unknown): string => {
  if (val === undefined || val === null) return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const LotsSection = () => {
  const [lotes, setLotes] = useState<LoteSelectListarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [selectedLote, setSelectedLote] = useState<LoteSelectDto | null>(null);
  const [filters, setFilters] = useState<LoteFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);

  const loadLotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LoteService.getLotes();
      setLotes(data);
    } catch {
      setError('Error al cargar los lotes del sistema.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLotes();
  }, [loadLotes]);

  const filterCount = useMemo(() => Object.values(filters).filter(v => v !== '').length, [filters]);

  const externalFilter = useCallback((lote: LoteSelectListarDto) => {
    if (filters.estado && lote.estadoLote !== filters.estado) return false;
    if (filters.producto && !lote.producto.toLowerCase().includes(filters.producto.toLowerCase())) return false;
    return true;
  }, [filters]);

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
  } = useDataTable<LoteSelectListarDto>({
    data: lotes,
    searchKeys: ['codigoLote', 'producto', 'proveedor'],
    defaultPageSize: 10,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = lotes.length;
    const activos = lotes.filter(l => l.estadoLote === 'ACTIVO' || l.estadoLote === 'Vigente').length;
    const proximosVencer = lotes.filter(l => l.diasParaVencer !== undefined && l.diasParaVencer <= 30).length;
    const valorTotal = lotes.reduce((sum, l) => sum + (l.valorCompra || 0), 0);
    return { total, activos, proximosVencer, valorTotal };
  }, [lotes]);

  const handleSelectRow = async (record: LoteSelectListarDto) => {
    try {
      setLoadingDetail(true);
      setActiveTab('form');
      const detail = await LoteService.getLoteById(record.idLote);
      setSelectedLote(detail);
    } catch {
      setError('Error al cargar la información detallada del lote.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const renderDiasVencer = (dias?: number) => {
    if (dias === undefined) return <span style={{ color: 'var(--erp-text-muted)' }}>Sin Vencimiento</span>;
    if (dias <= 0) return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Vencido</span>;

    let color = '#10b981', bg = 'rgba(16, 185, 129, 0.1)';
    if (dias <= 30) { color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.1)'; } 
    else if (dias <= 90) { color = '#eab308'; bg = 'rgba(234, 179, 8, 0.1)'; }

    return <span style={{ color, backgroundColor: bg, padding: '2px 8px', borderRadius: '0px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', border: `1px solid ${color}` }}>{dias} días</span>;
  };

  const columns = [
    {
      key: 'codigoLote',
      header: 'Código Lote',
      sortable: true,
      width: '120px',
      render: (row: LoteSelectListarDto) => <strong style={{ color: 'var(--erp-accent)' }}>{row.codigoLote}</strong>,
    },
    {
      key: 'producto',
      header: 'Producto',
      sortable: true,
      render: (row: LoteSelectListarDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.producto}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Cód: {row.codigoProducto}</div>
        </div>
      ),
    },
    {
      key: 'diasParaVencer',
      header: 'Vencimiento',
      sortable: true,
      width: '120px',
      render: (row: LoteSelectListarDto) => renderDiasVencer(row.diasParaVencer),
    },
    {
      key: 'cantidadIngresada',
      header: 'Cant. Inicial',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: LoteSelectListarDto) => `${row.cantidadIngresada} und`,
    },
    {
      key: 'stockActual',
      header: 'Stock Act.',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: LoteSelectListarDto) => {
        const stock = (row as { stockActual?: number }).stockActual ?? row.cantidadIngresada;
        return <strong style={{ color: stock > 0 ? '#10b981' : '#ef4444' }}>{stock} und</strong>;
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: LoteSelectListarDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver Trazabilidad"
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
          <div className="erp-indicator-icon"><FiLayers /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Lotes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiPackage /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Lotes Activos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiAlertTriangle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.proximosVencer}</span>
            <span className="erp-indicator-label">Por Vencer (≤30 d)</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {formatMoney(indicators.valorTotal)}</span>
            <span className="erp-indicator-label">Valorización</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código de lote, producto..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Nombre de Producto</label>
              <input
                type="text"
                className="erp-filter-select"
                placeholder="Filtrar por producto..."
                value={filters.producto}
                onChange={e => setFilters(p => ({ ...p, producto: e.target.value }))}
              />
            </div>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Estado de Lote</label>
              <select
                className="erp-filter-select"
                value={filters.estado}
                onChange={e => setFilters(p => ({ ...p, estado: e.target.value }))}
              >
                <option value="">Todos los Estados</option>
                <option value="ACTIVO">Activo / Vigente</option>
                <option value="VENCIDO">Vencido</option>
                <option value="AGOTADO">Agotado</option>
              </select>
            </div>
          </>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando lotes...</div>
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={processedData} 
            sortConfig={sortConfig} 
            onSort={handleSort} 
            rowKey={row => row.idLote} 
            emptyMessage="No se encontraron lotes"
            onRowClick={handleSelectRow}
          />
          <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );

  const formContent = (
    <div className="erp-form">
      {loadingDetail ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando trazabilidad del lote...</div>
      ) : selectedLote ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              Trazabilidad del Lote: {selectedLote.codigoLote} - {selectedLote.producto}
            </h3>

            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Cód. Producto</label>
                  <input className="erp-input" readOnly value={selectedLote.codigoProducto || ''} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Proveedor</label>
                  <input className="erp-input" readOnly value={selectedLote.proveedor || 'N/A'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Ingreso</label>
                  <input className="erp-input" readOnly value={formatDate(selectedLote.fechaIngreso)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Vence</label>
                  <input className="erp-input" readOnly value={selectedLote.fechaVencimiento ? formatDate(selectedLote.fechaVencimiento) : 'N/A'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Cant. Inicial</label>
                  <input className="erp-input" readOnly value={`${selectedLote.cantidadIngresada} und`} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Stock Actual</label>
                  <input className="erp-input" readOnly value={`${selectedLote.stockActual ?? selectedLote.cantidadIngresada} und`} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Costo Unit.</label>
                  <input className="erp-input" readOnly value={`S/ ${formatMoney(selectedLote.costoUnitario)}`} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Valor Compra</label>
                  <input className="erp-input" readOnly value={`S/ ${formatMoney(selectedLote.valorCompra)}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="erp-form-section">
            <h3 className="erp-form-section-title">Historial de Movimientos</h3>
            <div className="movimiento-timeline" style={{ paddingLeft: '8px', paddingTop: '8px' }}>
              {selectedLote.movimientos && selectedLote.movimientos.length > 0 ? (
                selectedLote.movimientos.map((m) => {
                  const cfg = getMovimientoConfig(m.tipoMovimiento);
                  return (
                    <div key={m.id} className="timeline-item">
                      <div className="timeline-dot" style={{ borderColor: cfg.color, color: cfg.color }}>{cfg.icon}</div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-type" style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                          <span className="timeline-date">{formatDate(m.fecha)}</span>
                        </div>
                        <div className="timeline-body">
                          <span className="timeline-desc" style={{ color: 'var(--erp-text-secondary)' }}>{m.motivo || 'Generado automáticamente'}</span>
                          <span className="timeline-qty" style={{ color: cfg.color, fontWeight: 'bold', fontSize: '13px' }}>{cfg.sign}{m.cantidad} und</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)', background: 'var(--erp-bg-secondary)', border: '1px solid var(--erp-border)', fontSize: '13px' }}>
                  No hay movimientos registrados para este lote.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ERPEmptySelection
          icon={<FiLayers />}
          title="Ningún lote seleccionado"
          description="Seleccione un lote en la pestaña Registros para ver su trazabilidad, movimientos y detalle de stock."
          onBack={() => setActiveTab('list')}
          backLabel="Ir a Registros de Lotes"
        />
      )}
    </div>
  );

  return (
    <SubmoduleTwoTabsLayout
      title="Gestión de Lotes y Trazabilidad"
      subtitle="Supervisa el stock por lote, fechas de caducidad y trazabilidad de entrada"
      entityName="Lote"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode="view"
      listContent={listContent}
      formContent={formContent}
    />
  );
};

export default LotsSection;
