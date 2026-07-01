import { useState } from 'react';
import UsersSection from './components/UsersSection';
import RolesSection from './components/RolesSection';
import { FiUsers, FiLock } from 'react-icons/fi';
import '../Inventario/Inventario.css'; // Reuse tab container styles

type TabType = 'usuarios' | 'roles';

const SeguridadPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('usuarios');

  const tabs = [
    { id: 'usuarios', label: 'Usuarios / Empleados', icon: <FiUsers /> },
    { id: 'roles', label: 'Roles y Permisos', icon: <FiLock /> },
  ] as const;

  return (
    <div className="erp-module-container fade-in">
      {/* Module Title and Info Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Módulo de Seguridad</h1>
          <p className="erp-module-subtitle">Administra las cuentas de usuario de la intranet, roles de accesibilidad y perfiles.</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="erp-tab-nav-wrapper">
        <div className="erp-tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`erp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Render Section */}
      <div className="erp-tab-content">
        {activeTab === 'usuarios' && <UsersSection />}
        {activeTab === 'roles' && <RolesSection />}
      </div>
    </div>
  );
};

export default SeguridadPage;
