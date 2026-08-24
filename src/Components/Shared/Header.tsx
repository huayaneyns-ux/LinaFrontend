import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../Context/CartContext';
import { useAuth } from '../../Context/AuthContext';
import SocialLinks from './SocialLinks';
import OrdersBubble from './OrdersBubble';
import '../../Styles/Components/Header.css';

const NAV_LINKS = [
  { path: '/', label: 'Inicio' },
  { path: '/catalogo', label: 'Catálogo' },
  { path: '/contacto', label: 'Contacto' },
];

const Header = () => {
  const { totalItems, addedProductId } = useCart();
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate(usuario?.rol !== 'CLIENTE' ? '/admin' : '/mis-pedidos');
    } else {
      navigate('/login');
    }
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className={`header${scrolled ? ' scrolled' : ' transparent'}`}>
      <div className="container header-container">
        <div className="header-logo">
          <Link to="/">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Librería <strong>Lina</strong></span>
          </Link>
        </div>

        <nav className="header-nav">
          <ul>
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <Link to={path} className={isActive(path) ? 'nav-link active' : 'nav-link'}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <SocialLinks variant="header" />

          {isAuthenticated && <OrdersBubble />}

          <button
            className={`icon-btn${addedProductId !== null ? ' cart-bump' : ''}`}
            onClick={() => navigate('/carrito')}
            title="Mi carrito"
          >
            <FiShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          <button className="user-btn" onClick={handleUserClick}>
            <FiUser size={18} />
            <span className="user-name">
              {isAuthenticated ? usuario?.nombres?.split(' ')[0] : 'Ingresar'}
            </span>
          </button>

          {isAuthenticated && (
            <button className="logout-btn" onClick={logout}>Salir</button>
          )}

          <button className="burger-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(({ path, label }) => (
            <Link key={path} to={path} className={isActive(path) ? 'mobile-link active' : 'mobile-link'}>
              {label}
            </Link>
          ))}
          <div className="mobile-social">
            <SocialLinks variant="inline" />
          </div>
          {isAuthenticated && (
            <button className="mobile-link mobile-logout" onClick={logout}>Cerrar sesión</button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
