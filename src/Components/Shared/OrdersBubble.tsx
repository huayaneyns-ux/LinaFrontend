import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { PedidoService } from '../../Services/Admin/Ventas/Pedido';
import type { PedidoSelectDto } from '../../Types/Admin/Ventas/Pedido';
import PedidoDetalleModal from './PedidoDetalleModal';
import { FiTruck, FiClock, FiCheckCircle, FiChevronRight, FiPackage } from 'react-icons/fi';
import { getNumericUserId } from '../../Utils/auth';
import '../../Styles/Components/OrdersBubble.css';

const ESTADOS: Record<number, { label: string; clase: string }> = {
  1: { label: 'Pendiente', clase: 'badge-warning' },
  2: { label: 'Rechazado', clase: 'badge-danger' },
  3: { label: 'Aprobado', clase: 'badge-info' },
  4: { label: 'Alistando', clase: 'badge-info' },
  5: { label: 'En Camino', clase: 'badge-primary' },
  6: { label: 'Listo p/ Recoger', clase: 'badge-primary' },
  7: { label: 'Entregado', clase: 'badge-success' },
  8: { label: 'Cancelado', clase: 'badge-danger' },
};

const getEstadoBadge = (pedido: PedidoSelectDto) => {
  const info = ESTADOS[pedido.estado_pedido] || {
    label: pedido.estado_pedido_nombre || 'Pendiente',
    clase: 'badge-warning'
  };
  return (
    <span className={`orders-mini-badge ${info.clase}`}>
      {pedido.estado_pedido === 7 ? <FiCheckCircle size={11} /> : pedido.estado_pedido === 5 ? <FiTruck size={11} /> : <FiClock size={11} />}
      {' '}{info.label}
    </span>
  );
};

export const OrdersBubble: React.FC = () => {
  const { usuario, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoSelectDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const numericUserId = getNumericUserId(usuario) ?? 0;

  const fetchUserPedidos = async () => {
    if (!isAuthenticated || !usuario) return;
    setLoading(true);
    try {
      const all = await PedidoService.getPedidos();
      const userList = all.filter(p => {
        if (numericUserId && p.id_cliente === numericUserId) return true;
        const cName = (p.cliente || '').toLowerCase();
        const uName = (usuario.nombres || '').toLowerCase();
        return cName.includes(uName);
      });
      setPedidos(userList);
    } catch {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPedidos();
      const interval = setInterval(fetchUserPedidos, 30000); // polling auto-refresh
      return () => clearInterval(interval);
    } else {
      setPedidos([]);
    }
  }, [isAuthenticated, usuario]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="orders-bubble-wrapper" ref={bubbleRef}>
      <button
        className="icon-btn orders-bubble-btn"
        onClick={() => {
          setOpen(prev => !prev);
          if (!open) fetchUserPedidos();
        }}
        title="Mis Pedidos Recientes"
      >
        <FiTruck size={20} />
        {pedidos.length > 0 && <span className="orders-badge">{pedidos.length}</span>}
      </button>

      {open && (
        <div className="orders-popover fade-in">
          <div className="popover-header">
            <h4><FiTruck /> Mis Pedidos</h4>
            <span className="popover-count">{pedidos.length} pedido(s)</span>
          </div>

          <div className="popover-body">
            {loading ? (
              <p className="popover-loading">Cargando pedidos...</p>
            ) : pedidos.length === 0 ? (
              <div className="popover-empty">
                <FiPackage size={30} />
                <p>No tienes pedidos registrados.</p>
              </div>
            ) : (
              <ul className="orders-mini-list">
                {pedidos.slice(0, 5).map(p => (
                  <li
                    key={p.id_pedido}
                    className="orders-mini-item"
                    onClick={() => {
                      setSelectedPedidoId(p.id_pedido);
                      setOpen(false);
                    }}
                  >
                    <div className="item-top">
                      <strong>Pedido #{p.id_pedido}</strong>
                      {getEstadoBadge(p)}
                    </div>
                    <div className="item-bottom">
                      <span className="item-date">
                        {p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString() : ''}
                      </span>
                      {p.monto != null && (
                        <span className="item-monto">S/ {p.monto.toFixed(2)}</span>
                      )}
                      <FiChevronRight className="item-arrow" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {selectedPedidoId !== null && (
        <PedidoDetalleModal
          idPedido={selectedPedidoId}
          onClose={() => setSelectedPedidoId(null)}
        />
      )}
    </div>
  );
};

export default OrdersBubble;
