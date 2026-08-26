import type { GuiaRemisionTipo } from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface GuiaTypeSelectorProps {
  selectedType: GuiaRemisionTipo;
  onTypeChange: (type: GuiaRemisionTipo) => void;
}

const GuiaTypeSelector = ({ selectedType, onTypeChange }: GuiaTypeSelectorProps) => {
  return (
    <div style={{ display: 'flex', gap: '18px', fontSize: '13px' }}>
      <label onClick={() => onTypeChange('GUIA_REMISION_REMITENTE')}  style={{ display: 'flex', gap: '5px',  cursor: 'pointer', justifyItems:'center', alignItems:'center' }}>
        <input
          type="radio"
          name="guiaTipo"
          checked={selectedType === 'GUIA_REMISION_REMITENTE'}
          onChange={() => onTypeChange('GUIA_REMISION_REMITENTE')}
        />
        <span> Guía de Remisión Remitente</span>
      </label>

      <label onClick={() => onTypeChange('GUIA_REMISION_TRANSPORTISTA')} style={{ display: 'flex', gap: '5px', cursor: 'pointer', justifyItems:'center', alignItems:'center' }}>
        <input
          type="radio"
          name="guiaTipo"
          checked={selectedType === 'GUIA_REMISION_TRANSPORTISTA'}
          onChange={() => onTypeChange('GUIA_REMISION_TRANSPORTISTA')}
        />
        <span> Guía de Remisión Transportista</span>
      </label>
    </div>
  );
};

export default GuiaTypeSelector;
