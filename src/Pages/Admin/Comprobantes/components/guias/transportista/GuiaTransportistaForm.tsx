import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

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

  fletePagadoPor: 'REMITENTE',

  // Toggles de traslado
  retornoVehiculoVacio: false,
  retornoEnvasesVacios: false,
  transbordoProgramado: false,
  trasladoTotalBienes: false,

  transporteSubcontratado: false,
  empresaSubcontrata: '',
  rucEmpresaSubcontrata: '',

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
} as GuiaRemisionTransportistaFormData);

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


function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: checked ? 'var(--erp-primary, #2563eb)' : 'var(--erp-border)',
          transition: 'background-color 0.15s ease',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      </button>

      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: checked ? 'var(--erp-text-primary)' : 'var(--erp-text-secondary)',
          minWidth: '18px',
        }}
      >
        {checked ? 'Sí' : 'No'}
      </span>

      <span style={{ fontSize: '13px', color: 'var(--erp-text-primary)' }}>
        {label}
      </span>
    </div>
  );
}

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

    if (
      form.transporteSubcontratado &&
      (!form.empresaSubcontrata || !/^\d{11}$/.test(form.rucEmpresaSubcontrata ?? ''))
    ) {
      setError('Complete la empresa subcontratada y un RUC válido de 11 dígitos.');
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

  const addVehicle = () => set({ vehiculos: [...form.vehiculos, { placa: '', numeroAutorizacion: '', entidadEmisora: '' }] });
  const addDriver = () => set({ conductores: [...form.conductores, { tipoDocumento: 'DNI', numeroDocumento: '', nombre: '', apellidos: '', licenciaConducir: '' }] });
  const updateVehicle = (index: number, field: 'placa' | 'numeroAutorizacion' | 'entidadEmisora', value: string) => set({ vehiculos: form.vehiculos.map((vehicle, i) => i === index ? { ...vehicle, [field]: value } : vehicle) });
  const updateDriver = (index: number, field: 'numeroDocumento' | 'nombre' | 'apellidos' | 'licenciaConducir', value: string) => set({ conductores: form.conductores.map((driver, i) => i === index ? { ...driver, [field]: value } : driver) });

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
            maxLength={11}
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
              maxLength={11}
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

        {/* Toggles: Retorno de Vehículo Vacío / Retorno con Envases Vacíos / Transbordo Programado */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <Toggle
            checked={!!form.retornoVehiculoVacio}
            onChange={(v) => set({ retornoVehiculoVacio: v })}
            label="Retorno de Vehículo Vacío"
          />

          <Toggle
            checked={!!form.retornoEnvasesVacios}
            onChange={(v) => set({ retornoEnvasesVacios: v })}
            label="Retorno con Envases Vacíos"
          />

          <Toggle
            checked={!!form.transbordoProgramado}
            onChange={(v) => set({ transbordoProgramado: v })}
            label="Transbordo Programado"
          />

          <Toggle
            checked={!!form.trasladoTotalBienes}
            onChange={(v) => set({ trasladoTotalBienes: v })}
            label="Traslado Total de Bienes"
          />

          <Toggle
            checked={!!form.transporteSubcontratado}
            onChange={(v) =>
              set({
                transporteSubcontratado: v,
                ...(v ? {} : { empresaSubcontrata: '', rucEmpresaSubcontrata: '' }),
              })
            }
            label="Transporte Subcontratado"
          />
        </div>

        {/* Campos condicionales cuando el transporte es subcontratado */}
        {form.transporteSubcontratado && (
          <div style={{ ...grid, marginTop: '16px' }}>
            <FormField label="Empresa que subcontrata" required>
              <input
                className="erp-form-control"
                value={form.empresaSubcontrata ?? ''}
                onChange={(e) => set({ empresaSubcontrata: e.target.value })}
              />
            </FormField>

            <FormField label="Número de RUC" required>
              <input
                className="erp-form-control"
                inputMode="numeric"
                maxLength={11}
                value={form.rucEmpresaSubcontrata ?? ''}
                onChange={(e) =>
                  set({ rucEmpresaSubcontrata: e.target.value.replace(/\D/g, '').slice(0, 11) })
                }
              />
            </FormField>
          </div>
        )}
      </section>

      <section style={card}>
        <h4 style={title}>DATOS DEL TRANSPORTISTA</h4>
        <FormField label="Registro MTC" required>
          <input
            className="erp-form-control"
            value={form.transportista.registroMTC ?? ''}
            onChange={(e) =>
              set({ transportista: { ...form.transportista, registroMTC: e.target.value } })
            }
          />
        </FormField>
      </section>

      <section style={card}>
        <h4 style={title}>
          GRE REMITENTE RELACIONADA
        </h4>

        <div style={grid}>
          <FormField label="Flete pagado por">
            <select
              className="erp-form-control"
              value={form.fletePagadoPor}
              onChange={(e) =>
                set({ fletePagadoPor: e.target.value as GuiaRemisionTransportistaFormData['fletePagadoPor'] })
              }
            >
              <option value="REMITENTE">Remitente</option>
              <option value="SUBCONTRATADOR">Subcontratador</option>
              <option value="TERCERO">Tercero</option>
            </select>
          </FormField>
        </div>
              {/** 
        <FormField label="Seleccionar guía remitente">
          <select
            className="erp-form-control"
            value={form.guiaRemitenteRelacionada?.id ?? ''}
            onChange={(e) =>
              selectGuia(Number(e.target.value))
            }
          >
            {guiasRemitente.map((g) => (
              <option key={g.id} value={g.id}>
                {g.serie}-{g.numero} · {g.destinatario}
              </option>
            ))}
          </select>
        </FormField>*/}
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

      <TransportResources
        form={form}
        addVehicle={addVehicle}
        addDriver={addDriver}
        updateVehicle={updateVehicle}
        updateDriver={updateDriver}
        removeVehicle={(i) => set({ vehiculos: form.vehiculos.filter((_, index) => index !== i) })}
        removeDriver={(i) => set({ conductores: form.conductores.filter((_, index) => index !== i) })}
      />

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

function TransportResources({
  form,
  addVehicle,
  addDriver,
  updateVehicle,
  updateDriver,
  removeVehicle,
  removeDriver,
}: {
  form: GuiaRemisionTransportistaFormData;
  addVehicle: () => void;
  addDriver: () => void;
  updateVehicle: (i: number, field: 'placa' | 'numeroAutorizacion' | 'entidadEmisora', value: string) => void;
  updateDriver: (i: number, field: 'numeroDocumento' | 'nombre' | 'apellidos' | 'licenciaConducir', value: string) => void;
  removeVehicle: (i: number) => void;
  removeDriver: (i: number) => void;
}) {
  return (
    <>
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ ...title, margin: 0 }}>VEHÍCULOS</h4>
          <button type="button" className="erp-btn erp-btn-secondary erp-btn-sm" onClick={addVehicle}>
            + Agregar vehículo
          </button>
        </div>

        {form.vehiculos.map((vehicle, index) => (
          <div
            key={index}
            style={{ ...grid, marginTop: '12px', padding: '10px', border: '1px solid var(--erp-border)', borderRadius: '6px' }}
          >
            <FormField label="Placa" required>
              <input className="erp-form-control" value={vehicle.placa ?? ''} onChange={(e) => updateVehicle(index, 'placa', e.target.value)} />
            </FormField>

            <FormField label="Número de autorización">
              <input className="erp-form-control" value={vehicle.numeroAutorizacion ?? ''} onChange={(e) => updateVehicle(index, 'numeroAutorizacion', e.target.value)} />
            </FormField>

            <FormField label="Entidad emisora">
              <select className="erp-form-control" value={vehicle.entidadEmisora ?? ''} onChange={(e) => updateVehicle(index, 'entidadEmisora', e.target.value)}>
                <option value="">Seleccione</option>
                <option value="MTC">MTC</option>
              </select>
            </FormField>

            <div style={{ alignSelf: 'end' }}>
              <button type="button" className="erp-btn erp-btn-danger erp-btn-sm" onClick={() => removeVehicle(index)}>
                <FiTrash2 /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ ...title, margin: 0 }}>CONDUCTORES</h4>
          <button type="button" className="erp-btn erp-btn-secondary erp-btn-sm" onClick={addDriver}>
            + Agregar conductor
          </button>
        </div>

        {form.conductores.map((driver, index) => (
          <div
            key={index}
            style={{ ...grid, marginTop: '12px', padding: '10px', border: '1px solid var(--erp-border)', borderRadius: '6px' }}
          >
            <FormField label="DNI" required>
              <input className="erp-form-control" maxLength={8} value={driver.numeroDocumento} onChange={(e) => updateDriver(index, 'numeroDocumento', e.target.value)} />
            </FormField>

            <FormField label="Nombres" required>
              <input className="erp-form-control" value={driver.nombre} onChange={(e) => updateDriver(index, 'nombre', e.target.value)} />
            </FormField>

            <FormField label="Apellidos" required>
              <input className="erp-form-control" value={driver.apellidos ?? ''} onChange={(e) => updateDriver(index, 'apellidos', e.target.value)} />
            </FormField>

            <FormField label="Licencia de conducir" required>
              <input className="erp-form-control" value={driver.licenciaConducir ?? ''} onChange={(e) => updateDriver(index, 'licenciaConducir', e.target.value)} />
            </FormField>

            <div style={{ alignSelf: 'end' }}>
              <button type="button" className="erp-btn erp-btn-danger erp-btn-sm" onClick={() => removeDriver(index)}>
                <FiTrash2 /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}