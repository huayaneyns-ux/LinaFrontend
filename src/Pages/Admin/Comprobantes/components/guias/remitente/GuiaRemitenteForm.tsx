import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import FormField from '../../../../../../Components/ERP/FormField';
import IconButton from '../../../../../../Components/ERP/IconButton';
import UbicacionSelector from '../UbicacionSelector';
import { EMPRESA } from '../../../../../../Constantes/Empresa';
import { getNextDocumentNumber } from '../../../../../../Services/Admin/Comprobantes/ComprobanteMockService';

import type {
  BienTransportado,
  DatosConductor,
  DatosPersonaGuia,
  DatosTransportista,
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
  onSubmit: (data: GuiaRemisionRemitenteFormData) => void | Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);
const randomNumero = () =>
  String(Math.floor(10000000 + Math.random() * 90000000));

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
  'Venta con entrega a terceros',
  'Otros',
];

const proveedorMotivos: MotivoTrasladoRemitente[] = [
  'Compra',
  'Recojo de bienes',
  'Otros',
];

const compradorMotivos: MotivoTrasladoRemitente[] = [
  'Venta con entrega a terceros',
  'Otros',
];

const isDestinatarioMismaTienda = (m: MotivoTrasladoRemitente) =>
  [
    'Compra',
    'Recojo de bienes',
    'Traslado entre establecimientos de la misma empresa',
  ].includes(m);

const card: CSSProperties = {
  padding: '16px',
  border: '1px solid var(--erp-border)',
  borderRadius: '8px',
  backgroundColor: 'var(--erp-surface)',
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
  numero: randomNumero(),
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
      pesoUnitario: 0,
    },
  ],

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
          backgroundColor: checked
            ? 'var(--erp-primary, #2563eb)'
            : 'var(--erp-border)',
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
          color: checked
            ? 'var(--erp-text-primary)'
            : 'var(--erp-text-secondary)',
          minWidth: '18px',
        }}
      >
        {checked ? 'Sí' : 'No'}
      </span>

      <span
        style={{
          fontSize: '13px',
          color: disabled
            ? 'var(--erp-text-muted)'
            : 'var(--erp-text-primary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

const GuiaRemitenteForm = forwardRef<GuiaRemitenteFormHandle, Props>(
  ({ onSubmit, onCancel, loading }, ref) => {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      const autoNumber = getNextDocumentNumber('GUIA_REMISION_REMITENTE');
      setForm((prev) => ({
        ...prev,
        serie: autoNumber.serie || 'T001',
        numero: autoNumber.numero || randomNumero(),
      }));
    }, []);

    const set = (value: Partial<GuiaRemisionRemitenteFormData>) => {
      setForm((prev) => ({
        ...prev,
        ...value,
      }));
    };

    const provider = proveedorMotivos.includes(form.motivoTraslado);
    const buyer = compradorMotivos.includes(form.motivoTraslado);
    const isOther = form.motivoTraslado === 'Otros';

    const establishments =
      form.motivoTraslado ===
      'Traslado entre establecimientos de la misma empresa';

    const isSameStoreDestination = isDestinatarioMismaTienda(
      form.motivoTraslado,
    );

    const showCarrier =
      form.modalidadTransporte === 'TRANSPORTE_PUBLICO' &&
      !form.vehiculosCategoriaM1L;

    const showVehicleDriver =
      form.modalidadTransporte === 'TRANSPORTE_PRIVADO' ||
      (form.modalidadTransporte === 'TRANSPORTE_PUBLICO' &&
        !!form.datosTransportista);

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

    const changeMotivo = (motivoTraslado: MotivoTrasladoRemitente) => {
      const isMismaTienda = isDestinatarioMismaTienda(motivoTraslado);

      setForm((prev) => {
        let destinatario = prev.destinatario;
        if (isMismaTienda) {
          destinatario = {
            tipoDocumento: 'RUC',
            numeroDocumento: EMPRESA.ruc,
            nombre: EMPRESA.razonSocial,
          };
        } else if (destinatario.numeroDocumento === EMPRESA.ruc) {
          destinatario = {
            tipoDocumento: 'RUC',
            numeroDocumento: '',
            nombre: '',
          };
        }

        return {
          ...prev,
          motivoTraslado,
          destinatario,

          proveedor: proveedorMotivos.includes(motivoTraslado)
            ? prev.proveedor || { ruc: '', nombre: '' }
            : undefined,

          comprador: compradorMotivos.includes(motivoTraslado)
            ? prev.comprador || { ruc: '', nombre: '' }
            : undefined,

          descripcionMotivo:
            motivoTraslado === 'Otros'
              ? prev.descripcionMotivo || ''
              : undefined,

          puntoPartida: {
            ...prev.puntoPartida,
            codigoEstablecimiento:
              motivoTraslado ===
              'Traslado entre establecimientos de la misma empresa'
                ? prev.puntoPartida.codigoEstablecimiento ||
                  EMPRESA.codigoLocalAnexo ||
                  '0000'
                : undefined,
          },

          puntoLlegada: {
            ...prev.puntoLlegada,
            codigoEstablecimiento:
              motivoTraslado ===
              'Traslado entre establecimientos de la misma empresa'
                ? prev.puntoLlegada.codigoEstablecimiento || '0001'
                : undefined,
          },
        };
      });
      setErrors({});
    };

    const changeModalidad = (modalidadTransporte: ModalidadTransporte) => {
      setForm((prev) => ({
        ...prev,
        modalidadTransporte,

        vehiculos:
          modalidadTransporte === 'TRANSPORTE_PRIVADO'
            ? prev.vehiculos?.length
              ? prev.vehiculos
              : [
                  {
                    placa: '',
                    numeroAutorizacion: '',
                    entidadEmisora: '07',
                  },
                ]
            : prev.vehiculos,

        conductores:
          modalidadTransporte === 'TRANSPORTE_PRIVADO'
            ? prev.conductores?.length
              ? prev.conductores
              : [
                  {
                    tipoDocumento: 'DNI',
                    numeroDocumento: '',
                    nombre: '',
                    apellidos: '',
                    licenciaConducir: '',
                  },
                ]
            : prev.conductores,

        transportista:
          modalidadTransporte === 'TRANSPORTE_PUBLICO'
            ? prev.transportista || {
                ruc: '',
                razonSocial: '',
                registroMTC: '',
              }
            : undefined,

        datosTransportista:
          modalidadTransporte === 'TRANSPORTE_PUBLICO'
            ? prev.datosTransportista
            : false,
      }));
      setErrors({});
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
            datosTransportista: value ? false : prev.datosTransportista,
            transportista: value ? undefined : prev.transportista,
          };
        }

        if (key === 'datosTransportista') {
          return {
            ...prev,
            datosTransportista: value,
            vehiculosCategoriaM1L: value
              ? false
              : prev.vehiculosCategoriaM1L,
            vehiculos:
              value && (!prev.vehiculos || prev.vehiculos.length === 0)
                ? [
                    {
                      placa: '',
                      numeroAutorizacion: '',
                      entidadEmisora: '07',
                    },
                  ]
                : prev.vehiculos,
            conductores:
              value &&
              (!prev.conductores || prev.conductores.length === 0)
                ? [
                    {
                      tipoDocumento: 'DNI',
                      numeroDocumento: '',
                      nombre: '',
                      apellidos: '',
                      licenciaConducir: '',
                    },
                  ]
                : prev.conductores,
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

    const validate = (): boolean => {
      const e: Record<string, string> = {};

      // Validación de Destinatario
      const destDoc = form.destinatario.numeroDocumento?.trim() || '';
      const destNombre = form.destinatario.nombre?.trim() || '';

      if (!destDoc || !destNombre) {
        e.dest =
          'Complete los datos del destinatario (documento y razón social/nombre).';
      } else {
        if (isSameStoreDestination) {
          if (destDoc !== EMPRESA.ruc) {
            e.dest = `Para el motivo "${form.motivoTraslado}", el destinatario debe ser la misma empresa emisora (${EMPRESA.ruc}).`;
          }
        } else {
          if (destDoc === EMPRESA.ruc) {
            e.dest = `Para el motivo "${form.motivoTraslado}", el RUC del destinatario no puede ser el de la empresa emisora (${EMPRESA.ruc}).`;
          }
        }
      }

      // Validación de Fechas
      if (!form.fechaEmision) {
        e.fechas = 'La fecha de emisión es requerida.';
      } else if (form.fechaInicioTraslado < form.fechaEmision) {
        e.fechas =
          'La fecha de inicio de traslado no puede ser anterior a la fecha de emisión.';
      }

      // Validación de Direcciones
      if (
        !form.puntoPartida.direccion?.trim() ||
        !form.puntoLlegada.direccion?.trim()
      ) {
        e.ubicacion =
          'Complete las direcciones del punto de partida y punto de llegada.';
      }

      // Validación de Códigos de Establecimiento (Traslado entre establecimientos)
      if (establishments) {
        const cp =
          form.puntoPartida.codigoEstablecimiento?.trim() || '';
        const cl =
          form.puntoLlegada.codigoEstablecimiento?.trim() || '';

        if (!cp || !cl) {
          e.establecimiento =
            'Debe ingresar los códigos de establecimiento de partida y llegada.';
        } else if (!/^\d{4}$/.test(cp) || !/^\d{4}$/.test(cl)) {
          e.establecimiento =
            'Los códigos de establecimiento deben tener exactamente 4 dígitos numéricos (ej. 0000, 0001).';
        }
      }

      // Validación de Proveedor
      if (provider) {
        const provRuc = form.proveedor?.ruc?.trim() || '';
        const provNombre = form.proveedor?.nombre?.trim() || '';

        if (!provRuc || !provNombre) {
          e.proveedor =
            'Complete los datos del proveedor (RUC y Razón Social).';
        } else if (!/^\d{11}$/.test(provRuc)) {
          e.proveedor =
            'El RUC del proveedor debe tener exactamente 11 dígitos.';
        }
      }

      // Validación de Comprador
      if (buyer) {
        const compRuc = form.comprador?.ruc?.trim() || '';
        const compNombre = form.comprador?.nombre?.trim() || '';

        if (!compRuc || !compNombre) {
          e.comprador =
            'Complete los datos del comprador (RUC/DNI y Razón Social / Nombre).';
        } else if (!/^\d{8}$/.test(compRuc) && !/^\d{11}$/.test(compRuc)) {
          e.comprador =
            'El documento del comprador debe tener 8 dígitos (DNI) u 11 dígitos (RUC).';
        }
      }

      // Validación de Descripción de Motivo en "Otros"
      if (isOther) {
        if (!form.descripcionMotivo?.trim()) {
          e.otros =
            'Para el motivo "Otros", la descripción del motivo es obligatoria.';
        }
      }

      // Validación de Vehículos y Conductores
      if (showVehicleDriver) {
        if (!form.vehiculos || form.vehiculos.length === 0) {
          e.privado = 'Debe registrar al menos un vehículo.';
        } else {
          for (let i = 0; i < form.vehiculos.length; i++) {
            const v = form.vehiculos[i];
            const placa = v.placa?.trim().toUpperCase() || '';
            const auth = v.numeroAutorizacion?.trim() || '';

            if (!placa) {
              e.privado = `Ingrese la placa del vehículo #${i + 1}.`;
              break;
            }
            if (!/^[A-Z0-9]{6,8}$/.test(placa)) {
              e.privado = `La placa "${placa}" del vehículo #${i + 1} debe tener entre 6 y 8 caracteres alfanuméricos sin caracteres especiales.`;
              break;
            }
            if (auth && auth.length > 20) {
              e.privado = `El número de TUC / autorización del vehículo #${i + 1} no puede exceder los 20 caracteres.`;
              break;
            }
          }
        }

        if (!e.privado) {
          if (!form.conductores || form.conductores.length === 0) {
            e.privado = 'Debe registrar al menos un conductor.';
          } else {
            for (let i = 0; i < form.conductores.length; i++) {
              const c = form.conductores[i];
              const doc = c.numeroDocumento?.trim() || '';
              const nom = c.nombre?.trim() || '';
              const lic =
                c.licenciaConducir?.trim().toUpperCase() || '';

              if (!doc) {
                e.privado = `Ingrese el número de documento del conductor #${i + 1}.`;
                break;
              }
              if (!nom) {
                e.privado = `Ingrese el nombre del conductor #${i + 1}.`;
                break;
              }
              if (!lic) {
                e.privado = `Ingrese la licencia de conducir del conductor #${i + 1}.`;
                break;
              }
              if (lic.length < 9 || lic.length > 10) {
                e.privado = `La licencia de conducir "${lic}" del conductor #${i + 1} debe tener entre 9 y 10 caracteres.`;
                break;
              }
            }
          }
        }
      }

      // Validación de Transportista
      if (showCarrier) {
        const transRuc = form.transportista?.ruc?.trim() || '';
        const transRazon =
          form.transportista?.razonSocial?.trim() || '';
        const transMtc =
          form.transportista?.registroMTC?.trim() || '';

        if (!transRuc || !transRazon || !transMtc) {
          e.transportista =
            'Complete los datos del transportista (RUC, Razón Social y Registro MTC).';
        } else if (!/^\d{11}$/.test(transRuc)) {
          e.transportista =
            'El RUC del transportista debe tener exactamente 11 dígitos.';
        }
      }

      // Validación de Bienes
      if (!form.bienes || form.bienes.length === 0) {
        e.bienes = 'Debe registrar al menos un bien para el traslado.';
      } else {
        for (let i = 0; i < form.bienes.length; i++) {
          const b = form.bienes[i];
          const cant = Number(b.cantidad);
          if (!b.descripcion?.trim()) {
            e.bienes = `El bien #${i + 1} debe tener una descripción.`;
            break;
          }
          if (isNaN(cant) || cant <= 0) {
            e.bienes = `La cantidad del bien #${i + 1} debe ser mayor a cero (permite enteros y decimales).`;
            break;
          }
        }
      }

      // Validación de Peso Bruto
      const peso = Number(form.pesoBrutoTotal);
      if (isNaN(peso) || peso <= 0) {
        e.peso = 'El peso bruto total debe ser mayor a cero.';
      }

      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const addLocationFields = (
      point: 'puntoPartida' | 'puntoLlegada',
      code: boolean,
    ) =>
      !code ? undefined : (
        <FormField
          label="Código de establecimiento"
          required
          error={errors.establecimiento}
        >
          <input
            className="erp-form-control"
            maxLength={4}
            placeholder="4 dígitos (ej. 0000)"
            value={form[point].codigoEstablecimiento ?? ''}
            onChange={(e) =>
              location(
                point,
                'codigoEstablecimiento',
                e.target.value.replace(/\D/g, '').slice(0, 4),
              )
            }
          />
        </FormField>
      );

    const error = (key: string) =>
      errors[key] && (
        <p className="erp-form-error" style={{ margin: '4px 0 8px' }}>
          {errors[key]}
        </p>
      );

    const executeSubmit = () => {
      if (validate()) {
        const finalForm: GuiaRemisionRemitenteFormData = {
          ...form,
          numero: form.numero || randomNumero(),
        };
        void onSubmit(finalForm);
        return true;
      }
      return false;
    };

    useImperativeHandle(ref, () => ({
      submit: executeSubmit,
    }));

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSubmit();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* DATOS DE LA GUÍA */}
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

            <FormField label="Emisor (RUC)">
              <input
                className="erp-form-control"
                value={`${EMPRESA.ruc} - ${EMPRESA.razonSocial}`}
                disabled
              />
            </FormField>
          </div>
        </section>

        {/* DESTINATARIO */}
        <section style={card}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ ...h, margin: 0 }}>DESTINATARIO</h4>
            {isSameStoreDestination && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--erp-primary, #2563eb)',
                  fontWeight: 500,
                }}
              >
                (Fijado con los datos de la empresa según el motivo de
                traslado)
              </span>
            )}
          </div>

          {error('dest')}

          <div style={grid}>
            <FormField label="Tipo de documento" required>
              <select
                className="erp-form-control"
                disabled={isSameStoreDestination}
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
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </FormField>

            <FormField label="Número de documento" required>
              <input
                className="erp-form-control"
                disabled={isSameStoreDestination}
                maxLength={
                  form.destinatario.tipoDocumento === 'DNI'
                    ? 8
                    : form.destinatario.tipoDocumento === 'RUC'
                      ? 11
                      : 15
                }
                value={form.destinatario.numeroDocumento}
                onChange={(e) =>
                  set({
                    destinatario: {
                      ...form.destinatario,
                      numeroDocumento:
                        form.destinatario.tipoDocumento === 'DNI' ||
                        form.destinatario.tipoDocumento === 'RUC'
                          ? e.target.value.replace(/\D/g, '')
                          : e.target.value,
                    },
                  })
                }
              />
            </FormField>

            <FormField label="Nombre / Razón social" required>
              <input
                className="erp-form-control"
                disabled={isSameStoreDestination}
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

        {/* FECHAS */}
        <section style={card}>
          <h4 style={h}>FECHAS</h4>

          {error('fechas')}

          <div style={grid}>
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

            <FormField
              label="Fecha de inicio del traslado"
              required
            >
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

        {/* MOTIVO DEL TRASLADO Y MODALIDAD */}
        <section style={card}>
          <h4 style={h}>MOTIVO DEL TRASLADO Y MODALIDAD</h4>

          <div style={grid}>
            <FormField label="Motivo de traslado" required>
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
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Modalidad de transporte" required>
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

          {isOther && (
            <div style={{ marginTop: '12px' }}>
              <FormField
                label="Descripción del motivo"
                required
                error={errors.otros}
              >
                <input
                  className="erp-form-control"
                  placeholder="Ingrese el motivo detallado del traslado"
                  value={form.descripcionMotivo ?? ''}
                  onChange={(e) =>
                    set({
                      descripcionMotivo: e.target.value,
                    })
                  }
                />
              </FormField>
            </div>
          )}
        </section>

        {/* OPCIONES DE TRANSPORTE */}
        <section style={card}>
          <h4 style={h}>OPCIONES DE TRANSPORTE</h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
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
              disabled={
                !!form.datosTransportista ||
                form.modalidadTransporte === 'TRANSPORTE_PRIVADO'
              }
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
              disabled={
                !!form.vehiculosCategoriaM1L ||
                form.modalidadTransporte === 'TRANSPORTE_PRIVADO'
              }
              onChange={() => toggle('datosTransportista')}
              label="Datos del Transportista (habilita vehículos y conductores)"
            />
          </div>
        </section>

        {/* VEHÍCULOS Y CONDUCTORES */}
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
                    entidadEmisora: '07',
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

        {/* DATOS DEL TRANSPORTISTA */}
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

        {/* DATOS DEL PROVEEDOR (Compras, Recojo de bienes, Otros) */}
        {provider && (
          <PersonCard
            title="DATOS DEL PROVEEDOR"
            person={form.proveedor}
            error={errors.proveedor}
            isBuyer={false}
            onChange={(field, value) =>
              person('proveedor', field, value)
            }
          />
        )}

        {/* DATOS DEL COMPRADOR (Venta a terceros, Otros) */}
        {buyer && (
          <PersonCard
            title="DATOS DEL COMPRADOR"
            person={form.comprador}
            error={errors.comprador}
            isBuyer={true}
            onChange={(field, value) =>
              person('comprador', field, value)
            }
          />
        )}

        {/* PUNTOS DE PARTIDA Y LLEGADA */}
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
            establishments,
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
            establishments,
          )}
        />

        {/* BIENES TRANSPORTADOS */}
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

        {/* PESO BRUTO TOTAL */}
        <section style={card}>
          <h4 style={h}>PESO BRUTO TOTAL</h4>

          {error('peso')}

          <div style={grid}>
            <FormField label="Valor" required>
              <input
                type="number"
                min="0.001"
                step="any"
                className="erp-form-control"
                value={form.pesoBrutoTotal || ''}
                onChange={(e) =>
                  set({
                    pesoBrutoTotal: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </FormField>

            <FormField label="Unidad de medida" required>
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

        {/* OBSERVACIONES */}
        <section style={card}>
          <h4 style={h}>OBSERVACIONES</h4>

          <FormField label="Observaciones">
            <textarea
              className="erp-form-control"
              rows={3}
              placeholder="Observaciones adicionales sobre el traslado..."
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
            {loading
              ? 'Guardando...'
              : 'Emitir Guía de Remisión Remitente'}
          </button>
        </div>
      </form>
    );
  },
);

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h4 style={{ ...h, margin: 0 }}>VEHÍCULOS</h4>
          <button
            type="button"
            className="erp-btn erp-btn-secondary erp-btn-sm"
            onClick={addVehicle}
          >
            + Agregar vehículo
          </button>
        </div>

        {error && (
          <p className="erp-form-error" style={{ marginBottom: '10px' }}>
            {error}
          </p>
        )}

        {form.vehiculos?.map((v, i) => (
          <div
            key={i}
            style={{
              ...grid,
              marginTop: '10px',
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
                value={v.placa ?? ''}
                onChange={(e) =>
                  updateVehicle(
                    i,
                    'placa',
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')
                      .slice(0, 8),
                  )
                }
              />
            </FormField>

            {form.modalidadTransporte === 'TRANSPORTE_PUBLICO' && (
              <>
                <FormField label="Tarjeta Única de Circulación (TUC) / Autorización">
                  <input
                    className="erp-form-control"
                    placeholder="Ej. 3452 / Nro. de TUC"
                    maxLength={20}
                    value={v.numeroAutorizacion ?? ''}
                    onChange={(e) =>
                      updateVehicle(
                        i,
                        'numeroAutorizacion',
                        e.target.value.slice(0, 20),
                      )
                    }
                  />
                </FormField>

                <FormField label="Entidad emisora">
                  <select
                    className="erp-form-control"
                    value={v.entidadEmisora ?? '07'}
                    onChange={(e) =>
                      updateVehicle(
                        i,
                        'entidadEmisora',
                        e.target.value,
                      )
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
              </>
            )}

            <div style={{ alignSelf: 'end' }}>
              <IconButton
                icon={<FiTrash2 />}
                tooltip="Eliminar vehículo"
                variant="danger"
                disabled={(form.vehiculos?.length ?? 0) <= 1}
                onClick={() => removeVehicle(i)}
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
          <h4 style={{ ...h, margin: 0 }}>CONDUCTORES</h4>
          <button
            type="button"
            className="erp-btn erp-btn-secondary erp-btn-sm"
            onClick={addDriver}
          >
            + Agregar conductor
          </button>
        </div>

        {form.conductores?.map((v, i) => (
          <div
            key={i}
            style={{
              ...grid,
              marginTop: '10px',
              padding: '12px',
              border: '1px solid var(--erp-border)',
              borderRadius: '6px',
              background: 'var(--erp-surface)',
            }}
          >
            <FormField label="Tipo de documento" required>
              <select
                className="erp-form-control"
                value={v.tipoDocumento || 'DNI'}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'tipoDocumento',
                    e.target.value,
                  )
                }
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </FormField>

            <FormField label="Número de documento" required>
              <input
                className="erp-form-control"
                maxLength={
                  v.tipoDocumento === 'DNI'
                    ? 8
                    : v.tipoDocumento === 'RUC'
                      ? 11
                      : 12
                }
                value={v.numeroDocumento}
                onChange={(e) =>
                  updateDriver(
                    i,
                    'numeroDocumento',
                    e.target.value.replace(/\D/g, ''),
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

            <FormField label="Apellidos">
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

            <FormField label="Licencia de conducir" required>
              <input
                className="erp-form-control"
                placeholder="9 a 10 caracteres (ej. Q12345678)"
                maxLength={10}
                value={v.licenciaConducir ?? ''}
                onChange={(e) =>
                  updateDriver(
                    i,
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
                disabled={(form.conductores?.length ?? 0) <= 1}
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
  onChange: (f: keyof DatosTransportista, v: string) => void;
}) {
  return (
    <section style={card}>
      <h4 style={h}>DATOS DEL TRANSPORTISTA</h4>

      {error && (
        <p className="erp-form-error" style={{ marginBottom: '10px' }}>
          {error}
        </p>
      )}

      <div style={grid}>
        <FormField label="RUC del transportista" required>
          <input
            className="erp-form-control"
            maxLength={11}
            placeholder="11 dígitos"
            value={form.transportista?.ruc ?? ''}
            onChange={(e) =>
              onChange(
                'ruc',
                e.target.value.replace(/\D/g, '').slice(0, 11),
              )
            }
          />
        </FormField>

        <FormField label="Nombre / Razón social" required>
          <input
            className="erp-form-control"
            value={form.transportista?.razonSocial ?? ''}
            onChange={(e) =>
              onChange('razonSocial', e.target.value)
            }
          />
        </FormField>

        <FormField label="Registro MTC" required>
          <input
            className="erp-form-control"
            placeholder="Ej. 00001"
            value={form.transportista?.registroMTC ?? ''}
            onChange={(e) =>
              onChange('registroMTC', e.target.value)
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
  isBuyer,
  onChange,
}: {
  title: string;
  person?: DatosPersonaGuia;
  error?: string;
  isBuyer?: boolean;
  onChange: (f: keyof DatosPersonaGuia, v: string) => void;
}) {
  return (
    <section style={card}>
      <h4 style={h}>{title}</h4>

      {error && (
        <p className="erp-form-error" style={{ marginBottom: '10px' }}>
          {error}
        </p>
      )}

      <div style={grid}>
        <FormField
          label={
            isBuyer
              ? 'Documento del comprador (RUC / DNI)'
              : 'RUC del proveedor'
          }
          required
        >
          <input
            className="erp-form-control"
            maxLength={11}
            placeholder={
              isBuyer
                ? 'RUC (11 dígitos) o DNI (8 dígitos)'
                : '20XXXXXXXXX (11 dígitos)'
            }
            value={person?.ruc ?? ''}
            onChange={(e) =>
              onChange(
                'ruc',
                e.target.value.replace(/\D/g, '').slice(0, 11),
              )
            }
          />
        </FormField>

        <FormField
          label={
            isBuyer
              ? 'Nombre / Razón social del comprador'
              : 'Razón social del proveedor'
          }
          required
        >
          <input
            className="erp-form-control"
            placeholder={
              isBuyer
                ? 'Nombres y Apellidos / Razón Social'
                : 'Razón Social de la empresa proveedora'
            }
            value={person?.nombre ?? ''}
            onChange={(e) =>
              onChange('nombre', e.target.value)
            }
          />
        </FormField>
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
        <h4 style={{ ...h, margin: 0 }}>BIENES TRANSPORTADOS</h4>

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
        <p className="erp-form-error" style={{ marginBottom: '10px' }}>
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
            border: '1px solid var(--erp-border)',
            borderRadius: '6px',
            background: 'var(--erp-surface)',
          }}
        >
          <FormField label="Descripción" required>
            <input
              className="erp-form-control"
              placeholder="Descripción del bien"
              value={v.descripcion}
              onChange={(e) =>
                update(i, 'descripcion', e.target.value)
              }
            />
          </FormField>

          <FormField label="Cantidad" required>
            <input
              type="number"
              min="0.001"
              step="any"
              className="erp-form-control"
              value={v.cantidad}
              onChange={(e) =>
                update(
                  i,
                  'cantidad',
                  parseFloat(e.target.value) || 0,
                )
              }
            />
          </FormField>

          <FormField label="Unidad de medida" required>
            <select
              className="erp-form-control"
              value={v.unidadMedida}
              onChange={(e) =>
                update(i, 'unidadMedida', e.target.value)
              }
            >
              <option value="UNIDAD">Unidad (NIU)</option>
              <option value="KGM">Kilogramo (KGM)</option>
              <option value="LTR">Litro (LTR)</option>
              <option value="MTR">Metro (MTR)</option>
              <option value="BX">Caja (BX)</option>
            </select>
          </FormField>

          <FormField label="Peso (KGM)">
            <input
              type="number"
              min="0"
              step="any"
              className="erp-form-control"
              value={v.pesoUnitario ?? ''}
              onChange={(e) =>
                update(
                  i,
                  'pesoUnitario',
                  parseFloat(e.target.value) || 0,
                )
              }
            />
          </FormField>

          <div style={{ alignSelf: 'end' }}>
            <IconButton
              icon={<FiTrash2 />}
              tooltip="Eliminar ítem"
              variant="danger"
              disabled={form.bienes.length <= 1}
              onClick={() =>
                onChange(form.bienes.filter((_, n) => n !== i))
              }
            />
          </div>
        </div>
      ))}
    </section>
  );
}

export default GuiaRemitenteForm;