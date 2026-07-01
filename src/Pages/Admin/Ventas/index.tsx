import { useState } from 'react';
import VentasSection from './components/VentasSection';
import PedidosSection from './components/PedidosSection';
import CajaSection from './components/CajaSection';
import DevolucionesSection from './components/DevolucionesSection';
import { FiDollarSign, FiFileText, FiCreditCard, FiCornerUpLeft } from 'react-icons/fi';
import '../Inventario/Inventario.css'; // Reuse container and tab styles

type TabType = 'ventas' | 'pedidos' | 'caja' | 'devoluciones';

const VentasPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ventas');

  const tabs = [
    { id: 'ventas', label: 'Ventas Realizadas', icon: <FiDollarSign /> },
    { id: 'pedidos', label: 'Pedidos Recibidos', icon: <FiFileText /> },
    { id: 'caja', label: 'Caja & Pagos', icon: <FiCreditCard /> },
    { id: 'devoluciones', label: 'Devoluciones', icon: <FiCornerUpLeft /> },
  ] as const;

  return (
    <div className="erp-module-container fade-in">
      {/* Module Title and Info Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Módulo de Ventas</h1>
          <p className="erp-module-subtitle">Administra los comprobantes, pedidos de clientes, caja chica y devoluciones.</p>
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
        {activeTab === 'ventas' && <VentasSection />}
        {activeTab === 'pedidos' && <PedidosSection />}
        {activeTab === 'caja' && <CajaSection />}
        {activeTab === 'devoluciones' && <DevolucionesSection />}
      </div>
    </div>
  );
};

export default VentasPage;
