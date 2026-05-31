import './AdminStyles.css';

const Proveedores = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Directorio de Proveedores</h1>
        <button className="btn btn-primary">Añadir Proveedor</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>RUC</th>
                <th>Razón Social</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20123456789</td>
                <td>Distribuidora Comercial S.A.</td>
                <td>Carlos Mendoza</td>
                <td>999 888 777</td>
                <td>
                  <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: '0.8rem'}}>Editar</button>
                </td>
              </tr>
              <tr>
                <td>20987654321</td>
                <td>Librerías Unidas EIRL</td>
                <td>Ana Soto</td>
                <td>911 222 333</td>
                <td>
                  <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: '0.8rem'}}>Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Proveedores;
