import { useState } from 'react';
import type { ReactElement } from 'react';
import {
  FiClipboard,
  FiFileText,
  FiEdit3,
  FiShoppingBag,
} from 'react-icons/fi';
import type {
  ComprobanteSection,
  ComprobanteSectionDefinition,
} from '../../../Types/Admin/Comprobantes/Comprobante';
import '../Inventario/Inventario.css';
import { ComprobantePagoVentas } from './components/ventas/ComprobanteVentasSection';
import { ComprobanteTodosSection } from './components/todos/ComprobanteTodosSection';
import { ComprobanteNotaVentas } from './components/notas/ComprobanteNotaSection';
import { ComprobanteLiquidacionSection } from './components/liquidaciones/ComprobanteLiquidacionSection';

type ComprobanteTab = ComprobanteSectionDefinition & {
  icon: ReactElement;
};

const TABS: readonly ComprobanteTab[] = [
  { id: 'todos', label: 'Todos', icon: <FiClipboard /> },
  { id: 'comprobantes', label: 'Comprobantes', icon: <FiFileText /> },
  { id: 'notas', label: 'Notas', icon: <FiEdit3 /> },
  { id: 'liquidaciones', label: 'Liquidaciones', icon: <FiShoppingBag /> },
];

export function ComprobantesPage() {

  const [activeTab, setActiveTab] = useState<ComprobanteSection>('todos');
  
  return (
    <div className="erp-module-container fade-in">
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Módulo de Comprobantes</h1>
          <p className="erp-module-subtitle">
            Administra los comprobantes y documentos electrónicos emitidos por la empresa.
          </p>
        </div>
      </div>

      <div className="erp-tab-nav-wrapper">
        <div className="erp-tab-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`erp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="erp-tab-content">
        {activeTab === 'comprobantes' && < ComprobantePagoVentas />}
        {activeTab === 'todos' && < ComprobanteTodosSection />}
        {activeTab === 'notas' && <ComprobanteNotaVentas />}
        {activeTab === 'liquidaciones' && <ComprobanteLiquidacionSection />}
      </div>
    </div>
  );
};

export default ComprobantesPage;
