import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { PedidoService } from '../Services/Admin/Ventas/Pedido';
import { resolveImageUrl } from '../Utils/imageUtils';
import type { PedidoSelectDto, PedidoSelectIdDto } from '../Types/Admin/Ventas/Pedido';
import {
  FiPackage, FiClock, FiCheckCircle, FiChevronDown, FiChevronUp,
  FiUser, FiAlertCircle, FiTruck, FiShoppingBag, FiImage
} from 'react-icons/fi';
import PedidoDetalleModal from '../Components/Shared/PedidoDetalleModal';
import { getNumericUserId } from '../Utils/auth';
import '../Styles/Pages/MisPedidos.css';

// Mapa de estados
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

const getEstadoInfo = (pedido: PedidoSelectDto) => {
  if (pedido.estado_pedido && ESTADOS[pedido.estado_pedido]) {
    return ESTADOS[pedido.estado_pedido];
  }
  const nombre = pedido.estado_pedido_nombre?.toUpperCase() ?? '';
  if (nombre.includes('ENTREGADO') || nombre === '7') return ESTADOS[7];
  if (nombre.includes('CANCELADO') || nombre === '8') return ESTADOS[8];
  if (nombre.includes('CAMINO') || nombre === '5') return ESTADOS[5];
  if (nombre.includes('RECOGER') || nombre === '6') return ESTADOS[6];
  if (nombre.includes('APROBADO') || nombre === '3') return ESTADOS[3];
  if (nombre.includes('ALISTANDO') || nombre === '4') return ESTADOS[4];
  if (nombre.includes('RECHAZADO') || nombre === '2') return ESTADOS[2];
  return ESTADOS[1];
};

const renderEstadoBadge = (pedido: PedidoSelectDto) => {
  const { label, clase } = getEstadoInfo(pedido);
  return (
    <span className={`badge ${clase}`}>
      {pedido.estado_pedido === 7 ? <FiCheckCircle /> : pedido.estado_pedido === 5 ? <FiTruck /> : <FiClock />}
      {' '}{label}
    </span>
  );
};

const MisPedidos = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidoModalId, setPedidoModalId] = useState<number | null>(null);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [detallesMap, setDetallesMap] = useState<Record<number, PedidoSelectIdDto>>({});
  const [loadingDetalle, setLoadingDetalle] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) {
      setLoading(false);
      return;
    }
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const todos = await PedidoService.getPedidos();
        const numericUserId = getNumericUserId(usuario) ?? 0;
        const propios = todos.filter(p => {
          if (numericUserId && p.id_cliente === numericUserId) return true;
          const clienteNombre = (p.cliente ?? '').toLowerCase();
          return clienteNombre.includes((usuario.nombres || '').toLowerCase()) ||
                 clienteNombre.includes((usuario.apellidos || '').toLowerCase());
        });
        setPedidos(propios);
      } catch {
        setError('No se pudo cargar el historial de pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [usuario]);

  const toggleExpandir = async (id: number) => {
    if (pedidoExpandido === id) {
      setPedidoExpandido(null);
      return;
    }
    setPedidoExpandido(id);
    if (!detallesMap[id]) {
      setLoadingDetalle(id);
      try {
        const detalle = await PedidoService.getPedidoById(id);
        setDetallesMap(prev => ({ ...prev, [id]: detalle }));
      } catch {
        // no bloqueamos, solo mostramos sin detalle
      } finally {
        setLoadingDetalle(null);
      }
    }
  };

  if (!usuario) {
    return (
      <div className="mis-pedidos-page container">
        <div className="pedidos-header">
          <h1><FiPackage /> Mis Pedidos</h1>
        </div>
        <div className="empty-pedidos">
          <FiUser size={50} />
          <h2>Inicia sesión para ver tus pedidos</h2>
          <p>Debes ingresar a tu cuenta para ver el historial y estado de tus compras.</p>
          <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-page container">
      <div className="pedidos-header">
        <h1><FiPackage /> Mis Pedidos</h1>
        <p>Revisa el historial y estado de tus compras.</p>
      </div>

      {loading && (
        <div className="pedidos-loading">
          <FiClock size={32} />
          <p>Cargando tus pedidos...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pedidos-error">
          <FiAlertCircle size={20} /> {error}
        </div>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <div className="empty-pedidos">
          <FiShoppingBag size={50} />
          <h2>Aún no tienes pedidos</h2>
          <p>Tus pedidos aparecerán aquí una vez que realices una compra.</p>
          <a href="/catalogo" className="btn btn-primary">Ir al catálogo</a>
        </div>
      )}

      {!loading && pedidos.length > 0 && (
        <div className="pedidos-lista">
          {pedidos.map(pedido => {
            const detalle = detallesMap[pedido.id_pedido];
            const estaExpandido = pedidoExpandido === pedido.id_pedido;
            const cargandoDetalle = loadingDetalle === pedido.id_pedido;
            const comprobante = resolveImageUrl(pedido.ruta_comprobante);

            return (
              <div key={pedido.id_pedido} className="pedido-card">
                <div
                  className="pedido-header-card"
                  onClick={() => toggleExpandir(pedido.id_pedido)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <h3>Pedido #{pedido.id_pedido}</h3>
                    <p className="pedido-fecha">
                      Fecha: {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="pedido-estado">
                      {renderEstadoBadge(pedido)}
                    </div>
                    {estaExpandido ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                  </div>
                </div>

                <div className="pedido-body-card">
                  <div className="pedido-info-col">
                    <h4>Detalles de Entrega</h4>
                    <p>
                      <strong>Tipo:</strong>{' '}
                      {pedido.tipo_entrega === 'RECOJO_TIENDA' ? 'Recojo en Tienda' : 'Envío a Domicilio'}
                    </p>
                  </div>
                  <div className="pedido-pago-col">
                    <h4>Pago</h4>
                    {pedido.metodo_pago && <p><strong>Método:</strong> {pedido.metodo_pago}</p>}
                    {pedido.monto != null && (
                      <p><strong>Monto:</strong> S/ {pedido.monto.toFixed(2)}</p>
                    )}
                    {pedido.codigo_operacion && (
                      <p><strong>Operación:</strong> {pedido.codigo_operacion}</p>
                    )}
                  </div>
                </div>

                {/* Comprobante de pago */}
                {comprobante && (
                  <div className="pedido-comprobante">
                    <h4><FiImage /> Comprobante de Pago</h4>
                    <a href={comprobante} target="_blank" rel="noopener noreferrer">
                      <img src={comprobante} alt="Comprobante de pago" className="comprobante-img" />
                    </a>
                  </div>
                )}

                {/* Detalle expandible */}
                {estaExpandido && (
                  <div className="pedido-detalles-expandido fade-in">
                    {cargandoDetalle ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando detalle...</p>
                    ) : detalle?.detalle ? (
                      <>
                        <h4>Productos Solicitados</h4>
                        <table className="tabla-detalles">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cant.</th>
                              <th>P. Unitario</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detalle.detalle.map((det) => {
                              const imgDetalle = resolveImageUrl(det.ruta_imagen);
                              return (
                                <tr key={det.id_detalle_pedido}>
                                  <td>
                                    <div className="detalle-prod-info">
                                      {imgDetalle ? (
                                        <img src={imgDetalle} alt={det.producto} />
                                      ) : (
                                        <div className="detalle-prod-placeholder"><FiPackage /></div>
                                      )}
                                      <span>{det.producto}</span>
                                    </div>
                                  </td>
                                  <td>{det.cantidad}</td>
                                  <td>S/ {det.precio_venta.toFixed(2)}</td>
                                  <td>S/ {(det.cantidad * det.precio_venta).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No se pudo cargar el detalle de productos.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pedidoModalId !== null && (
        <PedidoDetalleModal
          idPedido={pedidoModalId}
          onClose={() => setPedidoModalId(null)}
        />
      )}
    </div>
  );
};

export default MisPedidos;
