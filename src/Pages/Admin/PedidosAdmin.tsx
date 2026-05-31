import { mockPedidos } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const PedidosAdmin = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Gestión de Pedidos</h1>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Estado Actual</th>
                <th>Total</th>
                <th>Pendiente Pago</th>
                <th>Acción</th>
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
                  <td className={pedido.pagoPendiente > 0 ? 'text-danger' : 'text-success'}>
                    S/ {pedido.pagoPendiente.toFixed(2)}
                  </td>
                  <td>
                    <select defaultValue={pedido.estado} className="btn btn-outline" style={{padding: '5px 10px', fontSize: '0.85rem'}}>
                      <option value="PENDIENTE_REVISION">Pendiente de Revisión</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="ENTREGADO">Entregado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PedidosAdmin;
