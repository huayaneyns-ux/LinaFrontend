import { useState, useEffect, useMemo, useCallback } from 'react';
import { PedidoService } from '../../../../Services/Admin/Ventas/Pedido';
import { resolveImageUrl } from '../../../../Utils/imageUtils';
import type { PedidoSelectDto, PedidoSelectIdDto } from '../../../../Types/Admin/Ventas/Pedido';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import IconButton from '../../../../Components/ERP/IconButton';
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
} from 'react-icons/fi';
import './PedidosSection.css';

const ESTADOS: Record<number, { label: string; tone: string }> = {
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

const estadoTone = (codigo?: number | null) => ESTADOS[Number(codigo) || 0]?.tone || 'warning';

interface PedidoFilters {
  estado: string;
  tipoEntrega: string;
}

type DialogMode = 'view' | 'estado' | null;

const DEFAULT_FILTERS: PedidoFilters = { estado: '', tipoEntrega: '' };

const PedidosSection = () => {
  const [pedidos, setPedidos] = useState<PedidoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detalle, setDetalle] = useState<PedidoSelectIdDto | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState(1);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [filters, setFilters] = useState<PedidoFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

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

  const closeDialog = () => {
    setDialogMode(null);
    setDetalle(null);
    setError(null);
  };

  const openPedidoDialog = async (mode: 'view' | 'estado', record: PedidoSelectDto) => {
    setSuccessMsg(null);
    setError(null);
    setSaving(true);
    setDialogMode(mode);
    setDetalle(null);
    try {
      const detail = await PedidoService.getPedidoById(record.id_pedido);
      // Si el detalle no trae id, conservar el de la lista
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
      setDialogMode(null);
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

  const handleCambiarEstado = async () => {
    if (!detalle) return;
    if (nuevoEstado === Number(detalle.estado_pedido)) {
      closeDialog();
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
        closeDialog();
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
          <div className="pedido-cell-main">{row.cliente || '—'}</div>
          <div className="pedido-cell-sub">Tel: {row.telefono || '—'}</div>
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
          <div className="pedido-cell-sub">{row.metodo_pago || '—'}</div>
        </div>
      ),
    },
    {
      key: 'monto',
      header: 'Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: PedidoSelectDto) => fmt(row.monto),
    },
    {
      key: 'estado_pedido',
      header: 'Estado',
      sortable: true,
      width: '190px',
      render: (row: PedidoSelectDto) => {
        const codigo = Number(row.estado_pedido) || 0;
        return (
          <span className={`pedido-estado-badge pedido-estado-badge--${estadoTone(codigo)}`}>
            {estadoLabel(codigo, row.estado_pedido_nombre)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '90px',
      render: (row: PedidoSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton
            icon={<FiEye />}
            tooltip="Ver pedido"
            variant="primary"
            onClick={() => openPedidoDialog('view', row)}
          />
          <IconButton
            icon={<FiRefreshCw />}
            tooltip="Cambiar estado"
            variant="warning"
            onClick={() => openPedidoDialog('estado', row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pedidos-section">
      {error && !dialogMode && (
        <div className="pedidos-alert pedidos-alert-error">{error}</div>
      )}
      {successMsg && (
        <div className="pedidos-alert pedidos-alert-success">{successMsg}</div>
      )}

      <div className="erp-indicators-grid" style={{ marginBottom: '12px' }}>
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
            <span className="erp-indicator-label">Total recaudado</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por ID, cliente o teléfono..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div className="pedidos-filter-panel">
            <div className="erp-form-group" style={{ margin: 0 }}>
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado}
                onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                {Object.entries(ESTADOS).map(([id, item]) => (
                  <option key={id} value={id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group" style={{ margin: 0 }}>
              <label className="erp-form-label">Entrega</label>
              <select
                className="erp-input"
                value={filters.tipoEntrega}
                onChange={e => setFilters(prev => ({ ...prev, tipoEntrega: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card pedidos-table-card">
        {loading ? (
          <div className="pedidos-loading">Cargando pedidos...</div>
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

      {/* Ver detalle */}
      <CrudDialog
        isOpen={dialogMode === 'view'}
        mode="view"
        onClose={closeDialog}
        onConfirm={closeDialog}
        loading={saving && !detalle}
        title={detalle ? `Pedido #${detalle.id_pedido}` : 'Detalle del pedido'}
        subtitle="Cabecera y detalle de artículos"
        size="lg"
        confirmLabel="Cerrar"
      >
        {detalle && (
          <div className="pedido-dialog">
            <div className="pedido-dialog-header">
              <div>
                <span>Cliente</span>
                <strong>{detalle.cliente || '—'}</strong>
                <em>{detalle.telefono || '—'}</em>
              </div>
              <div>
                <span>Fecha pedido</span>
                <strong>{formatDate(detalle.fecha_pedido)}</strong>
              </div>
              <div>
                <span>Fecha entrega</span>
                <strong>{detalle.fecha_entrega ? formatDate(detalle.fecha_entrega) : '—'}</strong>
              </div>
              <div>
                <span>Tipo entrega</span>
                <strong>{labelTipoEntrega(detalle.tipo_entrega)}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>
                  <span className={`pedido-estado-badge pedido-estado-badge--${estadoTone(detalle.estado_pedido)}`}>
                    {estadoLabel(detalle.estado_pedido, detalle.estado_pedido_nombre)}
                  </span>
                </strong>
              </div>
              <div>
                <span>Total</span>
                <strong className="pedido-dialog-total">{fmt(detalle.monto)}</strong>
              </div>
              <div>
                <span>IGV</span>
                <strong>{fmt(detalle.igv)}</strong>
              </div>
              <div>
                <span>Método de pago</span>
                <strong>{detalle.metodo_pago || '—'}</strong>
              </div>
              <div>
                <span>Cód. operación</span>
                <strong>{detalle.codigo_operacion || '—'}</strong>
              </div>
            </div>

            <h4 className="pedido-dialog-title">Artículos</h4>
            <div className="pedido-dialog-table-wrap">
              <table className="pedido-detail-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">P. Unit.</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalle?.length ? (
                    detalle.detalle.map(d => (
                      <tr key={d.id_detalle_pedido}>
                        <td>
                          <div className="pedido-prod-cell">
                            {resolveImageUrl(d.ruta_imagen) ? (
                              <img src={resolveImageUrl(d.ruta_imagen)!} alt={d.producto} />
                            ) : (
                              <span className="pedido-prod-ph"><FiPackage /></span>
                            )}
                            <div>
                              <strong>{d.producto}</strong>
                              <span>{d.codigo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{d.cantidad}</td>
                        <td className="text-right">{fmt(d.precio_venta)}</td>
                        <td className="text-right">
                          <strong>{fmt(d.cantidad * d.precio_venta)}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="pedido-empty-row">Sin artículos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CrudDialog>

      {/* Cambiar estado */}
      <CrudDialog
        isOpen={dialogMode === 'estado'}
        mode="edit"
        onClose={closeDialog}
        onConfirm={handleCambiarEstado}
        loading={saving}
        title={detalle ? `Cambiar estado — Pedido #${detalle.id_pedido}` : 'Cambiar estado'}
        subtitle="Revise el total y el comprobante antes de actualizar"
        size="lg"
        confirmLabel="Guardar estado"
        cancelLabel="Cancelar"
      >
        {error && dialogMode === 'estado' && (
          <div className="pedidos-alert pedidos-alert-error">{error}</div>
        )}

        {detalle && (
          <div className="pedido-estado-dialog">
            <div className="pedido-estado-layout">
              <div className="pedido-estado-left">
                <div className="pedido-estado-summary">
                  <div>
                    <span>Cliente</span>
                    <strong>{detalle.cliente || '—'}</strong>
                  </div>
                  <div>
                    <span>Total del pedido</span>
                    <strong className="pedido-dialog-total">{fmt(detalle.monto)}</strong>
                  </div>
                  <div>
                    <span>Método de pago</span>
                    <strong>{detalle.metodo_pago || '—'}</strong>
                  </div>
                  <div>
                    <span>Cód. operación</span>
                    <strong>{detalle.codigo_operacion || '—'}</strong>
                  </div>
                </div>

                <div className="pedido-estado-box">
                  <div className="pedido-estado-box-current">
                    <span>Estado actual</span>
                    <span className={`pedido-estado-badge pedido-estado-badge--${estadoTone(detalle.estado_pedido)}`}>
                      {estadoLabel(detalle.estado_pedido, detalle.estado_pedido_nombre)}
                    </span>
                  </div>
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
              </div>

              <div className="pedido-estado-right">
                <h4><FiImage /> Comprobante</h4>
                {comprobanteUrl ? (
                  <button
                    type="button"
                    className="pedido-comprobante-btn"
                    onClick={() => setLightboxUrl(comprobanteUrl)}
                    title="Ver en pantalla completa"
                  >
                    <img src={comprobanteUrl} alt="Comprobante de pago" />
                    <span>Clic para ampliar</span>
                  </button>
                ) : (
                  <p className="pedido-empty-hint">Sin comprobante adjunto</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CrudDialog>

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
};

export default PedidosSection;
