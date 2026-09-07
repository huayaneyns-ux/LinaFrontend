import { useState } from 'react';

import CrudDialog from '../../../../../Components/ERP/CrudDialog';

import GuiaRemitenteForm from './remitente/GuiaRemitenteForm';
import GuiaTransportistaForm from './transportista/GuiaTransportistaForm';
import GuiaTypeSelector from './GuiaTypeSelector';

import type {
  GuiaRemisionFormData,
  GuiaRemisionSelectDto,
  GuiaRemisionTipo,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (value: GuiaRemisionFormData) => void | Promise<any>;
  guias: GuiaRemisionSelectDto[];
  loading?: boolean;
  embedded?: boolean;
}

export default function NewGuiaDialog({
  isOpen,
  onClose,
  onGenerate,
  guias,
  loading,
  embedded = false,
}: Props) {
  const [type, setType] = useState<GuiaRemisionTipo | null>(null);

  const close = () => {
    setType(null);
    onClose();
  };

  const emit = async (value: GuiaRemisionFormData) => {
    await onGenerate(value);
    close();
    return true;
  };

  const formBody = !type ? (
    <div style={{ display: 'grid', gap: '20px' }}>
      <section>
        <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Tipo de guía</h3>
        <GuiaTypeSelector
          selectedType="GUIA_REMISION_TRANSPORTISTA"
          onTypeChange={setType}
        />
      </section>
      {embedded && (
        <div className="erp-form-actions">
          <button type="button" className="erp-btn erp-btn-secondary" onClick={close}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  ) : type === 'GUIA_REMISION_REMITENTE' ? (
    <div style={{ padding: embedded ? 0 : '20px' }}>
      <GuiaRemitenteForm
        onCancel={() => setType(null)}
        onSubmit={emit}
        loading={loading}
      />
    </div>
  ) : (
    <div style={{ padding: embedded ? 0 : '20px' }}>
      <GuiaTransportistaForm
        guiasRemitente={guias.filter(
          (item) => item.tipo === 'GUIA_REMISION_REMITENTE',
        )}
        onCancel={() => setType(null)}
        onSubmit={emit}
        loading={loading}
      />
    </div>
  );

  if (embedded) {
    return <div className="erp-form">{formBody}</div>;
  }

  return (
    <CrudDialog
      isOpen={isOpen}
      mode="create"
      onClose={close}
      onConfirm={() => {}}
      title={
        type === 'GUIA_REMISION_REMITENTE'
          ? 'Guía de Remisión Remitente'
          : type
            ? 'Guía de Remisión Transportista'
            : 'Nueva Guía de Remisión'
      }
      size="xl"
      hideFooter
    >
      {formBody}
    </CrudDialog>
  );
}
