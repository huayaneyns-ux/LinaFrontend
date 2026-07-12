import { Outlet, Link } from 'react-router-dom';
import Header from '../Components/Shared/Header';
import SocialLinks from '../Components/Shared/SocialLinks';
import TikTokFloat from '../Components/Shared/TikTokFloat';
import '../Styles/Layouts/PublicLayout.css';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container public-footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">📚 Librería <strong>Lina</strong></span>
            <p className="footer-tagline">Artículos escolares y de oficina con la mejor calidad.</p>
          </div>
          <nav className="footer-nav">
            <Link to="/">Inicio</Link>
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/contacto">Contacto</Link>
          </nav>
          <div className="footer-social">
            <span className="footer-social-label">Síguenos</span>
            <SocialLinks variant="footer" />
          </div>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Librería Lina — Todos los derechos reservados.
        </div>
      </footer>
      <TikTokFloat />
    </div>
  );
};

export default PublicLayout;
