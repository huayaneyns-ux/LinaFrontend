import { Outlet } from 'react-router-dom';
import Header from '../Components/Shared/Header';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Header />
      <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <footer style={{ marginTop: '80px', padding: '40px 20px', background: 'var(--bg-white)', color: 'var(--text-dark)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <p>&copy; {new Date().getFullYear()} Librería Lina. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
