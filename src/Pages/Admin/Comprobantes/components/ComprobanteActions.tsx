import { FiEye, FiFileText, FiLoader, FiRefreshCw, FiDownload, FiTrash2 } from 'react-icons/fi';
import type { ComprobanteSelectDto } from '../../../../Types/Admin/Comprobantes/Comprobante';
import IconButton from '../../../../Components/ERP/IconButton';

interface ComprobanteActionsProps {
  comprobante: ComprobanteSelectDto;
  isUpdatingSunat: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;
  onViewComprobante: (comprobante: ComprobanteSelectDto) => void;
  onViewDetails: (comprobante: ComprobanteSelectDto) => void;
  onUpdateSunat: (id: number) => void;
  onDownloadPDF?: (comprobante: ComprobanteSelectDto) => void;
  onDeleteDocument?: (comprobante: ComprobanteSelectDto) => void;
}

const ComprobanteActions = ({
  comprobante,
  isUpdatingSunat,
  isDownloading = false,
  isDeleting = false,
  onViewComprobante,
  onViewDetails,
  onUpdateSunat,
  onDownloadPDF,
  onDeleteDocument,
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
    {onDownloadPDF && (
      <IconButton
        icon={isDownloading ? <FiLoader /> : <FiDownload />}
        tooltip={isDownloading ? 'Descargando PDF...' : 'Descargar comprobante'}
        variant="info"
        disabled={isDownloading}
        onClick={() => onDownloadPDF(comprobante)}
      />
    )}
    {onDeleteDocument && (
      <IconButton
        icon={isDeleting ? <FiLoader /> : <FiTrash2 />}
        tooltip={isDeleting ? 'Anulando documento...' : 'Anular documento'}
        variant="danger"
        disabled={isDeleting}
        onClick={() => onDeleteDocument(comprobante)}
      />
    )}
  </div>
);

export default ComprobanteActions;
