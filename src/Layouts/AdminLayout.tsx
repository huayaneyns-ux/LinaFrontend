import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { 
  FiHome, FiDollarSign, FiPackage, FiMonitor, 
  FiShoppingCart, FiTruck, FiUsers, FiBox, FiArchive, FiLogOut 
} from 'react-icons/fi';
import '../Styles/Layouts/AdminLayout.css';

const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Intranet Lina</h2>
          <p>Hola, {usuario?.nombres}</p>
          <span className="badge-rol">{usuario?.rol}</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><NavLink to="/admin" end><FiMonitor /> Dashboard</NavLink></li>
            <li><NavLink to="/admin/caja"><FiDollarSign /> Caja</NavLink></li>
            <li><NavLink to="/admin/ventas"><FiShoppingCart /> Ventas</NavLink></li>
            <li><NavLink to="/admin/pedidos"><FiPackage /> Pedidos</NavLink></li>
            <li><NavLink to="/admin/compras"><FiShoppingCart /> Compras</NavLink></li>
            <li><NavLink to="/admin/abastecer"><FiTruck /> Abastecer</NavLink></li>
            <li><NavLink to="/admin/proveedores"><FiUsers /> Proveedores</NavLink></li>
            <li><NavLink to="/admin/productos"><FiBox /> Productos</NavLink></li>
            
            <li className="nav-section">Inventario</li>
            <li><NavLink to="/admin/inventario/stock"><FiArchive /> Stock</NavLink></li>
            <li><NavLink to="/admin/inventario/movimientos"><FiArchive /> Movimientos</NavLink></li>
            <li><NavLink to="/admin/inventario/kardex"><FiArchive /> Kardex</NavLink></li>

            {usuario?.rol === 'ADMINISTRADOR' && (
              <>
                <li className="nav-section">Administración</li>
                <li><NavLink to="/admin/usuarios"><FiUsers /> Usuarios</NavLink></li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-outline btn-block" onClick={() => navigate('/')}>
            <FiHome /> Ir a tienda
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
