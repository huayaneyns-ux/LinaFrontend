import { useState, useEffect, useMemo, useCallback } from 'react';
import { LoteService } from '../../../../Services/Admin/Inventario/Lote';
import type { LoteSelectListarDto, LoteSelectDto } from '../../../../Types/Admin/Inventario/Lote';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import {
  FiLayers,
  FiActivity,
  FiAlertTriangle,
  FiPackage,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiX,
  FiCalendar,
  FiHash,
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

const formatMoney = (val?: any): string => {
  if (val === undefined || val === null) return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const LotsSection = () => {
  const [lotes, setLotes] = useState<LoteSelectListarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLote, setSelectedLote] = useState<LoteSelectDto | null>(null);
  const [filters, setFilters] = useState<LoteFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

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

    return <span style={{ color, backgroundColor: bg, padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' }}>{dias} días</span>;
  };

  const columns = [
    {
      key: 'codigoLote',
      header: 'Código Lote',
      sortable: true,
      width: '120px',
      render: (row: LoteSelectListarDto) => <strong style={{ color: 'var(--erp-primary)' }}>{row.codigoLote}</strong>,
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
        const stock = (row as any).stockActual ?? row.cantidadIngresada;
        return <strong style={{ color: stock > 0 ? '#10b981' : '#ef4444' }}>{stock} und</strong>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {error && <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}

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
            <span className="erp-indicator-label">Próximos a Vencer (≤30 días)</span>
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
        searchPlaceholder="Buscar lote, producto..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" className="erp-input" placeholder="Nombre Producto" value={filters.producto} onChange={e => setFilters(p => ({ ...p, producto: e.target.value }))} style={{ flex: 1 }} />
            <select className="erp-input" value={filters.estado} onChange={e => setFilters(p => ({ ...p, estado: e.target.value }))} style={{ flex: 1 }}>
              <option value="">Todos los Estados</option>
              <option value="ACTIVO">Activo / Vigente</option>
              <option value="VENCIDO">Vencido</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>
        }
      />

      {/* Master-Detail Split Pane */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left: Master Data Table */}
        <div className="erp-table-card" style={{ flex: selectedLote ? '0 0 55%' : '1 1 100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
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
                rowClassName={row => selectedLote?.idLote === row.idLote ? 'erp-row-selected' : ''}
              />
              <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
            </>
          )}
        </div>

        {/* Right: Detail Panel */}
        {selectedLote && (
          <div className="erp-detail-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid var(--erp-border-color)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'slideInRight 0.3s ease' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--erp-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--erp-text-primary)' }}>Lote {selectedLote.codigoLote}</h3>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>{selectedLote.producto}</span>
              </div>
              <button onClick={() => setSelectedLote(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--erp-text-muted)', padding: '4px' }}><FiX size={20} /></button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--erp-text-muted)' }}>Cargando detalle...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Info Grid */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--erp-text-secondary)', letterSpacing: '0.5px' }}>Información General</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div className="detail-item"><FiHash className="icon"/> <span><strong>Cód. Prod:</strong> {selectedLote.codigoProducto}</span></div>
                      <div className="detail-item"><FiPackage className="icon"/> <span><strong>Proveedor:</strong> {selectedLote.proveedor || 'N/A'}</span></div>
                      <div className="detail-item"><FiCalendar className="icon"/> <span><strong>Ingreso:</strong> {formatDate(selectedLote.fechaIngreso)}</span></div>
                      <div className="detail-item"><FiCalendar className="icon"/> <span><strong>Vence:</strong> {selectedLote.fechaVencimiento ? formatDate(selectedLote.fechaVencimiento) : 'N/A'}</span></div>
                      <div className="detail-item"><FiLayers className="icon"/> <span><strong>Cant. Inicial:</strong> {selectedLote.cantidadIngresada} u.</span></div>
                      <div className="detail-item"><FiActivity className="icon"/> <span><strong>Stock Actual:</strong> <span style={{ color: 'var(--erp-primary)', fontWeight: 'bold' }}>{selectedLote.stockActual ?? selectedLote.cantidadIngresada} u.</span></span></div>
                      <div className="detail-item"><span><strong>Costo Unit.:</strong> S/ {formatMoney(selectedLote.costoUnitario)}</span></div>
                      <div className="detail-item"><span><strong>Valor Compra:</strong> S/ {formatMoney(selectedLote.valorCompra)}</span></div>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px dashed var(--erp-border-color)' }} />

                  {/* Movements Timeline */}
                  <div>
                    <h4 style={{ margin: '0 0 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--erp-text-secondary)', letterSpacing: '0.5px' }}>Historial de Movimientos</h4>
                    <div className="movimiento-timeline" style={{ paddingLeft: '8px' }}>
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
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                          No hay movimientos registrados para este lote.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LotsSection;
