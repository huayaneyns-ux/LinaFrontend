import type { TipoNota } from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface NotaTypeSelectorProps {
  selectedType: TipoNota;
  onTypeChange: (type: TipoNota) => void;
}

const NotaTypeSelector = ({ selectedType, onTypeChange }: NotaTypeSelectorProps) => {
  return (
    <div style={{display: 'flex',gap: '18px', fontSize: '13px' }}>
      <label style={{display: 'flex',gap: '5px'}}>
        <input
          type="radio"
          checked={selectedType === 'NOTA_CREDITO'}
          onChange={() => onTypeChange('NOTA_CREDITO')}
        />
        Nota de Crédito
      </label>
      <label style={{display: 'flex',gap: '5px'}}>
        <input
          type="radio"
          checked={selectedType === 'NOTA_DEBITO'}
          onChange={() => onTypeChange('NOTA_DEBITO')}
        />
        Nota de Débito
      </label>
    </div>
  );
};

export default NotaTypeSelector;