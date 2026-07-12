import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { mockPedidos } from '../Constantes/Data/MockData';
import { FiUser, FiShield, FiMail, FiPackage, FiShoppingCart, FiLogOut, FiSettings } from 'react-icons/fi';
import '../Styles/Pages/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        // Redirigir al admin si no es cliente
        if (usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'TRABAJADOR') {
          navigate('/admin');
        } else {
          // Si es cliente, recargar o ir a inicio
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, mostramos su perfil
  if (isAuthenticated && usuario) {
    const isAdmin = usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'TRABAJADOR';
    const numPedidos = mockPedidos.filter(p => p.clienteId === usuario.id).length;
    
    // Aquí invocamos el hook dentro de la regla de Hooks (se hace al inicio pero lo desestructuramos)
    // Para no romper la regla, lo declaramos al inicio del componente
    return (
      <div className="login-page dashboard-page">
        <div className="dashboard-container fade-in">
          <div className="dashboard-header">
            <div className="dashboard-avatar">
              <FiUser size={50} />
            </div>
            <h2>Bienvenido, {usuario.nombres}</h2>
            <div className={`rol-badge ${isAdmin ? 'admin-badge' : 'cliente-badge'}`}>
              {isAdmin ? <FiShield /> : <FiUser />} {usuario.rol}
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card" onClick={() => navigate('/mis-pedidos')}>
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-info">
                <h3>{numPedidos}</h3>
                <p>Mis Pedidos</p>
              </div>
            </div>
            
            <div className="stat-card" onClick={() => navigate('/carrito')}>
              <div className="stat-icon"><FiShoppingCart /></div>
              <div className="stat-info">
                <h3>Ir al</h3>
                <p>Carrito</p>
              </div>
            </div>
          </div>

          <div className="dashboard-body">
            <div className="info-row">
              <FiUser className="info-icon" />
              <div>
                <p className="info-label">Usuario</p>
                <p className="info-value">{usuario.username}</p>
              </div>
            </div>
            <div className="info-row">
              <FiMail className="info-icon" />
              <div>
                <p className="info-label">Correo Electrónico</p>
                <p className="info-value">{usuario.email || 'correo@ejemplo.com'}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                <FiSettings /> Panel de Administración
              </button>
            )}
            <button className="btn btn-outline" onClick={logout}>
              <FiLogOut /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido a Librería Lina</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: juancliente, admin"
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa 123"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-help">
          <p>Cuentas de prueba (clave: 123):</p>
          <ul>
            <li><strong>juancliente</strong> (Cliente)</li>
            <li><strong>admin</strong> (Administrador)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
