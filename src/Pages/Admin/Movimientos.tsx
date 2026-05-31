import './AdminStyles.css';

const Movimientos = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Movimientos de Almacén</h1>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-05-20 10:30</td>
                <td><span className="badge-admin badge-success">ENTRADA</span></td>
                <td>Compra Proveedor F001-000456</td>
                <td>Cuaderno Cuadriculado A4</td>
                <td>+100</td>
                <td>maria.trabajo</td>
              </tr>
              <tr>
                <td>2026-05-21 09:15</td>
                <td><span className="badge-admin badge-danger">SALIDA</span></td>
                <td>Venta Pedido ORD-78901</td>
                <td>Cuaderno Cuadriculado A4</td>
                <td>-5</td>
                <td>admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
