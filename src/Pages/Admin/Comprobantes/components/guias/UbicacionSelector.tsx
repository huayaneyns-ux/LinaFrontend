import type { ReactNode } from 'react';

import FormField from '../../../../../Components/ERP/FormField';

interface Props {
  label: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;

  onDepartamentoChange: (v: string) => void;
  onProvinciaChange: (v: string) => void;
  onDistritoChange: (v: string) => void;
  onDireccionChange: (v: string) => void;

  errors?: {
    direccion?: string;
  };

  additionalFields?: ReactNode;
}

const UbicacionSelector = ({
  label,
  departamento,
  provincia,
  distrito,
  direccion,
  onDepartamentoChange,
  onProvinciaChange,
  onDistritoChange,
  onDireccionChange,
  errors,
  additionalFields,
}: Props) => (
  <section
    style={{
      padding: '16px',
      border: '1px solid var(--erp-border)',
      borderRadius: '8px',
      backgroundColor: 'var(--erp-surface)',
    }}
  >
    <h4
      style={{
        margin: '0 0 12px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--erp-text-primary)',
      }}
    >
      {label}
    </h4>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}
    >
      <FormField label="Departamento">
        <input
          className="erp-form-control"
          value={departamento}
          onChange={(e) =>
            onDepartamentoChange(e.target.value)
          }
        />
      </FormField>

      <FormField label="Provincia">
        <input
          className="erp-form-control"
          value={provincia}
          onChange={(e) =>
            onProvinciaChange(e.target.value)
          }
        />
      </FormField>

      <FormField label="Distrito">
        <input
          className="erp-form-control"
          value={distrito}
          onChange={(e) =>
            onDistritoChange(e.target.value)
          }
        />
      </FormField>

      <FormField
        label="Dirección"
        required
        error={errors?.direccion}
      >
        <input
          className="erp-form-control"
          value={direccion}
          onChange={(e) =>
            onDireccionChange(e.target.value)
          }
        />
      </FormField>

      {additionalFields}
    </div>
  </section>
);

export default UbicacionSelector;