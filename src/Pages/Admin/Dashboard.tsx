import { mockProductos, mockPedidos } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const Dashboard = () => {
  const ventasHoy = mockPedidos.filter(p => p.estado === 'ENTREGADO').reduce((acc, p) => acc + p.total, 0);
  const pedidosPendientes = mockPedidos.filter(p => p.estado !== 'ENTREGADO').length;
  
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Dashboard General</h1>
      </div>

      <div className="admin-grid-3">
        <div className="metric-card">
          <span className="metric-title">Ventas del Día</span>
          <span className="metric-value">S/ {ventasHoy.toFixed(2)}</span>
        </div>
        <div className="metric-card" style={{borderLeftColor: 'var(--secondary)'}}>
          <span className="metric-title">Pedidos Pendientes</span>
          <span className="metric-value">{pedidosPendientes}</span>
        </div>
        <div className="metric-card" style={{borderLeftColor: '#38a169'}}>
          <span className="metric-title">Productos Activos</span>
          <span className="metric-value">{mockProductos.length}</span>
        </div>
      </div>

      <div className="admin-card" style={{marginTop: '40px'}}>
        <h2>Actividad Reciente</h2>
        <div className="admin-table-container" style={{marginTop: '20px'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {mockPedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td><strong>{pedido.codigo}</strong></td>
                  <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge-admin ${pedido.estado === 'ENTREGADO' ? 'badge-success' : 'badge-warning'}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td>S/ {pedido.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
