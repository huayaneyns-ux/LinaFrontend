import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiPackage } from 'react-icons/fi';
import { useCart } from '../../Context/CartContext';
import { useAuth } from '../../Context/AuthContext';
import '../../Styles/Components/Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkHeroPage = ['/', '/nosotros', '/contacto'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserClick = () => {
    if (isAuthenticated) {
      if (usuario?.rol !== 'CLIENTE') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header scrolled shadow-md">
      <div className="container header-container">
        <div className="header-logo">
          <Link to="/">
            <h2>Librería Lina</h2>
          </Link>
        </div>

        <nav className="header-nav">
          <ul>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" onClick={() => navigate('/carrito')}>
            <FiShoppingCart size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          
          <button className="icon-btn" onClick={() => navigate('/mis-pedidos')} title="Mis Pedidos">
            <FiPackage size={24} />
          </button>

          <div className="user-menu">
            <button className="user-btn" onClick={handleUserClick}>
              <FiUser size={24} />
              <span className="user-name">
                {isAuthenticated ? usuario?.nombres : 'Iniciar sesión'}
              </span>
            </button>
            {isAuthenticated && (
              <button className="logout-btn" onClick={logout}>Salir</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
