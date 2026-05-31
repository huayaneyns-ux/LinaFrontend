import { mockUsuarios } from '../../Constantes/Data/MockData';
import './AdminStyles.css';

const Usuarios = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Administración de Usuarios</h1>
        <button className="btn btn-primary">Registrar Trabajador</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Nombres y Apellidos</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockUsuarios.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.nombres} {user.apellidos}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge-admin ${
                      user.rol === 'ADMINISTRADOR' ? 'badge-danger' : 
                      user.rol === 'TRABAJADOR' ? 'badge-info' : 'badge-success'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: '0.8rem'}}>Configurar</button>
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

export default Usuarios;
