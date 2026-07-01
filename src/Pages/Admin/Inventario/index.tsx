import { useState } from 'react';
import ProductsSection from './components/ProductsSection';
import CategoriesSection from './components/CategoriesSection';
import BrandsSection from './components/BrandsSection';
import LotsSection from './components/LotsSection';
import MovementsSection from './components/MovementsSection';
import UnitsSection from './components/UnitsSection';
import { FiBox, FiFolder, FiBookmark, FiLayers, FiActivity, FiTag } from 'react-icons/fi';
import './Inventario.css';

type TabType = 'productos' | 'categorias' | 'marcas' | 'lotes' | 'movimientos' | 'unidades';

const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('productos');

  const tabs = [
    { id: 'productos', label: 'Productos', icon: <FiBox /> },
    { id: 'categorias', label: 'Categorías', icon: <FiFolder /> },
    { id: 'marcas', label: 'Marcas', icon: <FiBookmark /> },
    { id: 'lotes', label: 'Lotes / Stock', icon: <FiLayers /> },
    { id: 'movimientos', label: 'Movimientos', icon: <FiActivity /> },
    { id: 'unidades', label: 'Unidades de Medida', icon: <FiTag /> },
  ] as const;

  return (
    <div className="erp-module-container fade-in">
      {/* Module Title and Info Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Módulo de Inventario</h1>
          <p className="erp-module-subtitle">Administra los productos, stocks, lotes y trazabilidad física del almacén.</p>
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
        {activeTab === 'productos' && <ProductsSection />}
        {activeTab === 'categorias' && <CategoriesSection />}
        {activeTab === 'marcas' && <BrandsSection />}
        {activeTab === 'lotes' && <LotsSection />}
        {activeTab === 'movimientos' && <MovementsSection />}
        {activeTab === 'unidades' && <UnitsSection />}
      </div>
    </div>
  );
};

export default InventarioPage;
