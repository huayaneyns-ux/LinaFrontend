import { useState } from 'react';
import type { ReactElement } from 'react';
import {
  FiClipboard,
  FiFileText,
  FiCornerUpLeft,
  FiTruck,
} from 'react-icons/fi';
import type {
  ComprobanteSection,
  ComprobanteSectionDefinition,
} from '../../../Types/Admin/Comprobantes/Comprobante';
import '../Inventario/Inventario.css';
import { ComprobantePagoVentas } from './components/ventas/ComprobanteVentasSection';
import { ComprobanteNotaVentas } from './components/notas/ComprobanteNotaSection';
import { ComprobanteTodosSection } from './components/todos/ComprobanteTodosSection';

type ComprobanteTab = ComprobanteSectionDefinition & {
  icon: ReactElement;
};

const TABS: readonly ComprobanteTab[] = [
  { id: 'todos', label: 'Todos', icon: <FiClipboard /> },
  { id: 'comprobantes', label: 'Comprobantes', icon: <FiFileText /> },
  { id: 'guias', label: 'Guías de Remisión', icon: <FiTruck /> },
  { id: 'notas', label: 'Notas', icon: <FiCornerUpLeft /> },
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
        {activeTab === 'notas' && < ComprobanteNotaVentas />}
        {activeTab === 'todos' && < ComprobanteTodosSection />}
      </div>
    </div>
  );
};

export default ComprobantesPage;
