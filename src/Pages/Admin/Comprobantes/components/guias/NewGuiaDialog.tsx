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
  onGenerate: (value: GuiaRemisionFormData) => void;
  guias: GuiaRemisionSelectDto[];
}

export default function NewGuiaDialog({
  isOpen,
  onClose,
  onGenerate,
  guias,
}: Props) {
  const [type, setType] = useState<GuiaRemisionTipo | null>(null);

  const close = () => {
    setType(null);
    onClose();
  };

  const emit = (value: GuiaRemisionFormData) => {
    onGenerate(value);
    close();
  };

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
      {!type ? (
        <div
          style={{
            display: 'grid',
            gap: '20px',
          }}
        >
          <section>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: '14px',
              }}
            >
              Tipo de guía
            </h3>

            <GuiaTypeSelector
              selectedType="GUIA_REMISION_REMITENTE"
              onTypeChange={setType}
            />
          </section>
        </div>
      ) : type === 'GUIA_REMISION_REMITENTE' ? (
        <div style={{ padding: '20px' }}>
          <GuiaRemitenteForm
            onCancel={() => setType(null)}
            onSubmit={emit}
          />
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <GuiaTransportistaForm
            guiasRemitente={guias.filter(
              (item) => item.tipo === 'GUIA_REMISION_REMITENTE',
            )}
            onCancel={() => setType(null)}
            onSubmit={emit}
          />
        </div>
      )}
    </CrudDialog>
  );
}