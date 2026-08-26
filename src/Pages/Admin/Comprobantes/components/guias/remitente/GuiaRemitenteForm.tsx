import { useState, useImperativeHandle, forwardRef, type CSSProperties } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import FormField from '../../../../../../Components/ERP/FormField';
import IconButton from '../../../../../../Components/ERP/IconButton';
import UbicacionSelector from '../UbicacionSelector';

import type {
  BienTransportado,
  DatosConductor,
  DatosPersonaGuia,
  DatosVehiculo,
  GuiaRemisionRemitenteFormData,
  ModalidadTransporte,
  MotivoTrasladoRemitente,
  Ubicacion,
} from '../../../../../../Types/Admin/Comprobantes/Comprobante';

export interface GuiaRemitenteFormHandle {
  submit: () => boolean;
}

interface Props {
  onSubmit: (
    data: GuiaRemisionRemitenteFormData,
  ) => void | Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const motivos: MotivoTrasladoRemitente[] = [
  'Venta',
  'Venta sujeta a confirmación',
  'Compra',
  'Devolución',
  'Consignación',
  'Traslado entre establecimientos de la misma empresa',
  'Traslado de bienes para transformación',
  'Recojo de bienes',
  'Traslado por emisor itinerante',
  'Traslado a zona primaria',
  'Venta con entrega a terceros',
  'Importación',
  'Exportación',
  'Otros',
];

const proveedorMotivos: MotivoTrasladoRemitente[] = [
  'Compra',
  'Venta con entrega a terceros',
  'Recojo de bienes',
];

const card: CSSProperties = {
  padding: '16px',
  border: '1px solid var(--erp-border)',
  borderRadius: '8px',
  backgroundColor: 'var(--erp-surface)',
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

const h: CSSProperties = {
  margin: '0 0 12px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--erp-text-primary)',
};

const initial = (): GuiaRemisionRemitenteFormData => ({
  tipo: 'GUIA_REMISION_REMITENTE',
  serie: 'T001',
  numero: '',
  fechaEmision: today(),
  fechaInicioTraslado: today(),

  destinatario: {
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    nombre: '',
  },

  motivoTraslado: 'Venta',
  modalidadTransporte: 'TRANSPORTE_PRIVADO',

  puntoPartida: {
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Lima',
    direccion: '',
  },

  puntoLlegada: {
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Lima',
    direccion: '',
  },

  retornoVehiculoVacio: false,
  retornoEnvasesVacios: false,
  transbordoProgramado: false,
  vehiculosCategoriaM1L: false,
  trasladoTotal: false,
  datosTransportista: false,

  vehiculos: [],
  conductores: [],
  bienes: [],

  pesoBrutoTotal: 0,
  unidadMedidaPeso: 'KGM',
  observaciones: '',
});

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '999px',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
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

      <span style={{ fontSize: '13px', color: disabled ? 'var(--erp-text-muted)' : 'var(--erp-text-primary)' }}>
        {label}
      </span>
    </div>
  );
}

const GuiaRemitenteForm = forwardRef<GuiaRemitenteFormHandle, Props>(({
  onSubmit,
  onCancel,
  loading,
}, ref) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (
    value: Partial<GuiaRemisionRemitenteFormData>,
  ) => {
    setForm((prev) => ({
      ...prev,
      ...value,
    }));
  };

  const isImport = form.motivoTraslado === 'Importación';
  const isExport = form.motivoTraslado === 'Exportación';
  const customs = isImport || isExport;

  const provider =
    proveedorMotivos.includes(form.motivoTraslado) ||
    form.motivoTraslado === 'Otros';

  const buyer = form.motivoTraslado === 'Otros';

  const establishments =
    form.motivoTraslado ===
    'Traslado entre establecimientos de la misma empresa';

  const showCarrier =
    form.modalidadTransporte === 'TRANSPORTE_PUBLICO' ||
    !!form.datosTransportista;

  const showVehicleDriver =
    form.modalidadTransporte === 'TRANSPORTE_PRIVADO' ||
    (form.modalidadTransporte === 'TRANSPORTE_PUBLICO' && !!form.datosTransportista);

  const location = (
    point: 'puntoPartida' | 'puntoLlegada',
    field: keyof Ubicacion,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [point]: {
        ...prev[point],
        [field]: value,
      },
    }));
  };

  const person = (
    key: 'proveedor' | 'comprador',
    field: keyof DatosPersonaGuia,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        nombre: '',
        ruc: '',
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const changeMotivo = (
    motivoTraslado: MotivoTrasladoRemitente,
  ) => {
    setForm((prev) => ({
      ...prev,
      motivoTraslado,

      proveedor:
        proveedorMotivos.includes(motivoTraslado) ||
        motivoTraslado === 'Otros'
          ? prev.proveedor
          : undefined,

      comprador:
        motivoTraslado === 'Otros'
          ? prev.comprador
          : undefined,

      descripcionMotivo:
        motivoTraslado === 'Otros'
          ? prev.descripcionMotivo
          : undefined,

      datosAduaneros: ['Importación', 'Exportación'].includes(
        motivoTraslado,
      )
        ? prev.datosAduaneros
        : undefined,

      puntoPartida: {
        ...prev.puntoPartida,
        codigoEstablecimiento:
          motivoTraslado ===
            'Traslado entre establecimientos de la misma empresa' ||
          motivoTraslado === 'Importación'
            ? prev.puntoPartida.codigoEstablecimiento
            : undefined,

        rucAsociado:
          motivoTraslado === 'Importación'
            ? prev.puntoPartida.rucAsociado
            : undefined,
      },

      puntoLlegada: {
        ...prev.puntoLlegada,
        codigoEstablecimiento:
          motivoTraslado ===
            'Traslado entre establecimientos de la misma empresa' ||
          motivoTraslado === 'Exportación'
            ? prev.puntoLlegada.codigoEstablecimiento
            : undefined,

        rucAsociado:
          motivoTraslado === 'Exportación'
            ? prev.puntoLlegada.rucAsociado
            : undefined,
      },
    }));
  };

  const changeModalidad = (
    modalidadTransporte: ModalidadTransporte,
  ) => {
    setForm((prev) => ({
      ...prev,
      modalidadTransporte,

      vehiculos:
        modalidadTransporte === 'TRANSPORTE_PRIVADO'
          ? prev.vehiculos
          : [],

      conductores:
        modalidadTransporte === 'TRANSPORTE_PRIVADO'
          ? prev.conductores
          : [],

      transportista:
        modalidadTransporte === 'TRANSPORTE_PUBLICO'
          ? prev.transportista
          : undefined,
      datosTransportista: modalidadTransporte === 'TRANSPORTE_PUBLICO' ? prev.datosTransportista : false,
    }));
  };

  const toggle = (
    key:
      | 'retornoVehiculoVacio'
      | 'retornoEnvasesVacios'
      | 'transbordoProgramado'
      | 'vehiculosCategoriaM1L'
      | 'trasladoTotal'
      | 'datosTransportista',
  ) => {
    setForm((prev) => {
      const value = !prev[key];

      if (key === 'retornoVehiculoVacio') {
        return {
          ...prev,
          retornoVehiculoVacio: value,
          retornoEnvasesVacios: value
            ? false
            : prev.retornoEnvasesVacios,
        };
      }

      if (key === 'retornoEnvasesVacios') {
        return {
          ...prev,
          retornoEnvasesVacios: value,
          retornoVehiculoVacio: value
            ? false
            : prev.retornoVehiculoVacio,
        };
      }

      if (key === 'vehiculosCategoriaM1L') {
        return {
          ...prev,
          vehiculosCategoriaM1L: value,
          datosTransportista: value
            ? false
            : prev.datosTransportista,
          transportista: value
            ? undefined
            : prev.transportista,
        };
      }

      if (key === 'datosTransportista') {
        return {
          ...prev,
          datosTransportista: value,
          vehiculosCategoriaM1L: value
            ? false
            : prev.vehiculosCategoriaM1L,
          transportista:
            value ||
            prev.modalidadTransporte ===
              'TRANSPORTE_PUBLICO'
              ? prev.transportista
              : undefined,
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const updateVehicle = (
    index: number,
    field: keyof DatosVehiculo,
    value: string,
  ) => {
    set({
      vehiculos: (form.vehiculos ?? []).map((v, i) =>
        i === index
          ? {
              ...v,
              [field]: value,
            }
          : v,
      ),
    });
  };

  const updateDriver = (
    index: number,
    field: keyof DatosConductor,
    value: string,
  ) => {
    set({
      conductores: (form.conductores ?? []).map((v, i) =>
        i === index
          ? {
              ...v,
              [field]: value,
            }
          : v,
      ),
    });
  };

  const updateItem = (
    index: number,
    field: keyof BienTransportado,
    value: string | number,
  ) => {
    set({
      bienes: form.bienes.map((v, i) =>
        i === index
          ? {
              ...v,
              [field]: value,
            }
          : v,
      ),
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.numero) {
      e.numero = 'El número es requerido';
    }

    if (
      !form.destinatario.numeroDocumento ||
      !form.destinatario.nombre
    ) {
      e.dest = 'Complete el destinatario';
    }

    if (
      form.fechaInicioTraslado < form.fechaEmision
    ) {
      e.fechas =
        'La fecha de traslado no puede ser anterior a la emisión';
    }

    if (
      !form.puntoPartida.direccion ||
      !form.puntoLlegada.direccion
    ) {
      e.ubicacion = 'Complete las direcciones';
    }

    if (
      showVehicleDriver &&
      (
        !form.vehiculos?.length ||
        !form.conductores?.length ||
        form.vehiculos.some(
          (x) =>
            !x.placa ||
            !x.numeroAutorizacion ||
            !x.entidadEmisora,
        ) ||
        form.conductores.some(
          (x) =>
            !x.numeroDocumento ||
            !x.nombre ||
            !x.apellidos ||
            !x.licenciaConducir,
        )
      )
    ) {
      e.privado =
        'Complete al menos un vehículo y conductor';
    }

    if (
      showCarrier &&
      (
        !form.transportista?.razonSocial ||
        !form.transportista.ruc ||
        !form.transportista.registroMTC
      )
    ) {
      e.transportista =
        'Complete los datos del transportista';
    }

    if (
      provider &&
      (!form.proveedor?.nombre || !form.proveedor.ruc)
    ) {
      e.proveedor =
        'Complete los datos del proveedor';
    }

    if (
      buyer &&
      (
        !form.comprador?.nombre ||
        !form.comprador.ruc ||
        !form.descripcionMotivo
      )
    ) {
      e.otros =
        'Complete comprador y descripción del motivo';
    }

    if (
      establishments &&
      (
        !form.puntoPartida.codigoEstablecimiento ||
        !form.puntoLlegada.codigoEstablecimiento
      )
    ) {
      e.establecimiento =
        'Complete ambos establecimientos';
    }

    if (
      isImport &&
      (
        !form.puntoPartida.codigoEstablecimiento ||
        !form.puntoPartida.rucAsociado
      )
    ) {
      e.establecimiento =
        'Complete establecimiento y RUC asociado de partida';
    }

    if (
      isExport &&
      (
        !form.puntoLlegada.codigoEstablecimiento ||
        !form.puntoLlegada.rucAsociado
      )
    ) {
      e.establecimiento =
        'Complete establecimiento y RUC asociado de llegada';
    }

    if (
      customs &&
      (
        !form.datosAduaneros?.tipoPuntoAduanero ||
        !form.datosAduaneros.puntoAduanero ||
        !form.datosAduaneros.cantidadBultos
      )
    ) {
      e.aduana =
        'Complete la información aduanera';
    }

    if (
      !form.bienes.length ||
      form.bienes.some(
        (x) => !x.descripcion || x.cantidad <= 0,
      )
    ) {
      e.bienes = 'Agregue bienes válidos';
    }

    if (form.pesoBrutoTotal <= 0) {
      e.peso = 'El peso debe ser mayor a cero';
    }

    setErrors(e);

    return !Object.keys(e).length;
  };

  const addLocationFields = (
    point: 'puntoPartida' | 'puntoLlegada',
    code: boolean,
    ruc: boolean,
  ) =>
    !(code || ruc) ? undefined : (
      <>
        {code && (
          <FormField
            label="Código de establecimiento"
            required
          >
            <input
              className="erp-form-control"
              value={
                form[point].codigoEstablecimiento ?? ''
              }
              onChange={(e) =>
                location(
                  point,
                  'codigoEstablecimiento',
                  e.target.value,
                )
              }
            />
          </FormField>
        )}

        {ruc && (
          <FormField label="RUC asociado" required>
            <input
              className="erp-form-control"
              maxLength={11}
              value={form[point].rucAsociado ?? ''}
              onChange={(e) =>
                location(
                  point,
                  'rucAsociado',
                  e.target.value,
                )
              }
            />
          </FormField>
        )}
      </>
    );

  const error = (key: string) =>
    errors[key] && (
      <p className="erp-form-error">
        {errors[key]}
      </p>
    );

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (validate()) {
        void onSubmit(form);
        return true;
      }
      return false;
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (validate()) {
          void onSubmit(form);
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <section style={card}>
        <h4 style={h}>DATOS DE LA GUÍA</h4>

        <div style={grid}>
          <FormField label="Tipo">
            <input
              className="erp-form-control"
              value="GUÍA DE REMISIÓN REMITENTE"
              disabled
            />
          </FormField>

          <FormField label="Serie">
            <input
              className="erp-form-control"
              value={form.serie}
              disabled
            />
          </FormField>

          <FormField
            label="Número"
            required
            error={errors.numero}
          >
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
        </div>
      </section>

      <section style={card}>
        <h4 style={h}>DESTINATARIO</h4>

        {error('dest')}

        <div style={grid}>
          <FormField label="Tipo de documento">
            <select
              className="erp-form-control"
              value={form.destinatario.tipoDocumento}
              onChange={(e) =>
                set({
                  destinatario: {
                    ...form.destinatario,
                    tipoDocumento: e.target.value,
                  },
                })
              }
            >
              <option>DNI</option>
              <option>RUC</option>
            </select>
          </FormField>

          <FormField label="Número" required>
            <input
              className="erp-form-control"
              value={form.destinatario.numeroDocumento}
              onChange={(e) =>
                set({
                  destinatario: {
                    ...form.destinatario,
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
              value={form.destinatario.nombre}
              onChange={(e) =>
                set({
                  destinatario: {
                    ...form.destinatario,
                    nombre: e.target.value,
                  },
                })
              }
            />
          </FormField>
        </div>
      </section>

      <section style={card}>
        <h4 style={h}>FECHAS</h4>

        {error('fechas')}

        <div style={grid}>
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

          <FormField label="Fecha de inicio del traslado">
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
        <h4 style={h}>
          MOTIVO DEL TRASLADO Y MODALIDAD
        </h4>

        <div style={grid}>
          <FormField label="Motivo de traslado">
            <select
              className="erp-form-control"
              value={form.motivoTraslado}
              onChange={(e) =>
                changeMotivo(
                  e.target.value as MotivoTrasladoRemitente,
                )
              }
            >
              {motivos.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Modalidad de transporte">
            <select
              className="erp-form-control"
              value={form.modalidadTransporte}
              onChange={(e) =>
                changeModalidad(
                  e.target.value as ModalidadTransporte,
                )
              }
            >
              <option value="TRANSPORTE_PRIVADO">
                Transporte Privado
              </option>

              <option value="TRANSPORTE_PUBLICO">
                Transporte Público
              </option>
            </select>
          </FormField>
        </div>

        {buyer && (
          <FormField
            label="Descripción del motivo"
            required
          >
            <input
              className="erp-form-control"
              value={form.descripcionMotivo ?? ''}
              onChange={(e) =>
                set({
                  descripcionMotivo: e.target.value,
                })
              }
            />
          </FormField>
        )}
      </section>

      <section style={card}>
        <h4 style={h}>OPCIONES DE TRANSPORTE</h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <Toggle
            checked={!!form.retornoVehiculoVacio}
            disabled={!!form.retornoEnvasesVacios}
            onChange={() => toggle('retornoVehiculoVacio')}
            label="Retorno de Vehículo Vacío"
          />

          <Toggle
            checked={!!form.retornoEnvasesVacios}
            disabled={!!form.retornoVehiculoVacio}
            onChange={() => toggle('retornoEnvasesVacios')}
            label="Retorno con Envases Vacíos"
          />

          <Toggle
            checked={!!form.transbordoProgramado}
            onChange={() => toggle('transbordoProgramado')}
            label="Transbordo Programado"
          />

          <Toggle
            checked={!!form.vehiculosCategoriaM1L}
            disabled={!!form.datosTransportista}
            onChange={() => toggle('vehiculosCategoriaM1L')}
            label="Vehículos Categoría M1 o L"
          />

          <Toggle
            checked={!!form.trasladoTotal}
            onChange={() => toggle('trasladoTotal')}
            label="Traslado total (DAM o DS)"
          />

          <Toggle
            checked={!!form.datosTransportista}
            disabled={!!form.vehiculosCategoriaM1L || form.modalidadTransporte === 'TRANSPORTE_PRIVADO'}
            onChange={() => toggle('datosTransportista')}
            label="Datos del Transportista"
          />
        </div>
      </section>

      {showVehicleDriver && (
        <PrivateTransport
          form={form}
          error={errors.privado}
          addVehicle={() =>
            set({
              vehiculos: [
                ...(form.vehiculos ?? []),
                {
                  placa: '',
                  numeroAutorizacion: '',
                  entidadEmisora: '',
                },
              ],
            })
          }
          addDriver={() =>
            set({
              conductores: [
                ...(form.conductores ?? []),
                {
                  tipoDocumento: 'DNI',
                  numeroDocumento: '',
                  nombre: '',
                  apellidos: '',
                  licenciaConducir: '',
                },
              ],
            })
          }
          updateVehicle={updateVehicle}
          updateDriver={updateDriver}
          removeVehicle={(i) =>
            set({
              vehiculos: form.vehiculos?.filter(
                (_, index) => index !== i,
              ),
            })
          }
          removeDriver={(i) =>
            set({
              conductores: form.conductores?.filter(
                (_, index) => index !== i,
              ),
            })
          }
        />
      )}

      {showCarrier && (
        <Carrier
          form={form}
          error={errors.transportista}
          onChange={(field, value) =>
            set({
              transportista: {
                ...form.transportista,
                [field]: value,
              },
            })
          }
        />
      )}

      {provider && (
        <PersonCard
          title="DATOS DEL PROVEEDOR"
          person={form.proveedor}
          error={errors.proveedor}
          onChange={(field, value) =>
            person('proveedor', field, value)
          }
        />
      )}

      {buyer && (
        <>
          <PersonCard
            title="DATOS DEL COMPRADOR"
            person={form.comprador}
            onChange={(field, value) =>
              person('comprador', field, value)
            }
          />
          {error('otros')}
        </>
      )}

      <UbicacionSelector
        label="PUNTO DE PARTIDA"
        {...form.puntoPartida}
        onDepartamentoChange={(v) =>
          location('puntoPartida', 'departamento', v)
        }
        onProvinciaChange={(v) =>
          location('puntoPartida', 'provincia', v)
        }
        onDistritoChange={(v) =>
          location('puntoPartida', 'distrito', v)
        }
        onDireccionChange={(v) =>
          location('puntoPartida', 'direccion', v)
        }
        errors={{
          direccion: errors.ubicacion,
        }}
        additionalFields={addLocationFields(
          'puntoPartida',
          establishments || isImport,
          isImport,
        )}
      />

      <UbicacionSelector
        label="PUNTO DE LLEGADA"
        {...form.puntoLlegada}
        onDepartamentoChange={(v) =>
          location('puntoLlegada', 'departamento', v)
        }
        onProvinciaChange={(v) =>
          location('puntoLlegada', 'provincia', v)
        }
        onDistritoChange={(v) =>
          location('puntoLlegada', 'distrito', v)
        }
        onDireccionChange={(v) =>
          location('puntoLlegada', 'direccion', v)
        }
        errors={{
          direccion: errors.ubicacion,
        }}
        additionalFields={addLocationFields(
          'puntoLlegada',
          establishments || isExport,
          isExport,
        )}
      />

      {customs && (
        <Customs
          form={form}
          error={errors.aduana}
          onChange={(datosAduaneros) =>
            set({
              datosAduaneros,
            })
          }
        />
      )}

      <Goods
        form={form}
        error={errors.bienes}
        onChange={(bienes) =>
          set({
            bienes,
          })
        }
        update={updateItem}
      />

      <section style={card}>
        <h4 style={h}>PESO BRUTO TOTAL</h4>

        {error('peso')}

        <div style={grid}>
          <FormField label="Valor" required>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="erp-form-control"
              value={form.pesoBrutoTotal || ''}
              onChange={(e) =>
                set({
                  pesoBrutoTotal: Number(e.target.value),
                })
              }
            />
          </FormField>

          <FormField label="Unidad de medida">
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
        <h4 style={h}>OBSERVACIONES</h4>

        <FormField label="Observaciones">
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
        </FormField>
      </section>

      {/* Footer */}
      <div className="erp-dialog-footer">
        {onCancel && (
          <button
            type="button"
            className="erp-btn erp-btn-sm erp-btn-secondary"
            onClick={onCancel}
            disabled={loading}
            id="dialog-cancel-btn"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          className="erp-btn erp-btn-sm erp-btn-primary"
          disabled={loading}
          id="dialog-confirm-btn"
        >
          {loading ? 'Guardando...' : 'Emitir Guía de Remisión Transportista'}
        </button>
      </div>
    </form>
  );
});

function PrivateTransport({
  form,
  error,
  addVehicle,
  addDriver,
  updateVehicle,
  updateDriver,
  removeVehicle,
  removeDriver,
}: {
  form: GuiaRemisionRemitenteFormData;
  error?: string;
  addVehicle: () => void;
  addDriver: () => void;
  updateVehicle: (
    i: number,
    f: keyof DatosVehiculo,
    v: string,
  ) => void;
  updateDriver: (
    i: number,
    f: keyof DatosConductor,
    v: string,
  ) => void;
  removeVehicle: (i: number) => void;
  removeDriver: (i: number) => void;
}) {
  return (
    <>
      <section style={card}>
        <h4 style={h}>VEHÍCULOS</h4>

        {error && (
          <p className="erp-form-error">
            {error}
          </p>
        )}

        <button
          type="button"
          className="erp-btn erp-btn-secondary erp-btn-sm"
          onClick={addVehicle}
        >
          + Agregar vehículo
        </button>

        {form.vehiculos?.map((v, i) => (
          <div
            key={i}
            style={{
              ...grid,
              marginTop: '12px',
            }}
          >
            <FormField label="Placa" required>
              <input
                className="erp-form-control"
                value={v.placa ?? ''}
                onChange={(e) =>
                  updateVehicle(
                    i,
                    'placa',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField
              label="Número de autorización"
              required
            >
              <input
                className="erp-form-control"
                value={v.numeroAutorizacion ?? ''}
                onChange={(e) =>
                  updateVehicle(
                    i,
                    'numeroAutorizacion',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField
              label="Entidad emisora"
              required
            >
              <select
                className="erp-form-control"
                value={v.entidadEmisora ?? ''}
                onChange={(e) =>
                  updateVehicle(
                    i,
                    'entidadEmisora',
                    e.target.value,
                  )
                }
              >
                <option value="">Seleccione</option>
                <option value="MTC">
                  Ministerio de Transportes y
                  Comunicaciones (MTC)
                </option>
              </select>
            </FormField>

            <div style={{ alignSelf: 'end' }}>
              <IconButton
                icon={<FiTrash2 />}
                tooltip="Eliminar vehículo"
                variant="danger"
                onClick={() => removeVehicle(i)}
              />
            </div>
          </div>
        ))}
      </section>

      <section style={card}>
        <h4 style={h}>CONDUCTORES</h4>

        <button
          type="button"
          className="erp-btn erp-btn-secondary erp-btn-sm"
          onClick={addDriver}
        >
          + Agregar conductor
        </button>

        {form.conductores?.map((v, i) => (
          <div
            key={i}
            style={{
              ...grid,
              marginTop: '12px',
            }}
          >
            <FormField label="DNI" required>
              <input
                className="erp-form-control"
                maxLength={8}
                value={v.numeroDocumento}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'numeroDocumento',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField label="Nombres" required>
              <input
                className="erp-form-control"
                value={v.nombre}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'nombre',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField label="Apellidos" required>
              <input
                className="erp-form-control"
                value={v.apellidos ?? ''}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'apellidos',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField
              label="Licencia de conducir"
              required
            >
              <input
                className="erp-form-control"
                value={v.licenciaConducir ?? ''}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'licenciaConducir',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <div style={{ alignSelf: 'end' }}>
              <IconButton
                icon={<FiTrash2 />}
                tooltip="Eliminar conductor"
                variant="danger"
                onClick={() => removeDriver(i)}
              />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function Carrier({
  form,
  error,
  onChange,
}: {
  form: GuiaRemisionRemitenteFormData;
  error?: string;
  onChange: (
    f: 'razonSocial' | 'ruc' | 'registroMTC',
    v: string,
  ) => void;
}) {
  return (
    <section style={card}>
      <h4 style={h}>DATOS DEL TRANSPORTISTA</h4>

      {error && (
        <p className="erp-form-error">
          {error}
        </p>
      )}

      <div style={grid}>
        <FormField
          label="Nombre / Razón social"
          required
        >
          <input
            className="erp-form-control"
            value={
              form.transportista?.razonSocial ?? ''
            }
            onChange={(e) =>
              onChange(
                'razonSocial',
                e.target.value,
              )
            }
          />
        </FormField>

        <FormField label="RUC" required>
          <input
            className="erp-form-control"
            maxLength={11}
            value={form.transportista?.ruc ?? ''}
            onChange={(e) =>
              onChange('ruc', e.target.value)
            }
          />
        </FormField>

        <FormField label="Registro MTC" required>
          <input
            className="erp-form-control"
            value={
              form.transportista?.registroMTC ?? ''
            }
            onChange={(e) =>
              onChange(
                'registroMTC',
                e.target.value,
              )
            }
          />
        </FormField>
      </div>
    </section>
  );
}

function PersonCard({
  title,
  person,
  error,
  onChange,
}: {
  title: string;
  person?: DatosPersonaGuia;
  error?: string;
  onChange: (
    f: keyof DatosPersonaGuia,
    v: string,
  ) => void;
}) {
  return (
    <section style={card}>
      <h4 style={h}>{title}</h4>

      {error && (
        <p className="erp-form-error">
          {error}
        </p>
      )}

      <div style={grid}>
        <FormField
          label="Nombre / Razón social"
          required
        >
          <input
            className="erp-form-control"
            value={person?.nombre ?? ''}
            onChange={(e) =>
              onChange(
                'nombre',
                e.target.value,
              )
            }
          />
        </FormField>

        <FormField label="RUC" required>
          <input
            className="erp-form-control"
            maxLength={11}
            value={person?.ruc ?? ''}
            onChange={(e) =>
              onChange(
                'ruc',
                e.target.value,
              )
            }
          />
        </FormField>
      </div>
    </section>
  );
}

function Customs({
  form,
  error,
  onChange,
}: {
  form: GuiaRemisionRemitenteFormData;
  error?: string;
  onChange: (
    v: NonNullable<GuiaRemisionRemitenteFormData['datosAduaneros']>,
  ) => void;
}) {
  type DatosAduaneros = NonNullable<GuiaRemisionRemitenteFormData['datosAduaneros']>;

  const data: DatosAduaneros =
    form.datosAduaneros ?? {
      contenedores: [
        { numero: '', precinto: '' },
        { numero: '', precinto: '' },
      ],
      tipoPuntoAduanero: '' as DatosAduaneros['tipoPuntoAduanero'],
      puntoAduanero: '',
      cantidadBultos: undefined,
    };

  const patch = (x: Partial<DatosAduaneros>) =>
    onChange({
      ...data,
      ...x,
    });

  const container = (
    i: number,
    field: 'numero' | 'precinto',
    value: string,
  ) =>
    patch({
      contenedores: [0, 1].map((n) =>
        n === i
          ? {
              ...(data.contenedores[n] ?? { numero: '', precinto: '' }),
              [field]: value,
            }
          : data.contenedores[n] ?? { numero: '', precinto: '' },
      ),
    });

  return (
    <section style={card}>
      <h4 style={h}>INFORMACIÓN ADUANERA</h4>

      {error && (
        <p className="erp-form-error">
          {error}
        </p>
      )}

      <div style={grid}>
        <FormField
          label="Tipo de punto aduanero"
          required
        >
          <select
            className="erp-form-control"
            value={data.tipoPuntoAduanero}
            onChange={(e) =>
              patch({
                tipoPuntoAduanero:
                  e.target.value as typeof data.tipoPuntoAduanero,
              })
            }
          >
            <option value="">Seleccione</option>
            <option value="PUERTO">
              Puerto
            </option>
            <option value="AEROPUERTO">
              Aeropuerto
            </option>
          </select>
        </FormField>

        <FormField
          label="Puerto / Aeropuerto"
          required
        >
          <input
            className="erp-form-control"
            value={data.puntoAduanero}
            onChange={(e) =>
              patch({
                puntoAduanero: e.target.value,
              })
            }
          />
        </FormField>

        <FormField
          label="Cantidad de bultos"
          required
        >
          <input
            type="number"
            min="1"
            className="erp-form-control"
            value={data.cantidadBultos ?? ''}
            onChange={(e) =>
              patch({
                cantidadBultos: Number(
                  e.target.value,
                ),
              })
            }
          />
        </FormField>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              padding: '10px',
              border:
                '1px solid var(--erp-border)',
              borderRadius: '6px',
              background:
                'var(--erp-surface)',
            }}
          >
            <FormField
              label={`Contenedor ${i + 1}`}
            >
              <input
                className="erp-form-control"
                value={
                  data.contenedores[i]?.numero ??
                  ''
                }
                onChange={(e) =>
                  container(
                    i,
                    'numero',
                    e.target.value,
                  )
                }
              />
            </FormField>

            <FormField
              label={`Precinto ${i + 1}`}
            >
              <input
                className="erp-form-control"
                value={
                  data.contenedores[i]?.precinto ??
                  ''
                }
                onChange={(e) =>
                  container(
                    i,
                    'precinto',
                    e.target.value,
                  )
                }
              />
            </FormField>
          </div>
        ))}
      </div>
    </section>
  );
}

function Goods({
  form,
  error,
  onChange,
  update,
}: {
  form: GuiaRemisionRemitenteFormData;
  error?: string;
  onChange: (v: BienTransportado[]) => void;
  update: (
    i: number,
    f: keyof BienTransportado,
    v: string | number,
  ) => void;
}) {
  return (
    <section style={card}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h4
          style={{
            ...h,
            margin: 0,
          }}
        >
          BIENES TRANSPORTADOS
        </h4>

        <IconButton
          icon={<FiPlus />}
          tooltip="Agregar un ítem"
          variant="primary"
          onClick={() =>
            onChange([
              ...form.bienes,
              {
                descripcion: '',
                cantidad: 1,
                unidadMedida: 'UNIDAD',
                pesoUnitario: 0,
              },
            ])
          }
        />
      </div>

      {error && (
        <p className="erp-form-error">
          {error}
        </p>
      )}

      {form.bienes.map((v, i) => (
        <div
          key={i}
          style={{
            ...grid,
            marginTop: '10px',
            padding: '10px',
            border:
              '1px solid var(--erp-border)',
            borderRadius: '6px',
            background:
              'var(--erp-surface)',
          }}
        >
          <FormField
            label="Descripción"
            required
          >
            <input
              className="erp-form-control"
              value={v.descripcion}
              onChange={(e) =>
                update(
                  i,
                  'descripcion',
                  e.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Cantidad"
            required
          >
            <input
              type="number"
              min="0.01"
              className="erp-form-control"
              value={v.cantidad}
              onChange={(e) =>
                update(
                  i,
                  'cantidad',
                  Number(e.target.value),
                )
              }
            />
          </FormField>

          <FormField label="Unidad de medida">
            <select
              className="erp-form-control"
              value={v.unidadMedida}
              onChange={(e) =>
                update(
                  i,
                  'unidadMedida',
                  e.target.value,
                )
              }
            >
              <option value="UNIDAD">
                Unidad
              </option>
              <option value="KGM">
                Kilogramo
              </option>
              <option value="LTR">
                Litro
              </option>
            </select>
          </FormField>

          <FormField label="Peso">
            <input
              type="number"
              min="0"
              className="erp-form-control"
              value={v.pesoUnitario ?? ''}
              onChange={(e) =>
                update(
                  i,
                  'pesoUnitario',
                  Number(e.target.value),
                )
              }
            />
          </FormField>

          <div
            style={{
              alignSelf: 'end',
            }}
          >
            <IconButton
              icon={<FiTrash2 />}
              tooltip="Eliminar ítem"
              variant="danger"
              onClick={() =>
                onChange(
                  form.bienes.filter(
                    (_, n) => n !== i,
                  ),
                )
              }
            />
          </div>
        </div>
      ))}
    </section>
  );
}

export default GuiaRemitenteForm;