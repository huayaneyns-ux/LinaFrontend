import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
  FiHome, FiTruck, FiUsers, FiBox,
  FiLogOut, FiSearch, FiBell, FiSettings, FiBarChart2,
  FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';
import '../Styles/ERP/erp-variables.css';
import '../Styles/ERP/erp-layout.css';

// ── NAV STRUCTURE ──
const NAV_ITEMS = [
  { to: '/admin', icon: <FiHome />, label: 'Dashboard', end: true },
  { to: '/admin/inventario', icon: <FiBox />, label: 'Inventario' },
  { to: '/admin/ventas', icon: <FiBarChart2 />, label: 'Ventas' },
  { to: '/admin/compras', icon: <FiTruck />, label: 'Compras' },
  { to: '/admin/seguridad', icon: <FiUsers />, label: 'Seguridad' },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/inventario': 'Inventario',
  '/admin/ventas': 'Ventas',
  '/admin/compras': 'Compras',
  '/admin/seguridad': 'Seguridad',
};

const getInitials = (nombre?: string, apellido?: string) => {
  return `${(nombre?.[0] ?? '').toUpperCase()}${(apellido?.[0] ?? '').toUpperCase()}`;
};

const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = BREADCRUMB_MAP[location.pathname] ?? 'Admin';
  const initials = getInitials(usuario?.nombres, usuario?.apellidos);

  return (
    <div className="erp-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`erp-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="erp-sidebar-brand">
          <div className="erp-sidebar-brand-icon">L</div>
          <div className="erp-sidebar-brand-text">
            <span className="erp-sidebar-brand-name">Intranet Lina</span>
            <span className="erp-sidebar-brand-sub">Sistema ERP</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="erp-sidebar-nav">
          {NAV_ITEMS.map(item => {
            // Only show Seguridad to administrators
            if (item.to === '/admin/seguridad' && usuario?.rol !== 'ADMINISTRADOR') {
              return null;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `erp-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>


        {/* Footer — user info */}
        <div className="erp-sidebar-footer">
          <button
            className="erp-sidebar-user"
            onClick={() => navigate('/')}
            title="Ir a la tienda"
            style={{ width: '100%', textAlign: 'left' }}
          >
            <div className="erp-sidebar-avatar">{initials}</div>
            <div className="erp-sidebar-user-info">
              <div className="erp-sidebar-user-name">
                {usuario?.nombres} {usuario?.apellidos}
              </div>
              <div className="erp-sidebar-user-role">{usuario?.rol}</div>
            </div>
            <FiChevronRight style={{ fontSize: 12, color: 'var(--erp-sidebar-text)', flexShrink: 0 }} />
          </button>

          <button
            className="erp-nav-item"
            onClick={handleLogout}
            style={{ color: '#f87171', marginTop: 4, width: 'calc(100% - 0px)' }}
            title="Cerrar sesión"
          >
            <FiLogOut />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="erp-main">
        {/* TOPBAR */}
        <header className="erp-topbar">
          {/* Mobile menu toggle */}
          <button
            className="erp-topbar-icon-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
            style={{ display: 'none' }}
            id="sidebar-toggle"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* Breadcrumb */}
          <div className="erp-topbar-breadcrumb">
            <span>Admin</span>
            <FiChevronRight style={{ fontSize: 12 }} />
            <strong>{currentPage}</strong>
          </div>

          {/* Global search */}
          <div className="erp-topbar-search">
            <FiSearch className="erp-topbar-search-icon" />
            <input
              type="text"
              placeholder="Búsqueda global... (Ctrl+K)"
              value={topSearch}
              onChange={e => setTopSearch(e.target.value)}
              aria-label="Búsqueda global"
              id="topbar-global-search"
            />
          </div>

          {/* Actions */}
          <div className="erp-topbar-actions">
            <button className="erp-topbar-icon-btn" title="Notificaciones" id="btn-notifications">
              <FiBell />
              <span className="erp-topbar-notif-dot" />
            </button>
            <button className="erp-topbar-icon-btn" title="Configuración" id="btn-settings">
              <FiSettings />
            </button>

            <div className="erp-topbar-divider" />

            <button className="erp-topbar-user" id="btn-topbar-user" title="Mi cuenta">
              <div className="erp-topbar-avatar">{initials}</div>
              <div>
                <div className="erp-topbar-user-name">{usuario?.nombres}</div>
                <div className="erp-topbar-user-role">{usuario?.rol}</div>
              </div>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="erp-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 199, display: 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
