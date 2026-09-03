import { FiEye, FiFileText, FiLoader, FiRefreshCw, FiDownload, FiTrash2 } from 'react-icons/fi';
import type { ComprobanteSelectDto } from '../../../../Types/Admin/Comprobantes/Comprobante';
import IconButton from '../../../../Components/ERP/IconButton';

interface ComprobanteActionsProps {
  comprobante: ComprobanteSelectDto;
  isUpdatingSunat: boolean;
  isResendingSunat?: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;
  onViewComprobante: (comprobante: ComprobanteSelectDto) => void;
  onViewDetails: (comprobante: ComprobanteSelectDto) => void;
  onUpdateSunat: (id: string | number) => void;
  onResendSunat?: (id: string | number) => void;
  hideUpdateSunat?: boolean;
  hideDeleteDocument?: boolean;
  onDownloadPDF?: (comprobante: ComprobanteSelectDto) => void;
  onDeleteDocument?: (comprobante: ComprobanteSelectDto) => void;
}

const ComprobanteActions = ({
  comprobante,
  isUpdatingSunat,
  isResendingSunat = false,
  isDownloading = false,
  isDeleting = false,
  onViewComprobante,
  onViewDetails,
  onUpdateSunat,
  onResendSunat,
  hideUpdateSunat = false,
  hideDeleteDocument = false,
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
    {!hideUpdateSunat && (
      <IconButton
        icon={isUpdatingSunat ? <FiLoader /> : <FiRefreshCw />}
        tooltip={
          comprobante.estado === 'ANULADO' && comprobante.estadoSunat === 'ANULADO'
            ? 'Documento anulado confirmado por SUNAT'
            : isUpdatingSunat
              ? 'Consultando estado SUNAT...'
              : 'Actualizar estado SUNAT'
        }
        variant="success"
        disabled={isUpdatingSunat || (comprobante.estado === 'ANULADO' && comprobante.estadoSunat === 'ANULADO')}
        onClick={() => onUpdateSunat(comprobante.id)}
      />
    )}
    {onResendSunat && (
      <IconButton
        icon={isResendingSunat ? <FiLoader /> : <FiRefreshCw />}
        tooltip={isResendingSunat ? 'Reenviando a SUNAT...' : 'Reenviar a SUNAT'}
        variant="success"
        disabled={isResendingSunat}
        onClick={() => onResendSunat(comprobante.id)}
      />
    )}
    {onDownloadPDF && (
      <IconButton
        icon={isDownloading ? <FiLoader /> : <FiDownload />}
        tooltip={isDownloading ? 'Descargando PDF...' : 'Descargar comprobante'}
        variant="primary"
        disabled={isDownloading}
        onClick={() => onDownloadPDF(comprobante)}
      />
    )}
    {!hideDeleteDocument && onDeleteDocument && (
      <IconButton
        icon={isDeleting ? <FiLoader /> : <FiTrash2 />}
        tooltip={
          comprobante.estado === 'ANULADO' && comprobante.estadoSunat === 'ANULADO'
            ? 'Documento anulado confirmado por SUNAT'
            : isDeleting
              ? 'Anulando documento...'
              : 'Anular documento'
        }
        variant="danger"
        disabled={isDeleting || (comprobante.estado === 'ANULADO' && comprobante.estadoSunat === 'ANULADO')}
        onClick={() => onDeleteDocument(comprobante)}
      />
    )}
  </div>
);

export default ComprobanteActions;
