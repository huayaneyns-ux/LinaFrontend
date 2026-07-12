import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { mockPedidos } from '../Constantes/Data/MockData';
import {
  FiUser,
  FiShield,
  FiMail,
  FiPackage,
  FiShoppingCart,
  FiLogOut,
  FiSettings,
  FiLock,
} from 'react-icons/fi';
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
        navigate('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && usuario) {
    const isAdmin = usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'TRABAJADOR';
    const numPedidos = mockPedidos.filter(p => p.clienteId === usuario.id).length;

    return (
      <div className="login-page page-with-header dashboard-page">
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
                <p className="info-value">{usuario.email || '—'}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            {isAdmin && (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/admin')}>
                <FiSettings /> Panel de Administración
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={logout}>
              <FiLogOut /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page page-with-header">
      <div className="login-wrapper">
        <div className="login-brand">
          <span className="login-brand-icon">📚</span>
          <h1>Librería <strong>Lina</strong></h1>
          <p>Accede a tu cuenta para gestionar pedidos y compras.</p>
        </div>

        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
