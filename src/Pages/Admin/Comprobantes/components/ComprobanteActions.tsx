import { FiEye, FiFileText, FiLoader, FiRefreshCw } from 'react-icons/fi';
import type { ComprobanteSelectDto } from '../../../../Types/Admin/Comprobantes/Comprobante';
import IconButton from '../../../../Components/ERP/IconButton';

interface ComprobanteActionsProps {
  comprobante: ComprobanteSelectDto;
  isUpdatingSunat: boolean;
  onViewComprobante: (comprobante: ComprobanteSelectDto) => void;
  onViewDetails: (comprobante: ComprobanteSelectDto) => void;
  onUpdateSunat: (id: number) => void;
}

const ComprobanteActions = ({
  comprobante,
  isUpdatingSunat,
  onViewComprobante,
  onViewDetails,
  onUpdateSunat,
}: ComprobanteActionsProps) => (
  <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
    <IconButton
      icon={<FiFileText />}
      tooltip="Ver comprobante"
      variant="primary"
      onClick={() => onViewComprobante(comprobante)}
    />
    <IconButton
      icon={<FiEye />}
      tooltip="Ver detalles"
      onClick={() => onViewDetails(comprobante)}
    />
    <IconButton
      icon={isUpdatingSunat ? <FiLoader /> : <FiRefreshCw />}
      tooltip={isUpdatingSunat ? 'Consultando estado SUNAT...' : 'Actualizar estado SUNAT'}
      variant="success"
      disabled={isUpdatingSunat}
      onClick={() => onUpdateSunat(comprobante.id)}
    />
  </div>
);

export default ComprobanteActions;
