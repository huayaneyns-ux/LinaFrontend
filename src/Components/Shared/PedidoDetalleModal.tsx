import React, { useState, useEffect } from 'react';
import { PedidoService } from '../../Services/Admin/Ventas/Pedido';
import type { PedidoSelectIdDto } from '../../Types/Admin/Ventas/Pedido';
import { resolveImageUrl } from '../../Utils/imageUtils';
import {
  FiX, FiCheckCircle, FiClock, FiTruck, FiAlertCircle, FiImage
} from 'react-icons/fi';
import '../../Styles/Components/PedidoDetalleModal.css';

interface Props {
  idPedido: number;
  onClose: () => void;
}

const ESTADOS: Record<number, { label: string; clase: string }> = {
  1: { label: 'Pendiente de Validación', clase: 'badge-warning' },
  2: { label: 'Pago Rechazado', clase: 'badge-danger' },
  3: { label: 'Pago Aprobado', clase: 'badge-info' },
  4: { label: 'Alistando', clase: 'badge-info' },
  5: { label: 'En Camino', clase: 'badge-primary' },
  6: { label: 'Listo para Recoger', clase: 'badge-primary' },
  7: { label: 'Entregado', clase: 'badge-success' },
  8: { label: 'Cancelado', clase: 'badge-danger' },
};

const renderEstadoBadge = (estadoNum: number, estadoNombre?: string) => {
  const info = ESTADOS[estadoNum] || {
    label: estadoNombre || 'Pendiente',
    clase: 'badge-warning',
  };

  return (
    <span className={`voucher-status-badge ${info.clase}`}>
      {estadoNum === 7 ? <FiCheckCircle /> : estadoNum === 5 ? <FiTruck /> : <FiClock />}
      {' '}{info.label}
    </span>
  );
};

export const PedidoDetalleModal: React.FC<Props> = ({ idPedido, onClose }) => {
  const [pedido, setPedido] = useState<PedidoSelectIdDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVoucherZoom, setShowVoucherZoom] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    PedidoService.getPedidoById(idPedido)
      .then(data => {
        if (isMounted) {
          setPedido(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudo cargar el ticket del pedido.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [idPedido]);

  const comprobanteUrl = pedido?.ruta_comprobante ? resolveImageUrl(pedido.ruta_comprobante) : null;

  // Totales
  const items = pedido?.detalle || [];
  const subtotalCalc = items.reduce((sum, item) => sum + (item.cantidad * item.precio_venta), 0);
  const totalMonto = pedido?.monto ?? subtotalCalc;
  const subtotalBase = totalMonto / 1.18;
  const igvCalc = totalMonto - subtotalBase;

  return (
    <div className="voucher-modal-overlay" onClick={onClose}>
      <div className="voucher-ticket-container" onClick={e => e.stopPropagation()}>
        <button className="voucher-close-btn" onClick={onClose} aria-label="Cerrar ticket">
          <FiX size={18} />
        </button>

        {loading ? (
          <div className="voucher-ticket-loading">
            <FiClock size={32} className="spin" />
            <p>Generando ticket #{idPedido}...</p>
          </div>
        ) : error || !pedido ? (
          <div className="voucher-ticket-error">
            <FiAlertCircle size={36} />
            <p>{error || 'Pedido no encontrado'}</p>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <div className="voucher-ticket">
            {/* Header del Ticket */}
            <div className="ticket-header">
              <div className="ticket-logo">📚 <strong>Librería Lina</strong></div>
              <p className="ticket-sub">Voucher de Pedido Recibido</p>
              <div className="ticket-code-row">
                <span className="ticket-number">N° PED-{pedido.id_pedido}</span>
                {renderEstadoBadge(pedido.estado_pedido, pedido.estado_pedido_nombre)}
              </div>
              <p className="ticket-date">
                {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="ticket-divider" />

            {/* Información General */}
            <div className="ticket-info-grid">
              <div className="ticket-info-line">
                <span className="info-label">Cliente:</span>
                <span className="info-val">{pedido.cliente || 'Cliente LINA'}</span>
              </div>
              {pedido.telefono && (
                <div className="ticket-info-line">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-val">{pedido.telefono}</span>
                </div>
              )}
              <div className="ticket-info-line">
                <span className="info-label">Entrega:</span>
                <span className="info-val">
                  {pedido.tipo_entrega === 'RECOJO_TIENDA' ? 'Recojo en Tienda' : 'Envío a Domicilio'}
                </span>
              </div>
              <div className="ticket-info-line">
                <span className="info-label">Pago:</span>
                <span className="info-val">{pedido.metodo_pago || 'Pago Registrado'}</span>
              </div>
              {pedido.codigo_operacion && (
                <div className="ticket-info-line">
                  <span className="info-label">Cod. Op:</span>
                  <span className="info-val">{pedido.codigo_operacion}</span>
                </div>
              )}
            </div>

            <div className="ticket-divider" />

            {/* Lista de Productos tipo Ticket */}
            <div className="ticket-items-section">
              <div className="ticket-items-head">
                <span>CANT / PRODUCTO</span>
                <span>TOTAL</span>
              </div>
              <div className="ticket-items-list">
                {items.length === 0 ? (
                  <p className="ticket-empty-msg">Sin productos</p>
                ) : (
                  items.map(item => (
                    <div key={item.id_detalle_pedido} className="ticket-item-row">
                      <div className="item-main">
                        <span className="item-qty">{item.cantidad}x</span>
                        <div className="item-name-block">
                          <span className="item-name">{item.producto}</span>
                          <span className="item-unit-price">S/ {item.precio_venta.toFixed(2)} c/u</span>
                        </div>
                      </div>
                      <span className="item-total-price">
                        S/ {(item.cantidad * item.precio_venta).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ticket-divider" />

            {/* Totales estilo Recibo */}
            <div className="ticket-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>S/ {subtotalBase.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>IGV (18%):</span>
                <span>S/ {igvCalc.toFixed(2)}</span>
              </div>
              <div className="total-row total-main">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {totalMonto.toFixed(2)}</span>
              </div>
            </div>

            {/* Adjunto Comprobante si existe */}
            {comprobanteUrl && (
              <>
                <div className="ticket-divider" />
                <div className="ticket-voucher-attachment">
                  <span className="attachment-label"><FiImage /> Comprobante de Pago</span>
                  <div className="attachment-box" onClick={() => setShowVoucherZoom(true)}>
                    <img src={comprobanteUrl} alt="Comprobante" className="attachment-img" />
                    <span className="attachment-hint">Clic para ampliar</span>
                  </div>
                </div>
              </>
            )}

            <div className="ticket-footer">
              <p>¡Gracias por elegir <strong>Librería Lina</strong>!</p>
              <span>Conserve este ticket para cualquier consulta</span>
            </div>
          </div>
        )}

        {showVoucherZoom && comprobanteUrl && (
          <div className="voucher-zoom-overlay" onClick={() => setShowVoucherZoom(false)}>
            <div className="voucher-zoom-content" onClick={e => e.stopPropagation()}>
              <button className="voucher-zoom-close" onClick={() => setShowVoucherZoom(false)}>
                <FiX size={24} />
              </button>
              <img src={comprobanteUrl} alt="Comprobante ampliado" className="voucher-full-img" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidoDetalleModal;
