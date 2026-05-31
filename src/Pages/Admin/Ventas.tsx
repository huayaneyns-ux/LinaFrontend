import { mockPedidos } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const Ventas = () => {
  const ventasFinalizadas = mockPedidos.filter(p => p.estado === 'ENTREGADO');

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Historial de Ventas</h1>
        <button className="btn btn-primary">Exportar Reporte</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código Pedido</th>
                <th>Fecha Emisión</th>
                <th>Cliente ID</th>
                <th>Tipo Entrega</th>
                <th>Total (S/)</th>
              </tr>
            </thead>
            <tbody>
              {ventasFinalizadas.map(venta => (
                <tr key={venta.id}>
                  <td><strong>{venta.codigo}</strong></td>
                  <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                  <td>{venta.clienteId}</td>
                  <td>{venta.tipoEntrega.replace('_', ' ')}</td>
                  <td>S/ {venta.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
