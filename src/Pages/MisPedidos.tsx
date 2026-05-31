import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { mockPedidos } from '../Constantes/Data/MockData';
import { FiPackage, FiClock, FiCheckCircle, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import '../Styles/Pages/MisPedidos.css';

const MisPedidos = () => {
  const { usuario } = useAuth();
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);
  
  const pedidos = mockPedidos.filter(p => p.clienteId === usuario?.id);

  const toggleExpandir = (id: string) => {
    if (pedidoExpandido === id) {
      setPedidoExpandido(null);
    } else {
      setPedidoExpandido(id);
    }
  };

  const renderEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'ENTREGADO':
        return <span className="badge badge-success"><FiCheckCircle /> Entregado</span>;
      case 'EN_PROCESO':
        return <span className="badge badge-warning"><FiClock /> En Proceso</span>;
      case 'PENDIENTE_PAGO':
      case 'PENDIENTE_REVISION':
        return <span className="badge badge-danger">Pendiente de Revisión</span>;
      default:
        return <span className="badge">{estado}</span>;
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

      {pedidos.length === 0 ? (
        <div className="empty-pedidos">
          <FiPackage size={50} />
          <h2>Aún no tienes pedidos</h2>
          <p>Tus pedidos aparecerán aquí una vez que realices una compra.</p>
          <a href="/catalogo" className="btn btn-primary">Ir al catálogo</a>
        </div>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div 
                className="pedido-header-card" 
                onClick={() => toggleExpandir(pedido.id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h3>Pedido: {pedido.codigo}</h3>
                  <p className="pedido-fecha">
                    Fecha: {new Date(pedido.fecha).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="pedido-estado">
                    {renderEstadoBadge(pedido.estado)}
                  </div>
                  {pedidoExpandido === pedido.id ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                </div>
              </div>
              
              <div className="pedido-body-card">
                <div className="pedido-info-col">
                  <h4>Detalles de Entrega</h4>
                  <p><strong>Tipo:</strong> {pedido.tipoEntrega.replace('_', ' ')}</p>
                  <p><strong>Tiempo estimado:</strong> {pedido.tiempoEstimadoEntrega}</p>
                </div>
                
                <div className="pedido-pago-col">
                  <h4>Resumen de Pago</h4>
                  <p><strong>Total:</strong> S/ {pedido.total.toFixed(2)}</p>
                  <p className={pedido.pagoPendiente > 0 ? 'text-danger' : 'text-success'}>
                    <strong>Pago pendiente:</strong> S/ {pedido.pagoPendiente.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Detalle Expandible de Productos */}
              {pedidoExpandido === pedido.id && (
                <div className="pedido-detalles-expandido fade-in">
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
                      {pedido.detalles.map((det: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <div className="detalle-prod-info">
                              <img src={det.producto.imagenUrl} alt={det.producto.nombre} />
                              <span>{det.producto.nombre}</span>
                            </div>
                          </td>
                          <td>{det.cantidad}</td>
                          <td>S/ {det.precioUnitario.toFixed(2)}</td>
                          <td>S/ {det.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
