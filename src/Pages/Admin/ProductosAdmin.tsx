import { mockProductos } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const ProductosAdmin = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Catálogo de Productos</h1>
        <button className="btn btn-primary">Nuevo Producto</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockProductos.map(prod => (
                <tr key={prod.id}>
                  <td>{prod.codigo}</td>
                  <td>
                    <img src={prod.imagenUrl} alt={prod.nombre} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                  </td>
                  <td>{prod.nombre}</td>
                  <td>{prod.categoria}</td>
                  <td>S/ {prod.precio.toFixed(2)}</td>
                  <td>
                    <span className={`badge-admin ${prod.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                      {prod.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: '0.8rem'}}>Editar</button>
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

export default ProductosAdmin;
