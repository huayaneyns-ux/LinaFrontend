import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import FormField from '../../../../../../Components/ERP/FormField';
import IconButton from '../../../../../../Components/ERP/IconButton';
import UbicacionSelector from '../UbicacionSelector';
import { EMPRESA } from '../../../../../../Constantes/Empresa';
import { getNextDocumentNumber } from '../../../../../../Services/Admin/Comprobantes/ComprobanteMockService';

import type {
  BienTransportado,
  DatosConductor,
  DatosVehiculo,
  GuiaRemisionSelectDto,
  GuiaRemisionTransportistaFormData,
} from '../../../../../../Types/Admin/Comprobantes/Comprobante';

export interface GuiaTransportistaFormHandle {
  submit: () => boolean;
}

interface Props {
  guiasRemitente: GuiaRemisionSelectDto[];
  onSubmit: (data: GuiaRemisionTransportistaFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const defaultLocation = () => ({
  departamento: 'LIMA',
  provincia: 'LIMA',
  distrito: 'LIMA',
  direccion: '',
});

const randomNumero = () =>
  String(Math.floor(10000000 + Math.random() * 90000000));

const initial = (): GuiaRemisionTransportistaFormData => {
  const autoNumber = getNextDocumentNumber('GUIA_REMISION_TRANSPORTISTA');
  return {
    tipo: 'GUIA_REMISION_TRANSPORTISTA',
    serie: autoNumber.serie || 'V001',
    numero: autoNumber.numero || randomNumero(),
    fechaEmision: today(),
    fechaInicioTraslado: today(),

    transportista: {
      ruc: EMPRESA.ruc,
      razonSocial: EMPRESA.razonSocial,
      registroMTC: '00001',
    },

    fletePagadoPor: 'REMITENTE',
    terceroFlete: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      nombre: '',
    },

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

    puntoPartida: defaultLocation(),
    puntoLlegada: defaultLocation(),

    vehiculos: [
      {
        placa: '',
        numeroAutorizacion: '',
        entidadEmisora: '07',
      },
    ],
    conductores: [
      {
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombre: '',
        apellidos: '',
        licenciaConducir: '',
      },
    ],
    bienes: [
      {
        descripcion: '',
        cantidad: 1,
        unidadMedida: 'UNIDAD',
      },
    ],

    pesoBrutoTotal: 0,
    unidadMedidaPeso: 'KGM',
    observaciones: '',
  };
};

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

const GuiaTransportistaForm = forwardRef<GuiaTransportistaFormHandle, Props>(
  function GuiaTransportistaForm({ onSubmit, onCancel, loading }, ref) {
    const [form, setForm] = useState(initial);
    const [error, setError] = useState('');

    useEffect(() => {
      const autoNumber = getNextDocumentNumber('GUIA_REMISION_TRANSPORTISTA');
      setForm((prev) => ({
        ...prev,
        serie: autoNumber.serie || 'V001',
        numero: autoNumber.numero || randomNumero(),
      }));
    }, []);

    const set = (value: Partial<GuiaRemisionTransportistaFormData>) => {
      setForm((previous) => ({
        ...previous,
        ...value,
      }));
    };

    const submit = (): boolean => {
      if (
        !form.transportista.registroMTC?.trim() ||
        !form.remitente.nombre?.trim() ||
        !form.destinatario.nombre?.trim() ||
        form.pesoBrutoTotal <= 0
      ) {
        setError(
          'Complete los campos obligatorios (remitente, destinatario, registro MTC y peso bruto total mayor a 0).',
        );
        return false;
      }

      if (
        form.transporteSubcontratado &&
        (!form.empresaSubcontrata?.trim() ||
          !/^\d{11}$/.test(form.rucEmpresaSubcontrata ?? ''))
      ) {
        setError(
          'Complete la empresa subcontratada y un RUC válido de 11 dígitos.',
        );
        return false;
      }

      // Validación de Flete por Tercero
      if (form.fletePagadoPor === 'TERCERO') {
        const tercero = form.terceroFlete;
        if (!tercero?.nombre?.trim()) {
          setError(
            'Debe ingresar el nombre o razón social de quien pagó el servicio (Tercero).',
          );
          return false;
        }
        if (!tercero.numeroDocumento?.trim()) {
          setError(
            'Debe ingresar el número de documento de quien pagó el servicio (Tercero).',
          );
          return false;
        }
        const tipoDoc = tercero.tipoDocumento || 'RUC';
        const numDoc = tercero.numeroDocumento.trim();
        if (tipoDoc === 'RUC' && !/^\d{11}$/.test(numDoc)) {
          setError(
            'El RUC de quien pagó el servicio debe tener exactamente 11 dígitos numéricos.',
          );
          return false;
        }
        if (tipoDoc === 'DNI' && !/^\d{8}$/.test(numDoc)) {
          setError(
            'El DNI de quien pagó el servicio debe tener exactamente 8 dígitos numéricos.',
          );
          return false;
        }
        if (tipoDoc === 'CE' && !/^\d{9,12}$/.test(numDoc)) {
          setError(
            'El Carnet de Extranjería debe tener entre 9 y 12 dígitos.',
          );
          return false;
        }
        if (tipoDoc === 'PASAPORTE' && numDoc.length < 6) {
          setError('El Pasaporte debe tener al menos 6 caracteres.');
          return false;
        }
      }

      // Validación de Vehículos
      if (!form.vehiculos || form.vehiculos.length === 0) {
        setError('Debe registrar al menos un vehículo.');
        return false;
      }
      for (let i = 0; i < form.vehiculos.length; i++) {
        const v = form.vehiculos[i];
        const placa = v.placa?.trim().toUpperCase() ?? '';
        const auth = v.numeroAutorizacion?.trim() ?? '';
        if (!placa) {
          setError(`Debe ingresar la placa del vehículo #${i + 1}.`);
          return false;
        }
        if (!/^[A-Z0-9]{6,8}$/.test(placa)) {
          setError(
            `La placa del vehículo #${i + 1} ("${placa}") debe tener entre 6 y 8 caracteres alfanuméricos sin caracteres especiales.`,
          );
          return false;
        }
        if (!auth) {
          setError(
            `Debe ingresar el número de TUC / autorización del vehículo #${i + 1}.`,
          );
          return false;
        }
        if (auth.length > 20) {
          setError(
            `El número de TUC / autorización del vehículo #${i + 1} no puede superar los 20 caracteres.`,
          );
          return false;
        }
      }

      // Validación de Conductores
      if (!form.conductores || form.conductores.length === 0) {
        setError('Debe registrar al menos un conductor.');
        return false;
      }
      for (let i = 0; i < form.conductores.length; i++) {
        const c = form.conductores[i];
        if (!c.numeroDocumento?.trim()) {
          setError(
            `Debe ingresar el número de documento del conductor #${i + 1}.`,
          );
          return false;
        }
        if (!c.nombre?.trim()) {
          setError(`Debe ingresar los nombres del conductor #${i + 1}.`);
          return false;
        }
        const lic = c.licenciaConducir?.trim().toUpperCase() ?? '';
        if (!lic) {
          setError(
            `Debe ingresar la licencia de conducir del conductor #${i + 1}.`,
          );
          return false;
        }
        if (lic.length < 9 || lic.length > 10) {
          setError(
            `La licencia de conducir del conductor #${i + 1} ("${lic}") debe tener entre 9 y 10 caracteres.`,
          );
          return false;
        }
      }

      // Validación de Bienes
      if (!form.bienes || form.bienes.length === 0) {
        setError('Debe registrar al menos un bien para el traslado.');
        return false;
      }
      for (let i = 0; i < form.bienes.length; i++) {
        const b = form.bienes[i];
        if (!b.descripcion?.trim()) {
          setError(`Debe ingresar la descripción del bien #${i + 1}.`);
          return false;
        }
        const qty = Number(b.cantidad);
        if (isNaN(qty) || qty <= 0) {
          setError(
            `La cantidad del bien #${i + 1} debe ser mayor a 0 (permite enteros y decimales).`,
          );
          return false;
        }
      }

      if (form.fechaInicioTraslado < form.fechaEmision) {
        setError('La fecha de traslado no puede ser anterior a la emisión.');
        return false;
      }

      setError('');
      onSubmit({
        ...form,
        numero: form.numero || randomNumero(),
      });
      return true;
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        return submit();
      },
    }));

    const addVehicle = () =>
      set({
        vehiculos: [
          ...(form.vehiculos ?? []),
          {
            placa: '',
            numeroAutorizacion: '',
            entidadEmisora: '07',
          },
        ],
      });

    const addDriver = () =>
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
      });

    const addBien = () =>
      set({
        bienes: [
          ...(form.bienes ?? []),
          {
            descripcion: '',
            cantidad: 1,
            unidadMedida: 'UNIDAD',
          },
        ],
      });

    const updateVehicle = (
      index: number,
      field: keyof DatosVehiculo,
      value: string,
    ) => {
      set({
        vehiculos: (form.vehiculos ?? []).map((vehicle, i) =>
          i === index ? { ...vehicle, [field]: value } : vehicle,
        ),
      });
    };

    const updateDriver = (
      index: number,
      field: keyof DatosConductor,
      value: string,
    ) => {
      set({
        conductores: (form.conductores ?? []).map((driver, i) =>
          i === index ? { ...driver, [field]: value } : driver,
        ),
      });
    };

    const updateBien = (
      index: number,
      field: keyof BienTransportado,
      value: any,
    ) => {
      set({
        bienes: (form.bienes ?? []).map((bien, i) =>
          i === index ? { ...bien, [field]: value } : bien,
        ),
      });
    };

    const removeVehicle = (i: number) => {
      set({
        vehiculos: form.vehiculos?.filter((_, index) => index !== i),
      });
    };

    const removeDriver = (i: number) => {
      set({
        conductores: form.conductores?.filter((_, index) => index !== i),
      });
    };

    const removeBien = (i: number) => {
      set({
        bienes: form.bienes?.filter((_, index) => index !== i),
      });
    };

    const person = (key: 'remitente' | 'destinatario', label: string) => (
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
              <option value="RUC">RUC</option>
              <option value="DNI">DNI</option>
            </select>
          </FormField>

          <FormField label="Número de Documento" required>
            <input
              className="erp-form-control"
              value={form[key].numeroDocumento}
              maxLength={11}
              placeholder={form[key].tipoDocumento === 'RUC' ? '20XXXXXXXXX' : 'XXXXXXXX'}
              onChange={(e) =>
                set({
                  [key]: {
                    ...form[key],
                    numeroDocumento: e.target.value.replace(/\D/g, ''),
                  },
                })
              }
            />
          </FormField>

          <FormField label="Nombre / Razón social" required>
            <input
              className="erp-form-control"
              placeholder={form[key].tipoDocumento === 'RUC' ? 'Empresa S.A.C.' : 'Nombres y Apellidos'}
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
        {error && <p className="erp-form-error">{error}</p>}

        <section style={card}>
          <h4 style={title}>DATOS DE LA GUÍA TRANSPORTISTA (TIPO 31)</h4>

          <div style={grid}>
            <FormField label="Serie">
              <input
                className="erp-form-control"
                value={form.serie}
                disabled
                style={{ backgroundColor: 'var(--erp-bg-subtle, #f8fafc)', fontWeight: 600 }}
              />
            </FormField>

            <FormField label="Fecha de emisión" required>
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

            <FormField label="Inicio del traslado" required>
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

          {/* Toggles */}
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
                  ...(v
                    ? {}
                    : {
                        empresaSubcontrata: '',
                        rucEmpresaSubcontrata: '',
                        ...(form.fletePagadoPor === 'SUBCONTRATADOR'
                          ? { fletePagadoPor: 'REMITENTE' }
                          : {}),
                      }),
                })
              }
              label="Transporte Subcontratado"
            />
          </div>
              
          {/* Campos condicionales cuando el transporte es subcontratado */}
          {form.transporteSubcontratado && (
            <div
              style={{
                ...grid,
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--erp-bg-subtle, #f8fafc)',
                border: '1px dashed var(--erp-primary, #2563eb)',
                borderRadius: '6px',
              }}
            >
              <FormField label="Empresa que subcontrata" required>
                <input
                  className="erp-form-control"
                  placeholder="Razón Social de la empresa subcontratada"
                  value={form.empresaSubcontrata ?? ''}
                  onChange={(e) => set({ empresaSubcontrata: e.target.value })}
                />
              </FormField>

              <FormField label="Número de RUC" required>
                <input
                  className="erp-form-control"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="20XXXXXXXXX"
                  value={form.rucEmpresaSubcontrata ?? ''}
                  onChange={(e) =>
                    set({
                      rucEmpresaSubcontrata: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 11),
                    })
                  }
                />
              </FormField>
            </div>
          )}
        </section>
        <section style={card}>
          <h4 style={title}>FLETE</h4>
          <FormField label="Flete pagado por">
            <select
              className="erp-form-control"
              value={form.fletePagadoPor}
              onChange={(e) => {
                const val = e.target
                  .value as GuiaRemisionTransportistaFormData['fletePagadoPor'];
                set({
                  fletePagadoPor: val,
                  ...(val === 'TERCERO'
                    ? {
                        terceroFlete: form.terceroFlete || {
                          tipoDocumento: 'RUC',
                          numeroDocumento: '',
                          nombre: '',
                        },
                      }
                    : {}),
                });
              }}
            >
              <option value="REMITENTE">Remitente</option>
              <option
                value="SUBCONTRATADOR"
                disabled={!form.transporteSubcontratado}
              >
                Subcontratador
              </option>
              <option value="TERCERO">Tercero</option>
            </select>
          </FormField>

          {/* Campos condicionales cuando el flete es pagado por Tercero */}
          {form.fletePagadoPor === 'TERCERO' && (
            <div
              style={{
                ...grid,
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--erp-bg-subtle, #f8fafc)',
                border: '1px dashed var(--erp-primary, #2563eb)',
                borderRadius: '6px',
              }}
            >
              <FormField label="Nombre de quien pagó el servicio" required>
                <input
                  className="erp-form-control"
                  placeholder="Nombre completo o Razón Social"
                  value={form.terceroFlete?.nombre ?? ''}
                  onChange={(e) =>
                    set({
                      terceroFlete: {
                        tipoDocumento:
                          form.terceroFlete?.tipoDocumento || 'RUC',
                        numeroDocumento:
                          form.terceroFlete?.numeroDocumento || '',
                        nombre: e.target.value,
                      },
                    })
                  }
                />
              </FormField>

              <FormField label="Tipo de comprobante" required>
                <select
                  className="erp-form-control"
                  value={form.terceroFlete?.tipoDocumento || 'RUC'}
                  onChange={(e) =>
                    set({
                      terceroFlete: {
                        nombre: form.terceroFlete?.nombre || '',
                        numeroDocumento: '',
                        tipoDocumento: e.target.value,
                      },
                    })
                  }
                >
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </FormField>

              <FormField label="Número de documento" required>
                <input
                  className="erp-form-control"
                  placeholder={
                    form.terceroFlete?.tipoDocumento === 'RUC'
                      ? '20XXXXXXXXX (11 dígitos)'
                      : form.terceroFlete?.tipoDocumento === 'DNI'
                        ? 'XXXXXXXX (8 dígitos)'
                        : 'Número de documento'
                  }
                  maxLength={
                    form.terceroFlete?.tipoDocumento === 'RUC'
                      ? 11
                      : form.terceroFlete?.tipoDocumento === 'DNI'
                        ? 8
                        : 12
                  }
                  value={form.terceroFlete?.numeroDocumento ?? ''}
                  onChange={(e) => {
                    const isNumeric =
                      form.terceroFlete?.tipoDocumento === 'RUC' ||
                      form.terceroFlete?.tipoDocumento === 'DNI';
                    const cleanVal = isNumeric
                      ? e.target.value.replace(/\D/g, '')
                      : e.target.value.replace(/[^A-Za-z0-9]/g, '');
                    set({
                      terceroFlete: {
                        nombre: form.terceroFlete?.nombre || '',
                        tipoDocumento:
                          form.terceroFlete?.tipoDocumento || 'RUC',
                        numeroDocumento: cleanVal,
                      },
                    });
                  }}
                />
              </FormField>
            </div>
          )}
        </section>        
        <section style={card}>
          <h4 style={title}>DATOS DEL TRANSPORTISTA</h4>
          <div style={grid}>
            <FormField label="RUC Transportista">
              <input
                className="erp-form-control"
                value={form.transportista.ruc ?? EMPRESA.ruc}
                disabled
              />
            </FormField>
            <FormField label="Razón Social">
              <input
                className="erp-form-control"
                value={form.transportista.razonSocial ?? EMPRESA.razonSocial}
                disabled
              />
            </FormField>
            <FormField label="Registro MTC" required>
              <input
                className="erp-form-control"
                placeholder="Ej. 00001 / Número de Registro MTC"
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

        {person('remitente', 'DATOS DEL REMITENTE')}

        {person('destinatario', 'DATOS DEL DESTINATARIO')}

        <section style={card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              VEHÍCULOS
            </h4>
            <button
              type="button"
              className="erp-btn erp-btn-secondary erp-btn-sm"
              onClick={addVehicle}
            >
              + Agregar vehículo
            </button>
          </div>

          {form.vehiculos?.map((vehicle, index) => (
            <div
              key={index}
              style={{
                ...grid,
                marginTop: '12px',
                padding: '12px',
                border: '1px solid var(--erp-border)',
                borderRadius: '6px',
                background: 'var(--erp-surface)',
              }}
            >
              <FormField label="Placa" required>
                <input
                  className="erp-form-control"
                  placeholder="Ej. ABC123 (6 a 8 car.)"
                  maxLength={8}
                  value={vehicle.placa ?? ''}
                  onChange={(e) =>
                    updateVehicle(
                      index,
                      'placa',
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 8),
                    )
                  }
                />
              </FormField>

              <FormField label="Tarjeta Única de Circulación (TUC) / Autorización" required>
                <input
                  className="erp-form-control"
                  placeholder="Ej. 3452 / Número de TUC"
                  maxLength={20}
                  value={vehicle.numeroAutorizacion ?? ''}
                  onChange={(e) =>
                    updateVehicle(
                      index,
                      'numeroAutorizacion',
                      e.target.value.slice(0, 20),
                    )
                  }
                />
              </FormField>

              <FormField label="Entidad emisora" required>
                <select
                  className="erp-form-control"
                  value={vehicle.entidadEmisora || '07'}
                  onChange={(e) =>
                    updateVehicle(index, 'entidadEmisora', e.target.value)
                  }
                >
                  <option value="07">
                    07 - Ministerio de Transportes y Comunicaciones (MTC)
                  </option>
                  <option value="01">01 - MTC - Nacional</option>
                  <option value="02">
                    02 - Municipalidad Metropolitana de Lima
                  </option>
                  <option value="03">03 - Gobierno Regional</option>
                  <option value="04">04 - Municipalidad Provincial</option>
                </select>
              </FormField>

              <div style={{ alignSelf: 'end' }}>
                <IconButton
                  icon={<FiTrash2 />}
                  tooltip="Eliminar vehículo"
                  variant="danger"
                  onClick={() => removeVehicle(index)}
                />
              </div>
            </div>
          ))}
        </section>

        <section style={card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              CONDUCTORES
            </h4>
            <button
              type="button"
              className="erp-btn erp-btn-secondary erp-btn-sm"
              onClick={addDriver}
            >
              + Agregar conductor
            </button>
          </div>

          {form.conductores?.map((driver, index) => (
            <div
              key={index}
              style={{
                ...grid,
                marginTop: '12px',
                padding: '12px',
                border: '1px solid var(--erp-border)',
                borderRadius: '6px',
                background: 'var(--erp-surface)',
              }}
            >
              <FormField label="Tipo de documento">
                <select
                  className="erp-form-control"
                  value={driver.tipoDocumento}
                  onChange={(e) =>
                    updateDriver(index, 'tipoDocumento', e.target.value)
                  }
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </FormField>

              <FormField label="Número Documento" required>
                <input
                  className="erp-form-control"
                  maxLength={12}
                  value={driver.numeroDocumento}
                  onChange={(e) =>
                    updateDriver(index, 'numeroDocumento', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Nombres" required>
                <input
                  className="erp-form-control"
                  value={driver.nombre}
                  onChange={(e) =>
                    updateDriver(index, 'nombre', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Apellidos" required>
                <input
                  className="erp-form-control"
                  value={driver.apellidos ?? ''}
                  onChange={(e) =>
                    updateDriver(index, 'apellidos', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Licencia de conducir" required>
                <input
                  className="erp-form-control"
                  placeholder="Ej. Q12345678 (9 a 10 car.)"
                  maxLength={10}
                  value={driver.licenciaConducir ?? ''}
                  onChange={(e) =>
                    updateDriver(
                      index,
                      'licenciaConducir',
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 10),
                    )
                  }
                />
              </FormField>

              <div style={{ alignSelf: 'end' }}>
                <IconButton
                  icon={<FiTrash2 />}
                  tooltip="Eliminar conductor"
                  variant="danger"
                  onClick={() => removeDriver(index)}
                />
              </div>
            </div>
          ))}
        </section>

        

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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              BIENES / MERCADERÍA A TRANSPORTAR
            </h4>
            <IconButton
              icon={<FiPlus />}
              tooltip="Agregar un ítem"
              variant="primary"
              onClick={addBien}
            />
          </div>

          {form.bienes?.map((item, index) => (
            <div
              key={index}
              style={{
                ...grid,
                marginTop: '10px',
                padding: '10px',
                border: '1px solid var(--erp-border)',
                borderRadius: '6px',
                background: 'var(--erp-surface)',
              }}
            >
              <FormField label="Descripción del bien" required>
                <input
                  className="erp-form-control"
                  placeholder="Ej. Cajas de útiles de escritorio"
                  value={item.descripcion}
                  onChange={(e) =>
                    updateBien(index, 'descripcion', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Cantidad" required>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  className="erp-form-control"
                  placeholder="Ej. 1 o 2.5"
                  value={item.cantidad || ''}
                  onChange={(e) =>
                    updateBien(
                      index,
                      'cantidad',
                      e.target.value === '' ? 0 : Number(e.target.value),
                    )
                  }
                />
              </FormField>

              <FormField label="Unidad de medida">
                <select
                  className="erp-form-control"
                  value={item.unidadMedida}
                  onChange={(e) =>
                    updateBien(index, 'unidadMedida', e.target.value)
                  }
                >
                  <option value="UNIDAD">Unidades (NIU)</option>
                  <option value="KGM">Kilogramos (KGM)</option>
                  <option value="TNE">Toneladas (TNE)</option>
                  <option value="LTR">Litros (LTR)</option>
                </select>
              </FormField>

              <div style={{ alignSelf: 'end' }}>
                <IconButton
                  icon={<FiTrash2 />}
                  tooltip="Eliminar ítem"
                  variant="danger"
                  onClick={() => removeBien(index)}
                />
              </div>
            </div>
          ))}
        </section>

        <section style={card}>
          <h4 style={title}>PESO BRUTO TOTAL Y FLETE</h4>

          <div style={grid}>
            <FormField label="Peso Bruto Total" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej. 1500"
                className="erp-form-control"
                value={form.pesoBrutoTotal || ''}
                onChange={(e) =>
                  set({
                    pesoBrutoTotal: Number(e.target.value),
                  })
                }
              />
            </FormField>

            <FormField label="Unidad de Medida">
              <select
                className="erp-form-control"
                value={form.unidadMedidaPeso}
                onChange={(e) =>
                  set({
                    unidadMedidaPeso: e.target.value,
                  })
                }
              >
                <option value="KGM">Kilogramos (KGM)</option>
                <option value="TNE">Toneladas (TNE)</option>
              </select>
            </FormField>
          </div>
        </section>

        <section style={card}>
          <h4 style={title}>OBSERVACIONES</h4>

          <textarea
            className="erp-form-control"
            rows={3}
            placeholder="Observaciones o notas adicionales (opcional)..."
            value={form.observaciones ?? ''}
            onChange={(e) =>
              set({
                observaciones: e.target.value,
              })
            }
          />
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
            {loading ? 'Enviando a SUNAT...' : 'Emitir Guía de Remisión Transportista'}
          </button>
        </div>
      </form>
    );
  },
);

export default GuiaTransportistaForm;