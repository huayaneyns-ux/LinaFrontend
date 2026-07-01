import { useState } from 'react';
import ComprasSection from './components/ComprasSection';
import ProveedoresSection from './components/ProveedoresSection';
import { FiShoppingCart, FiUsers } from 'react-icons/fi';
import '../Inventario/Inventario.css'; // Reuse container and tab styles

type TabType = 'compras' | 'proveedores';

const ComprasPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('compras');

  const tabs = [
    { id: 'compras', label: 'Órdenes de Compra', icon: <FiShoppingCart /> },
    { id: 'proveedores', label: 'Proveedores', icon: <FiUsers /> },
  ] as const;

  return (
    <div className="erp-module-container fade-in">
      {/* Module Title and Info Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Módulo de Compras</h1>
          <p className="erp-module-subtitle">Administra las órdenes de compra a proveedores externos y el abastecimiento de mercadería.</p>
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
        {activeTab === 'compras' && <ComprasSection />}
        {activeTab === 'proveedores' && <ProveedoresSection />}
      </div>
    </div>
  );
};

export default ComprasPage;
