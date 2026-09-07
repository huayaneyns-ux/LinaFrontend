import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
  FiHome, FiTruck, FiUsers, FiBox,
  FiLogOut, FiSearch, FiBell, FiSettings, FiBarChart2, FiFileText,
  FiChevronRight, FiChevronDown, FiChevronLeft, FiMenu, FiX,
  FiFolder, FiBookmark, FiLayers, FiActivity, FiTag,
  FiDollarSign, FiCreditCard, FiCornerUpLeft,
  FiClipboard, FiEdit3, FiClock, FiShoppingBag, FiLock
} from 'react-icons/fi';
import '../Styles/ERP/erp-variables.css';
import '../Styles/ERP/erp-layout.css';

interface NavSubItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavItem {
  to: string;
  basePath: string;
  icon: React.ReactNode;
  label: string;
  role?: string;
  children?: NavSubItem[];
}

// ── NAVIGATION STRUCTURE (Caja y Pagos before Seguridad, no submodules) ──
const NAV_STRUCTURE: NavItem[] = [
  {
    to: '/admin',
    basePath: '/admin',
    icon: <FiHome />,
    label: 'Dashboard',
  },
  {
    to: '/admin/inventario/productos',
    basePath: '/admin/inventario',
    icon: <FiBox />,
    label: 'Inventario',
    children: [
      { to: '/admin/inventario/productos', label: 'Productos', icon: <FiBox /> },
      { to: '/admin/inventario/categorias', label: 'Categorías', icon: <FiFolder /> },
      { to: '/admin/inventario/marcas', label: 'Marcas', icon: <FiBookmark /> },
      { to: '/admin/inventario/lotes', label: 'Lotes / Stock', icon: <FiLayers /> },
      { to: '/admin/inventario/movimientos', label: 'Movimientos', icon: <FiActivity /> },
      { to: '/admin/inventario/unidades', label: 'Unidades de Medida', icon: <FiTag /> },
    ],
  },
  {
    to: '/admin/ventas/ventas',
    basePath: '/admin/ventas',
    icon: <FiBarChart2 />,
    label: 'Ventas',
    children: [
      { to: '/admin/ventas/ventas', label: 'Ventas Realizadas', icon: <FiDollarSign /> },
      { to: '/admin/ventas/pedidos', label: 'Pedidos Recibidos', icon: <FiFileText /> },
      { to: '/admin/ventas/devoluciones', label: 'Devoluciones', icon: <FiCornerUpLeft /> },
    ],
  },
  {
    to: '/admin/comprobantes/todos',
    basePath: '/admin/comprobantes',
    icon: <FiFileText />,
    label: 'Comprobantes',
    children: [
      { to: '/admin/comprobantes/todos', label: 'Todos', icon: <FiClipboard /> },
      { to: '/admin/comprobantes/ventas', label: 'Comprobantes Venta', icon: <FiFileText /> },
      { to: '/admin/comprobantes/notas', label: 'Notas Créd./Déb.', icon: <FiEdit3 /> },
      { to: '/admin/comprobantes/pendientes', label: 'Pendientes SUNAT', icon: <FiClock /> },
      { to: '/admin/comprobantes/liquidaciones', label: 'Liquidaciones', icon: <FiShoppingBag /> },
      { to: '/admin/comprobantes/tiempos', label: 'Tiempos SUNAT', icon: <FiActivity /> },
    ],
  },
  {
    to: '/admin/compras/ordenes',
    basePath: '/admin/compras',
    icon: <FiTruck />,
    label: 'Compras',
    children: [
      { to: '/admin/compras/ordenes', label: 'Órdenes de Compra', icon: <FiTruck /> },
      { to: '/admin/compras/proveedores', label: 'Proveedores', icon: <FiUsers /> },
    ],
  },
  {
    to: '/admin/caja',
    basePath: '/admin/caja',
    icon: <FiCreditCard />,
    label: 'Caja y Pagos',
  },
  {
    to: '/admin/seguridad/usuarios',
    basePath: '/admin/seguridad',
    icon: <FiUsers />,
    label: 'Seguridad',
    role: 'ADMINISTRADOR',
    children: [
      { to: '/admin/seguridad/usuarios', label: 'Usuarios / Empleados', icon: <FiUsers /> },
      { to: '/admin/seguridad/roles', label: 'Roles y Permisos', icon: <FiLock /> },
    ],
  },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/inventario': 'Inventario',
  '/admin/inventario/productos': 'Inventario / Productos',
  '/admin/inventario/categorias': 'Inventario / Categorías',
  '/admin/inventario/marcas': 'Inventario / Marcas',
  '/admin/inventario/lotes': 'Inventario / Lotes / Stock',
  '/admin/inventario/movimientos': 'Inventario / Movimientos',
  '/admin/inventario/unidades': 'Inventario / Unidades de Medida',
  '/admin/ventas': 'Ventas',
  '/admin/ventas/ventas': 'Ventas / Ventas Realizadas',
  '/admin/ventas/pedidos': 'Ventas / Pedidos Recibidos',
  '/admin/ventas/devoluciones': 'Ventas / Devoluciones',
  '/admin/comprobantes': 'Comprobantes',
  '/admin/comprobantes/todos': 'Comprobantes / Todos',
  '/admin/comprobantes/ventas': 'Comprobantes / Comprobantes Venta',
  '/admin/comprobantes/notas': 'Comprobantes / Notas Créd./Déb.',
  '/admin/comprobantes/pendientes': 'Comprobantes / Pendientes SUNAT',
  '/admin/comprobantes/liquidaciones': 'Comprobantes / Liquidaciones',
  '/admin/comprobantes/tiempos': 'Comprobantes / Tiempos SUNAT',
  '/admin/compras': 'Compras',
  '/admin/compras/ordenes': 'Compras / Órdenes de Compra',
  '/admin/compras/proveedores': 'Compras / Proveedores',
  '/admin/caja': 'Caja y Pagos',
  '/admin/seguridad': 'Seguridad',
  '/admin/seguridad/usuarios': 'Seguridad / Usuarios / Empleados',
  '/admin/seguridad/roles': 'Seguridad / Roles y Permisos',
};

const getInitials = (nombre?: string, apellido?: string) => {
  return `${(nombre?.[0] ?? '').toUpperCase()}${(apellido?.[0] ?? '').toUpperCase()}`;
};

const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('erp_sidebar_collapsed') === 'true';
  });
  const [topSearch, setTopSearch] = useState('');

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('erp_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Expand modules that match current URL path
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_STRUCTURE.forEach(item => {
      if (item.children && location.pathname.startsWith(item.basePath)) {
        initial[item.basePath] = true;
      }
    });
    return initial;
  });

  // Automatically expand current module when path changes
  useEffect(() => {
    NAV_STRUCTURE.forEach(item => {
      if (item.children && location.pathname.startsWith(item.basePath)) {
        setExpandedModules(prev => ({ ...prev, [item.basePath]: true }));
      }
    });
  }, [location.pathname]);

  const toggleModule = (basePath: string) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      localStorage.setItem('erp_sidebar_collapsed', 'false');
      setExpandedModules({ [basePath]: true });
      return;
    }
    setExpandedModules(prev => ({
      ...prev,
      [basePath]: !prev[basePath],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find best match for breadcrumb
  let currentBreadcrumb = 'Admin';
  for (const [path, label] of Object.entries(BREADCRUMB_MAP)) {
    if (location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))) {
      currentBreadcrumb = label;
    }
  }

  const initials = getInitials(usuario?.nombres, usuario?.apellidos);

  return (
    <div className={`erp-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── SIDEBAR ── */}
      <aside className={`erp-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div
          className="erp-sidebar-brand"
          onClick={() => navigate('/admin')}
          title="Intranet Lina - Panel ERP"
        >
          <div className="erp-sidebar-brand-icon">L</div>
          {!sidebarCollapsed && (
            <div className="erp-sidebar-brand-text">
              <span className="erp-sidebar-brand-name">Intranet Lina</span>
              <span className="erp-sidebar-brand-sub">Sistema ERP</span>
            </div>
          )}
        </div>

        {/* Navigation with Accordion Submodules */}
        <nav className="erp-sidebar-nav">
          {NAV_STRUCTURE.map(item => {
            // Role restriction
            if (item.role && usuario?.rol !== item.role) {
              return null;
            }

            const isModuleActive = item.basePath === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.basePath);
            const isExpanded = !!expandedModules[item.basePath] && !sidebarCollapsed;

            if (!item.children) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `erp-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="erp-nav-item-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="erp-nav-item-text">{item.label}</span>}
                </NavLink>
              );
            }

            return (
              <div key={item.basePath} className="erp-nav-accordion-group">
                <button
                  type="button"
                  className={`erp-nav-item erp-nav-parent ${isModuleActive ? 'active-parent' : ''}`}
                  onClick={() => toggleModule(item.basePath)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="erp-nav-item-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="erp-nav-item-text">{item.label}</span>
                      <span className="erp-nav-chevron">
                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                      </span>
                    </>
                  )}
                </button>

                {isExpanded && !sidebarCollapsed && (
                  <div className="erp-nav-subitems">
                    {item.children.map(sub => {
                      const isSubActive = location.pathname.startsWith(sub.to);
                      return (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={`erp-nav-subitem ${isSubActive ? 'active' : ''}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="erp-nav-subitem-dot" />
                          <span>{sub.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer — collapse toggle + user info */}
        <div className="erp-sidebar-footer">
          <button
            type="button"
            className="erp-sidebar-collapse-toggle"
            onClick={toggleSidebarCollapse}
            title={sidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            {!sidebarCollapsed && <span>Contraer menú</span>}
          </button>

          <button
            className="erp-sidebar-user"
            onClick={() => navigate('/')}
            title="Ir a la tienda virtual"
          >
            <div className="erp-sidebar-avatar">{initials}</div>
            {!sidebarCollapsed && (
              <>
                <div className="erp-sidebar-user-info">
                  <div className="erp-sidebar-user-name">
                    {usuario?.nombres} {usuario?.apellidos}
                  </div>
                  <div className="erp-sidebar-user-role">{usuario?.rol}</div>
                </div>
                <FiChevronRight style={{ fontSize: 12, color: 'var(--erp-sidebar-text)', flexShrink: 0 }} />
              </>
            )}
          </button>

          <button
            className="erp-nav-item erp-nav-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="erp-nav-item-icon"><FiLogOut /></span>
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="erp-main">
        {/* TOPBAR */}
        <header className="erp-topbar">
          {/* Mobile menu toggle */}
          <button
            className="erp-topbar-icon-btn mobile-toggle"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
            id="sidebar-toggle"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* Desktop collapse toggle on topbar */}
          <button
            className="erp-topbar-icon-btn desktop-collapse-btn"
            onClick={toggleSidebarCollapse}
            title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <FiMenu />
          </button>

          {/* Breadcrumb */}
          <div className="erp-topbar-breadcrumb">
            <span>Admin</span>
            <FiChevronRight style={{ fontSize: 11 }} />
            <strong>{currentBreadcrumb}</strong>
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
          className="erp-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
