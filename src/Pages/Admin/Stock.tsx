import { mockProductos } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const Stock = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Inventario: Stock Actual</h1>
        <button className="btn btn-outline">Imprimir Reporte</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Disponible</th>
                <th>Estado Stock</th>
              </tr>
            </thead>
            <tbody>
              {mockProductos.map(prod => (
                <tr key={prod.id}>
                  <td>{prod.codigo}</td>
                  <td>{prod.nombre}</td>
                  <td>{prod.categoria}</td>
                  <td style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{prod.stock}</td>
                  <td>
                    {prod.stock > 20 ? (
                      <span className="badge-admin badge-success">Óptimo</span>
                    ) : prod.stock > 0 ? (
                      <span className="badge-admin badge-warning">Bajo</span>
                    ) : (
                      <span className="badge-admin badge-danger">Agotado</span>
                    )}
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

export default Stock;
