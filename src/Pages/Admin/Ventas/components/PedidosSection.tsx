import { useState, useEffect, useMemo, useCallback } from 'react';
import { PedidoService } from '../../../../Services/Admin/Ventas/Pedido';
import { resolveImageUrl } from '../../../../Utils/imageUtils';
import type { PedidoSelectDto, PedidoSelectIdDto } from '../../../../Types/Admin/Ventas/Pedido';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import IconButton from '../../../../Components/ERP/IconButton';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ERPEmptySelection from '../../../../Components/ERP/ERPEmptySelection';
import { StatusBadge, type StatusTone } from '../../../../Components/ERP/StatusBadge';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiEye,
  FiRefreshCw,
  FiImage,
  FiX,
  FiPackage,
  FiSave,
  FiShoppingBag,
} from 'react-icons/fi';
import './PedidosSection.css';

const ESTADOS: Record<number, { label: string; tone: StatusTone }> = {
  1: { label: 'Pendiente de Validación', tone: 'warning' },
  2: { label: 'Pago Rechazado', tone: 'danger' },
  3: { label: 'Pago Aprobado', tone: 'info' },
  4: { label: 'Alistando Pedido', tone: 'info' },
  5: { label: 'En Camino', tone: 'primary' },
  6: { label: 'Listo para Recoger', tone: 'primary' },
  7: { label: 'Entregado', tone: 'success' },
  8: { label: 'Cancelado', tone: 'danger' },
};

const fmt = (n?: number | null) => `S/ ${(Number(n) || 0).toFixed(2)}`;

const labelTipoEntrega = (tipo?: string | null) => {
  if (tipo === 'RECOJO_TIENDA') return 'Recojo en Tienda';
  if (tipo === 'ENVIO_DOMICILIO') return 'Envío a Domicilio';
  return tipo || '—';
};

const estadoLabel = (codigo?: number | null, nombreApi?: string | null) => {
  const code = Number(codigo) || 0;
  return ESTADOS[code]?.label || nombreApi || (code ? `Estado ${code}` : '—');
};

const estadoTone = (codigo?: number | null): StatusTone =>
  ESTADOS[Number(codigo) || 0]?.tone || 'warning';

interface PedidoFilters {
  estado: string;
  tipoEntrega: string;
}

const DEFAULT_FILTERS: PedidoFilters = { estado: '', tipoEntrega: '' };

export const PedidosSection = () => {
  const [pedidos, setPedidos] = useState<PedidoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [detalle, setDetalle] = useState<PedidoSelectIdDto | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState(1);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [filters, setFilters] = useState<PedidoFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);

  const loadPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PedidoService.getPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar la lista de pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (order: PedidoSelectDto) => {
      if (filters.estado && String(order.estado_pedido) !== filters.estado) return false;
      if (filters.tipoEntrega && order.tipo_entrega !== filters.tipoEntrega) return false;
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
  } = useDataTable<PedidoSelectDto>({
    data: pedidos,
    searchKeys: ['id_pedido', 'cliente', 'telefono', 'metodo_pago'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = pedidos.length;
    const entregados = pedidos.filter(o => Number(o.estado_pedido) === 7).length;
    const pendientes = pedidos.filter(o => {
      const e = Number(o.estado_pedido);
      return e !== 7 && e !== 8;
    }).length;
    const montoTotal = pedidos.reduce((sum, o) => sum + (Number(o.monto) || 0), 0);
    return { total, entregados, pendientes, montoTotal };
  }, [pedidos]);

  const openPedidoTab = async (mode: 'view' | 'edit', record: PedidoSelectDto) => {
    setSuccessMsg(null);
    setError(null);
    setSaving(true);
    setFormMode(mode);
    setActiveTab('form');
    setDetalle(null);
    try {
      const detail = await PedidoService.getPedidoById(record.id_pedido);
      const merged: PedidoSelectIdDto = {
        ...detail,
        id_pedido: detail.id_pedido || record.id_pedido,
        estado_pedido: detail.estado_pedido || record.estado_pedido,
        monto: detail.monto ?? record.monto,
        metodo_pago: detail.metodo_pago ?? record.metodo_pago,
        codigo_operacion: detail.codigo_operacion ?? record.codigo_operacion,
        ruta_comprobante: detail.ruta_comprobante ?? record.ruta_comprobante,
        cliente: detail.cliente || record.cliente,
      };
      setDetalle(merged);
      setNuevoEstado(Number(merged.estado_pedido) || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del pedido');
      setActiveTab('list');
    } finally {
      setSaving(false);
    }
  };

  const estadosDisponibles = useMemo(() => {
    const tipo = detalle?.tipo_entrega || '';
    return Object.entries(ESTADOS).filter(([idStr]) => {
      const id = Number(idStr);
      if (tipo === 'ENVIO_DOMICILIO' && id === 6) return false;
      if (tipo === 'RECOJO_TIENDA' && id === 5) return false;
      return true;
    });
  }, [detalle?.tipo_entrega]);

  const handleCambiarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalle) return;
    if (nuevoEstado === Number(detalle.estado_pedido)) {
      setActiveTab('list');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await PedidoService.cambiarEstado({
        id_pedido: detalle.id_pedido,
        estado_pedido: nuevoEstado,
      });
      if (res.success) {
        setSuccessMsg(res.mensaje || `Estado del pedido #${detalle.id_pedido} actualizado.`);
        setActiveTab('list');
        await loadPedidos();
      } else {
        setError(res.mensaje || 'No se pudo cambiar el estado.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    } finally {
      setSaving(false);
    }
  };

  const comprobanteUrl = detalle?.ruta_comprobante
    ? resolveImageUrl(detalle.ruta_comprobante)
    : null;

  const columns = [
    {
      key: 'id_pedido',
      header: 'Pedido',
      sortable: true,
      width: '100px',
      render: (row: PedidoSelectDto) => <strong>#{row.id_pedido}</strong>,
    },
    {
      key: 'fecha_pedido',
      header: 'Fecha',
      sortable: true,
      width: '130px',
      render: (row: PedidoSelectDto) => formatDate(row.fecha_pedido),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: PedidoSelectDto) => (
        <div>
          <div className="pedido-cell-main" style={{ fontWeight: 600 }}>{row.cliente || '—'}</div>
          <div className="pedido-cell-sub" style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Tel: {row.telefono || '—'}</div>
        </div>
      ),
    },
    {
      key: 'tipo_entrega',
      header: 'Entrega / Pago',
      sortable: true,
      render: (row: PedidoSelectDto) => (
        <div>
          <div className="pedido-cell-main">{labelTipoEntrega(row.tipo_entrega)}</div>
          <div className="pedido-cell-sub" style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{row.metodo_pago || '—'}</div>
        </div>
      ),
    },
    {
      key: 'monto',
      header: 'Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: PedidoSelectDto) => <strong>{fmt(row.monto)}</strong>,
    },
    {
      key: 'estado_pedido',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: PedidoSelectDto) => {
        const codigo = Number(row.estado_pedido) || 0;
        const label = estadoLabel(codigo, row.estado_pedido_nombre);
        return (
          <StatusBadge
            label={label}
            tone={estadoTone(codigo)}
            status={label}
          />
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: PedidoSelectDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver pedido"
            variant="primary"
            onClick={() => openPedidoTab('view', row)}
          />
          <IconButton
            icon={<FiRefreshCw />}
            tooltip="Gestionar estado"
            variant="warning"
            onClick={() => openPedidoTab('edit', row)}
          />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiFileText /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Pedidos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.entregados}</span>
            <span className="erp-indicator-label">Entregados</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientes}</span>
            <span className="erp-indicator-label">En proceso</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{fmt(indicators.montoTotal)}</span>
            <span className="erp-indicator-label">Total Recaudado</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por ID de pedido, cliente o teléfono..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Estado de Pedido</label>
              <select
                className="erp-filter-select"
                value={filters.estado}
                onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADOS).map(([id, item]) => (
                  <option key={id} value={id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="erp-filter-group">
              <label className="erp-filter-label">Tipo de Entrega</label>
              <select
                className="erp-filter-select"
                value={filters.tipoEntrega}
                onChange={e => setFilters(prev => ({ ...prev, tipoEntrega: e.target.value }))}
              >
                <option value="">Todas las entregas</option>
                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
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
      {successMsg && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-success-light)', color: 'var(--erp-success)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-success)' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando pedidos...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={processedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            rowKey={row => row.id_pedido}
            emptyMessage="No se encontraron pedidos"
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
      {saving && !detalle ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando detalle del pedido...</div>
      ) : detalle ? (
        <form
          onSubmit={formMode === 'edit' ? handleCambiarEstado : (e) => e.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              Pedido #{detalle.id_pedido} — {detalle.cliente || 'Cliente'}
            </h3>

            {error && (
              <div style={{ padding: '8px 12px', marginBottom: '14px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
                {error}
              </div>
            )}

            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Cliente</label>
                  <input className="erp-input" readOnly value={detalle.cliente || '—'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Teléfono</label>
                  <input className="erp-input" readOnly value={detalle.telefono || '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Pedido</label>
                  <input className="erp-input" readOnly value={formatDate(detalle.fecha_pedido)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Entrega</label>
                  <input className="erp-input" readOnly value={detalle.fecha_entrega ? formatDate(detalle.fecha_entrega) : '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Tipo Entrega</label>
                  <input className="erp-input" readOnly value={labelTipoEntrega(detalle.tipo_entrega)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Método Pago</label>
                  <input className="erp-input" readOnly value={detalle.metodo_pago || '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Cód. Operación</label>
                  <input className="erp-input" readOnly value={detalle.codigo_operacion || '—'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Total Pedido</label>
                  <input className="erp-input" readOnly value={fmt(detalle.monto)} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: comprobanteUrl ? 'minmax(300px, 1fr) 280px' : '1fr', gap: '16px' }}>
            <div className="erp-form-section">
              <h3 className="erp-form-section-title">Artículos del Pedido</h3>
              <div style={{ border: '1px solid var(--erp-border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--erp-bg-secondary)', borderBottom: '1px solid var(--erp-border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Producto</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cant.</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>P. Unit.</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.detalle?.length ? (
                      detalle.detalle.map(d => (
                        <tr key={d.id_detalle_pedido} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {resolveImageUrl(d.ruta_imagen) ? (
                                <img src={resolveImageUrl(d.ruta_imagen)!} alt={d.producto} style={{ width: '28px', height: '28px', objectFit: 'cover', border: '1px solid var(--erp-border)' }} />
                              ) : (
                                <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--erp-bg-secondary)', border: '1px solid var(--erp-border)', color: 'var(--erp-text-muted)' }}><FiPackage /></span>
                              )}
                              <div>
                                <strong>{d.producto}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{d.codigo}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{d.cantidad}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(d.precio_venta)}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                            <strong>{fmt(d.cantidad * d.precio_venta)}</strong>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Sin artículos</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {comprobanteUrl && (
              <div className="erp-form-section">
                <h3 className="erp-form-section-title"><FiImage style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Comprobante Adjunto</h3>
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: '1px solid var(--erp-border)', padding: '4px', cursor: 'pointer' }}
                    onClick={() => setLightboxUrl(comprobanteUrl)}
                    title="Ver en pantalla completa"
                  >
                    <img src={comprobanteUrl} alt="Comprobante de pago" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '11px', color: 'var(--erp-accent)', marginTop: '4px' }}>Clic para ampliar</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actualización de Estado */}
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              {formMode === 'edit' ? 'Actualizar Estado del Pedido' : 'Estado del Pedido'}
            </h3>
            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado actual</label>
                  <div className="erp-form-status-value">
                    <StatusBadge
                      label={estadoLabel(detalle.estado_pedido, detalle.estado_pedido_nombre)}
                      tone={estadoTone(detalle.estado_pedido)}
                      status={estadoLabel(detalle.estado_pedido, detalle.estado_pedido_nombre)}
                      showText
                    />
                  </div>
                </div>
                {formMode === 'edit' && (
                  <div className="erp-form-group">
                    <label className="erp-form-label">Nuevo estado</label>
                    <select
                      className="erp-input"
                      value={nuevoEstado}
                      onChange={e => setNuevoEstado(Number(e.target.value))}
                    >
                      {estadosDisponibles.map(([id, item]) => (
                        <option key={id} value={id}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {formMode === 'edit' && (
            <div className="erp-form-actions">
              <button
                type="submit"
                className="erp-btn erp-btn-primary"
                disabled={saving}
              >
                <FiSave />
                <span>{saving ? 'Guardando...' : 'Guardar Estado'}</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        <ERPEmptySelection
          icon={<FiShoppingBag />}
          title="Ningún pedido seleccionado"
          description="Seleccione un pedido en la pestaña Registros para ver o gestionar su estado y comprobantes."
          onBack={() => setActiveTab('list')}
          backLabel="Ir a Registros de Pedidos"
        />
      )}

      {lightboxUrl && (
        <div
          className="pedido-lightbox"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="pedido-lightbox-close"
            onClick={() => setLightboxUrl(null)}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
          <img
            src={lightboxUrl}
            alt="Comprobante ampliado"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  return (
    <SubmoduleTwoTabsLayout
      title="Pedidos Recibidos"
      subtitle="Gestiona los pedidos de la tienda virtual, validación de comprobantes y despachos"
      entityName="Pedido"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode={formMode}
      listContent={listContent}
      formContent={formContent}
    />
  );
};

export default PedidosSection;
