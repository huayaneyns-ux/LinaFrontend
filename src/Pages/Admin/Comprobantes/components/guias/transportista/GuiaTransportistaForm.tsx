import { useState } from 'react';

import FormField from '../../../../../../Components/ERP/FormField';
import UbicacionSelector from '../UbicacionSelector';

import type {
  GuiaRemisionSelectDto,
  GuiaRemisionTransportistaFormData,
} from '../../../../../../Types/Admin/Comprobantes/Comprobante';

interface Props {
  guiasRemitente: GuiaRemisionSelectDto[];
  onSubmit: (data: GuiaRemisionTransportistaFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const location = () => ({
  departamento: 'Lima',
  provincia: 'Lima',
  distrito: 'Lima',
  direccion: '',
});

const initial = (): GuiaRemisionTransportistaFormData => ({
  tipo: 'GUIA_REMISION_TRANSPORTISTA',
  serie: 'T002',
  numero: '',
  fechaEmision: today(),
  fechaInicioTraslado: today(),

  transportista: {
    ruc: '',
    razonSocial: '',
    registroMTC: '',
  },

  remitente: {
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    nombre: '',
  },

  destinatario: {
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    nombre: '',
  },

  puntoPartida: location(),
  puntoLlegada: location(),

  vehiculos: [],
  conductores: [],
  bienes: [],

  pesoBrutoTotal: 0,
  unidadMedidaPeso: 'KGM',
  observaciones: '',
});

const card = {
  padding: '16px',
  border: '1px solid var(--erp-border)',
  borderRadius: '8px',
  backgroundColor: 'var(--erp-surface)',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

const title = {
  margin: '0 0 12px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--erp-text-primary)',
};

export default function GuiaTransportistaForm({
  guiasRemitente,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  const set = (
    value: Partial<GuiaRemisionTransportistaFormData>,
  ) => {
    setForm((previous) => ({
      ...previous,
      ...value,
    }));
  };

  const selectGuia = (id: number) => {
    const guia = guiasRemitente.find((x) => x.id === id);

    if (!guia) return;

    set({
      guiaRemitenteRelacionada: {
        id: guia.id,
        serie: guia.serie,
        numero: guia.numero,
      },

      remitente: {
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        nombre: guia.remitente ?? '',
      },

      destinatario: {
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        nombre: guia.destinatario ?? '',
      },

      puntoPartida: {
        ...form.puntoPartida,
        direccion: guia.puntoPartida ?? '',
      },

      puntoLlegada: {
        ...form.puntoLlegada,
        direccion: guia.puntoLlegada ?? '',
      },
    });
  };

  const submit = () => {
    if (
      !form.numero ||
      !form.transportista.ruc ||
      !form.transportista.razonSocial ||
      !form.transportista.registroMTC ||
      !form.remitente.nombre ||
      !form.destinatario.nombre ||
      !form.bienes.length ||
      form.pesoBrutoTotal <= 0
    ) {
      setError(
        'Complete los campos obligatorios, bienes y peso.',
      );
      return;
    }

    if (form.fechaInicioTraslado < form.fechaEmision) {
      setError(
        'La fecha de traslado no puede ser anterior a la emisión.',
      );
      return;
    }

    setError('');
    onSubmit(form);
  };

  const person = (
    key: 'remitente' | 'destinatario',
    label: string,
  ) => (
    <section style={card}>
      <h4 style={title}>{label}</h4>

      <div style={grid}>
        <FormField label="Tipo de documento">
          <select
            className="erp-form-control"
            value={form[key].tipoDocumento}
            onChange={(e) =>
              set({
                [key]: {
                  ...form[key],
                  tipoDocumento: e.target.value,
                },
              })
            }
          >
            <option>DNI</option>
            <option>RUC</option>
          </select>
        </FormField>

        <FormField label="Número">
          <input
            className="erp-form-control"
            value={form[key].numeroDocumento}
            onChange={(e) =>
              set({
                [key]: {
                  ...form[key],
                  numeroDocumento: e.target.value,
                },
              })
            }
          />
        </FormField>

        <FormField
          label="Nombre / Razón social"
          required
        >
          <input
            className="erp-form-control"
            value={form[key].nombre}
            onChange={(e) =>
              set({
                [key]: {
                  ...form[key],
                  nombre: e.target.value,
                },
              })
            }
          />
        </FormField>
      </div>
    </section>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {error && (
        <p className="erp-form-error">
          {error}
        </p>
      )}

      <section style={card}>
        <h4 style={title}>
          DATOS DE LA GUÍA TRANSPORTISTA
        </h4>

        <div style={grid}>
          <FormField label="Serie">
            <input
              className="erp-form-control"
              value={form.serie}
              disabled
            />
          </FormField>

          <FormField label="Número" required>
            <input
              className="erp-form-control"
              value={form.numero}
              onChange={(e) =>
                set({
                  numero: e.target.value,
                })
              }
            />
          </FormField>

          <FormField label="Fecha de emisión">
            <input
              type="date"
              className="erp-form-control"
              value={form.fechaEmision}
              onChange={(e) =>
                set({
                  fechaEmision: e.target.value,
                })
              }
            />
          </FormField>

          <FormField label="Inicio del traslado">
            <input
              type="date"
              className="erp-form-control"
              value={form.fechaInicioTraslado}
              onChange={(e) =>
                set({
                  fechaInicioTraslado: e.target.value,
                })
              }
            />
          </FormField>
        </div>
      </section>

      <section style={card}>
        <h4 style={title}>
          DATOS DEL TRANSPORTISTA
        </h4>

        <div style={grid}>
          <FormField label="RUC" required>
            <input
              className="erp-form-control"
              maxLength={11}
              value={form.transportista.ruc ?? ''}
              onChange={(e) =>
                set({
                  transportista: {
                    ...form.transportista,
                    ruc: e.target.value,
                  },
                })
              }
            />
          </FormField>

          <FormField label="Razón social" required>
            <input
              className="erp-form-control"
              value={form.transportista.razonSocial ?? ''}
              onChange={(e) =>
                set({
                  transportista: {
                    ...form.transportista,
                    razonSocial: e.target.value,
                  },
                })
              }
            />
          </FormField>

          <FormField label="Registro MTC" required>
            <input
              className="erp-form-control"
              value={form.transportista.registroMTC ?? ''}
              onChange={(e) =>
                set({
                  transportista: {
                    ...form.transportista,
                    registroMTC: e.target.value,
                  },
                })
              }
            />
          </FormField>
        </div>
      </section>

      <section style={card}>
        <h4 style={title}>
          GRE REMITENTE RELACIONADA
        </h4>

        <FormField label="Seleccionar guía remitente">
          <select
            className="erp-form-control"
            value={form.guiaRemitenteRelacionada?.id ?? ''}
            onChange={(e) =>
              selectGuia(Number(e.target.value))
            }
          >
            <option value="">Sin relación</option>

            {guiasRemitente.map((g) => (
              <option key={g.id} value={g.id}>
                {g.serie}-{g.numero} · {g.destinatario}
              </option>
            ))}
          </select>
        </FormField>
      </section>

      {person('remitente', 'REMITENTE')}

      {person('destinatario', 'DESTINATARIO')}

      <UbicacionSelector
        label="PUNTO DE PARTIDA"
        {...form.puntoPartida}
        onDepartamentoChange={(v) =>
          set({
            puntoPartida: {
              ...form.puntoPartida,
              departamento: v,
            },
          })
        }
        onProvinciaChange={(v) =>
          set({
            puntoPartida: {
              ...form.puntoPartida,
              provincia: v,
            },
          })
        }
        onDistritoChange={(v) =>
          set({
            puntoPartida: {
              ...form.puntoPartida,
              distrito: v,
            },
          })
        }
        onDireccionChange={(v) =>
          set({
            puntoPartida: {
              ...form.puntoPartida,
              direccion: v,
            },
          })
        }
      />

      <UbicacionSelector
        label="PUNTO DE LLEGADA"
        {...form.puntoLlegada}
        onDepartamentoChange={(v) =>
          set({
            puntoLlegada: {
              ...form.puntoLlegada,
              departamento: v,
            },
          })
        }
        onProvinciaChange={(v) =>
          set({
            puntoLlegada: {
              ...form.puntoLlegada,
              provincia: v,
            },
          })
        }
        onDistritoChange={(v) =>
          set({
            puntoLlegada: {
              ...form.puntoLlegada,
              distrito: v,
            },
          })
        }
        onDireccionChange={(v) =>
          set({
            puntoLlegada: {
              ...form.puntoLlegada,
              direccion: v,
            },
          })
        }
      />

      <section style={card}>
        <h4 style={title}>
          BIENES, VEHÍCULOS Y CONDUCTORES
        </h4>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--erp-text-secondary)',
          }}
        >
          La estructura de detalle permanece separada de
          Remitente. Se completará con el contrato de backend
          de Transportista.
        </p>
      </section>

      <section style={card}>
        <h4 style={title}>
          PESO BRUTO TOTAL
        </h4>

        <div style={grid}>
          <FormField label="Valor" required>
            <input
              type="number"
              min="0.01"
              className="erp-form-control"
              value={form.pesoBrutoTotal || ''}
              onChange={(e) =>
                set({
                  pesoBrutoTotal: Number(e.target.value),
                })
              }
            />
          </FormField>

          <FormField label="Unidad">
            <select
              className="erp-form-control"
              value={form.unidadMedidaPeso}
              onChange={(e) =>
                set({
                  unidadMedidaPeso: e.target.value,
                })
              }
            >
              <option value="KGM">
                Kilogramos (KGM)
              </option>

              <option value="TNE">
                Toneladas (TNE)
              </option>
            </select>
          </FormField>
        </div>
      </section>

      <section style={card}>
        <h4 style={title}>
          OBSERVACIONES
        </h4>

        <textarea
          className="erp-form-control"
          rows={3}
          value={form.observaciones ?? ''}
          onChange={(e) =>
            set({
              observaciones: e.target.value,
            })
          }
        />
      </section>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        <button
          type="button"
          className="erp-btn erp-btn-secondary"
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="erp-btn erp-btn-primary"
          disabled={loading}
        >
          Emitir Guía de Remisión Transportista
        </button>
      </div>
    </form>
  );
}