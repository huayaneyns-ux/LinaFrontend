import './AdminStyles.css';

const Compras = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Registro de Compras</h1>
        <button className="btn btn-primary">Nueva Compra</button>
      </div>

      <div className="admin-card">
        <p style={{color: 'var(--text-muted)'}}>Historial de facturas y boletas de compra a proveedores.</p>
        <div className="admin-table-container" style={{marginTop: '20px'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Comprobante</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>F001-000456</td>
                <td>2026-05-10</td>
                <td>Distribuidora Comercial S.A.</td>
                <td>S/ 1,250.00</td>
                <td><span className="badge-admin badge-success">Pagado</span></td>
              </tr>
              <tr>
                <td>B002-001234</td>
                <td>2026-05-15</td>
                <td>Librerías Unidas EIRL</td>
                <td>S/ 480.50</td>
                <td><span className="badge-admin badge-success">Pagado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compras;
