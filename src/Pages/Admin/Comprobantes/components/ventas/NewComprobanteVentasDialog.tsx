import { useEffect, useMemo, useState } from 'react';
import { FiLock } from 'react-icons/fi';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import { totalEnLetras } from '../../../../../Utils/numberToWordsSoles';
import { ComprobanteVentasService } from '../../../../../Services/Admin/Comprobantes/ComprobanteVentasService';
import type {
  ComprobanteEmitibleTipo,
  ComprobanteFormData,
  VentaOrigenComprobanteDto,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface NewComprobanteDialogProps {
  isOpen: boolean;
  ventas: VentaOrigenComprobanteDto[];
  loading: boolean;
  onClose: () => void;
  onGenerate: (data: ComprobanteFormData) => Promise<boolean>;
}

type FormErrorKey =
  | 'clienteNombre'
  | 'clienteDocumento'
  | 'fechaVencimiento'
  | 'detalle'
  | 'clienteDireccion'
  | 'pago'
  | 'moneda'
  | 'persona';
type FormErrors = Partial<Record<FormErrorKey, string>>;

const today = () => new Date().toISOString().slice(0, 10);

const createInitialForm = (): ComprobanteFormData => ({
  tipo: 'BOLETA',
  origen: 'VENTA',
  ventaOrigenId: '',
  cliente: { tipoDocumento: 'DNI', documento: '', nombre: '', direccion: '', correo: '' },
  detalle: [],
  fechaEmision: today(),
  fechaVencimiento: '',
  moneda: 'PEN',
  pago: {
    formaPago: 'CONTADO',
    cuotas: [],
  },
  observaciones: '',
});


const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;
const DIRECCION_POR_DEFECTO = 'SIN DIRECCION';

const NewComprobanteDialog = ({ isOpen, ventas, loading, onClose, onGenerate }: NewComprobanteDialogProps) => {
  const [form, setForm] = useState<ComprobanteFormData>(createInitialForm);
  const [saleSearch, setSaleSearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [consultandoPersona, setConsultandoPersona] = useState(false);

  useEffect(() => {
    const fechaServidor = ventas.find(venta => venta.fechaEmisionServidor)?.fechaEmisionServidor;
    if (fechaServidor) setForm(previous => ({ ...previous, fechaEmision: fechaServidor }));
  }, [ventas]);

  const selectedSale = ventas.find(venta => venta.id === form.ventaOrigenId);
  const filteredSales = useMemo(() => {
    const query = saleSearch.trim().toLowerCase();
    let filtered = ventas;
    
    // Filtrar por tipo de comprobante correspondiente
    if (form.tipo === 'FACTURA') {
      // Factura muestra todas las ventas elegibles; el RUC del receptor se consulta aparte.
      filtered = ventas;
    } else if (form.tipo === 'BOLETA') {
      filtered = ventas;
    }

    if (!query) return filtered;
    return filtered.filter(venta => [venta.id, venta.codigo, venta.fecha, venta.cliente.nombre, String(venta.total)]
      .some(value => value.toLowerCase().includes(query)));
  }, [saleSearch, ventas, form.tipo]);

  const totals = useMemo(() => {
    const subtotal = Number(form.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
    const igv = Number(form.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2));
    const total = Number((subtotal + igv).toFixed(2));
    return { subtotal, igv, total };
  }, [form.detalle]);

  const selectSale = (saleId: string) => {
    const sale = ventas.find(venta => venta.id === saleId);
    if (!sale) return;
    
    const isRuc = sale.cliente.tipoDocumento.toUpperCase() === 'RUC' || sale.cliente.documento.length === 11;
    
    const newTipo = form.tipo;
    
    const clienteData = {
      tipoDocumento: newTipo === 'FACTURA' ? 'RUC' : (sale.cliente.tipoDocumento || (isRuc ? 'RUC' : 'DNI')),
      documento: newTipo === 'FACTURA' && !isRuc ? '' : (sale.cliente.documento || ''),
      nombre: sale.cliente.nombre || '',
      direccion: sale.cliente.direccion?.trim() || DIRECCION_POR_DEFECTO,
      correo: sale.cliente.correo || '',
    };
    
    setForm(previous => ({
      ...previous,
      tipo: newTipo,
      origen: 'VENTA',
      ventaOrigenId: sale.id,
      cliente: clienteData,
      detalle: sale.detalle.map(item => ({ ...item })),
    }));
    setErrors({});
    if (clienteData.documento) {
      void consultarPersona(clienteData.tipoDocumento as 'DNI' | 'RUC', clienteData.documento);
    }
  };

  const consultarPersona = async (tipoDocumento: 'DNI' | 'RUC', numero: string) => {
    const documento = numero.trim();
    const valido = tipoDocumento === 'DNI' ? /^\d{8}$/.test(documento) : /^\d{11}$/.test(documento);
    if (!valido) return;
    setConsultandoPersona(true);
    setErrors(previous => ({ ...previous, persona: undefined }));
    try {
      const persona = await ComprobanteVentasService.consultarPersona(tipoDocumento, documento);
      if (!persona.success || !persona.nombre) {
        throw new Error(persona.mensaje || 'No se encontraron datos del documento.');
      }
      setForm(previous => ({
        ...previous,
        cliente: {
          ...previous.cliente,
          tipoDocumento,
          documento: persona.numero || documento,
          nombre: persona.nombre || '',
          direccion: persona.direccion?.trim() || DIRECCION_POR_DEFECTO,
        },
      }));
    } catch (error) {
      setForm(previous => ({
        ...previous,
        cliente: { ...previous.cliente, nombre: '', direccion: DIRECCION_POR_DEFECTO },
      }));
      setErrors(previous => ({ ...previous, persona: error instanceof Error ? error.message : 'No se pudo consultar el documento.' }));
    } finally {
      setConsultandoPersona(false);
    }
  };

  const handleTipoChange = (newTipo: ComprobanteEmitibleTipo) => {
    setForm(prev => {
      let nextTipoDoc = prev.cliente.tipoDocumento;
      if (newTipo === 'FACTURA') {
        nextTipoDoc = 'RUC';
      } else if (prev.cliente.tipoDocumento === 'RUC' && newTipo === 'BOLETA') {
        nextTipoDoc = 'DNI';
      }
      
      // Al cambiar de tipo se debe volver a consultar el documento fiscal.
      let clienteData = { ...prev.cliente, tipoDocumento: nextTipoDoc };
      if (newTipo === 'FACTURA' || (newTipo === 'BOLETA' && prev.cliente.tipoDocumento === 'RUC')) {
        clienteData = {
          tipoDocumento: newTipo === 'FACTURA' ? 'RUC' : 'DNI',
          documento: '',
          nombre: '',
          direccion: '',
          correo: '',
        };
      }
      
      return {
        ...prev,
        tipo: newTipo,
        cliente: clienteData,
        fechaVencimiento: newTipo === 'FACTURA' ? prev.fechaVencimiento : '',
        moneda: prev.moneda,
        pago: newTipo === 'FACTURA'
          ? prev.pago
          : { formaPago: 'CONTADO', cuotas: [] },
        ventaOrigenId: '', // Limpiar venta seleccionada al cambiar tipo
        detalle: [], // Limpiar detalle al cambiar tipo
      };
    });
    setErrors({});
  };





  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const boletaRequiereDatosReceptor = form.tipo === 'BOLETA' && totals.total > 700;

    if (form.tipo === 'FACTURA') {
      if (!form.cliente.nombre.trim()) {
        nextErrors.clienteNombre = 'La razón social es obligatoria para una factura';
      }
      if (!form.cliente.documento.trim()) {
        nextErrors.clienteDocumento = 'El RUC del cliente es obligatorio para una factura';
      } else if (!/^\d{11}$/.test(form.cliente.documento.trim())) {
        nextErrors.clienteDocumento = 'El RUC debe tener 11 dígitos numéricos';
      }
      if (form.cliente.tipoDocumento !== 'RUC') {
        nextErrors.clienteDocumento = 'La factura solo permite RUC';
      }
    } else if (form.tipo === 'BOLETA') {
      if (boletaRequiereDatosReceptor) {
        if (form.cliente.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.cliente.documento.trim())) {
          nextErrors.clienteDocumento = 'El DNI debe tener 8 dígitos numéricos';
        } else if (form.cliente.tipoDocumento === 'RUC' && !/^\d{11}$/.test(form.cliente.documento.trim())) {
          nextErrors.clienteDocumento = 'El RUC debe tener 11 dígitos numéricos';
        }
        if (!form.cliente.nombre.trim()) nextErrors.clienteNombre = 'Consulta el DNI/RUC para obtener el nombre';
        if (!form.cliente.direccion.trim()) nextErrors.clienteDireccion = 'Consulta el DNI/RUC para obtener la dirección';
      }
    }

    if (form.moneda !== 'PEN' && form.moneda !== 'USD') {
      nextErrors.moneda = 'La moneda permitida es PEN o USD';
    }

    if (form.pago.formaPago !== 'CONTADO' || form.pago.cuotas.length > 0) nextErrors.pago = 'El comprobante solo permite pago CONTADO';

    if (form.detalle.length === 0) {
      nextErrors.detalle = 'Agrega al menos un ítem al comprobante';
    } else if (form.detalle.some(item => !item.productoServicio?.trim() || isNaN(item.cantidad) || item.cantidad <= 0 || isNaN(item.precio) || item.precio < 0)) {
      nextErrors.detalle = 'Todos los ítems deben tener producto/servicio, cantidad mayor a 0 y precio válido';
    } else if (totals.total <= 0) {
      nextErrors.detalle = 'El total del comprobante debe ser mayor a 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    const generated = await onGenerate({ ...form, detalle: form.detalle.map(item => ({ ...item })) });
    if (generated) onClose();
  };

  const typeLabel = form.tipo === 'BOLETA'
    ? 'Boleta'
    : 'Factura';

  return (
    <CrudDialog
      isOpen={isOpen}
      mode="create"
      onClose={onClose}
      onConfirm={() => void handleGenerate()}
      title="Nuevo Comprobante"
      subtitle="Emisión de comprobante electrónico"
      confirmLabel={`Generar ${typeLabel}`}
      loading={loading}
      size="xl"
    >
      <div style={{ display: 'grid', gap: '20px' }}>
        <section className="erp-form-grid">
          <FormField label="Tipo de comprobante" required>
            <select
              className="erp-input"
              value={form.tipo}
              onChange={event => handleTipoChange(event.target.value as ComprobanteEmitibleTipo)}
            >
              <option value="BOLETA">Boleta de Venta</option>
              <option value="FACTURA">Factura</option>
            </select>
          </FormField>
          <FormField label="Fecha de emisión">
            <input type="date" className="erp-input" value={form.fechaEmision} readOnly disabled />
          </FormField>
          <FormField label="Moneda" error={errors.moneda}>
            <select
              className="erp-input"
              value={form.moneda}
              onChange={event => setForm(previous => ({ ...previous, moneda: event.target.value as 'PEN' | 'USD' }))}
            >
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </FormField>
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Venta de origen</h3>
          <SearchInput value={saleSearch} onChange={setSaleSearch} placeholder="Buscar por ID, fecha, cliente, total o código..." />
          <select className="erp-input" style={{ marginTop: '8px' }} value={form.ventaOrigenId} onChange={event => selectSale(event.target.value)}>
            <option value="">Seleccionar una venta</option>
            {filteredSales.map(sale => <option key={sale.id} value={sale.id}>{sale.id} · {sale.fecha} · {sale.cliente.nombre} · {formatAmount(sale.total)}</option>)}
          </select>
          {selectedSale && (
            <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '6px', background: 'var(--erp-accent-light)', fontSize: '13px' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>VENTA SELECCIONADA</strong>
              {selectedSale.id} ({selectedSale.codigo}) · {selectedSale.fecha} · {selectedSale.cliente.nombre} · {formatAmount(selectedSale.total)}
            </div>
          )}
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>
            {form.tipo === 'FACTURA' ? 'Datos del Cliente (Receptor)' : 'Datos del Cliente'}
          </h3>
          <p style={{ margin: '0 0 10px', color: 'var(--erp-text-muted)', fontSize: '12px' }}>
            Ingresa DNI o RUC. Nombre y dirección se obtienen de ApiPeru y no se pueden editar.
          </p>
          <div className="erp-form-grid">
            <FormField label="Tipo de documento">
              <select
                className="erp-input"
                value={form.cliente.tipoDocumento}
                onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, tipoDocumento: event.target.value } }))}
              >
                {form.tipo === 'FACTURA' ? <option value="RUC">RUC</option> : <><option value="DNI">DNI</option><option value="RUC">RUC</option></>}
              </select>
            </FormField>
            <FormField
              label="Número de documento"
              required={form.tipo === 'FACTURA' || (form.tipo === 'BOLETA' && totals.total > 700)}
              error={errors.clienteDocumento}
            >
              <input
                className="erp-input"
                maxLength={form.cliente.tipoDocumento === 'RUC' ? 11 : form.cliente.tipoDocumento === 'DNI' ? 8 : 15}
                value={form.cliente.documento}
                onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, documento: event.target.value, nombre: '', direccion: '' } }))}
                onBlur={event => void consultarPersona(form.cliente.tipoDocumento as 'DNI' | 'RUC', event.target.value)}
              />
              <button type="button" className="erp-btn erp-btn-secondary" disabled={consultandoPersona} onClick={() => void consultarPersona(form.cliente.tipoDocumento as 'DNI' | 'RUC', form.cliente.documento)}>
                {consultandoPersona ? 'Consultando...' : 'Consultar documento'}
              </button>
            </FormField>
            <FormField
              label={form.tipo === 'FACTURA' ? 'Nombre / Razón social' : 'Nombre del cliente'}
              required={form.tipo === 'FACTURA' || (form.tipo === 'BOLETA' && totals.total > 700)}
              error={errors.clienteNombre}
            >
              <input className="erp-input" value={form.cliente.nombre} readOnly disabled />
            </FormField>
            <FormField
              label="Dirección"
              required={form.tipo === 'FACTURA' || (form.tipo === 'BOLETA' && totals.total > 700)}
              error={errors.clienteDireccion}
            >
              <input className="erp-input" value={form.cliente.direccion} readOnly disabled />
            </FormField>
          </div>
          {errors.persona && <div className="erp-form-error">{errors.persona}</div>}
        </section>

        <p style={{ margin: 0, color: 'var(--erp-text-muted)', fontSize: '12px' }}>Forma de pago: CONTADO · efectivo</p>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Detalle de la venta</h3>
          {form.detalle.length > 0 && <p style={{ margin: '0 0 10px', color: 'var(--erp-text-muted)', fontSize: '12px', display: 'flex', gap: '5px', alignItems: 'center' }}><FiLock /> Los productos y montos corresponden a la venta seleccionada y no pueden modificarse.</p>}
          {errors.detalle && <div className="erp-form-error" style={{ marginTop: '8px' }}>{errors.detalle}</div>}
          <div className="erp-table-wrapper" style={{ marginTop: '10px' }}>
            <table className="erp-table">
              <thead>
                  <tr><th>Código</th>
                  <th>Producto / Servicio</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>IGV</th>
                  <th>Importe</th></tr>
                </thead>
              <tbody>
                {form.detalle.length === 0 ? <tr><td colSpan={6} className="text-muted">Selecciona una venta para ver el detalle.</td></tr> : form.detalle.map((item, index) => (
                  <tr key={`${item.codigo}-${index}`}>
                    <td>{item.codigo}</td>
                    <td>{item.productoServicio}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatAmount(item.precio)}</td>
                    <td>{formatAmount(item.igv)}</td><td><strong>{formatAmount(item.importe)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="erp-form-grid">
          <FormField label={form.tipo === 'FACTURA' ? 'Observaciones / Notas' : 'Observaciones'} colSpan={2}>
            <textarea className="erp-input" rows={3} value={form.observaciones} onChange={event => setForm(previous => ({ ...previous, observaciones: event.target.value }))} />
          </FormField>
        </section>

        <section style={{ marginLeft: 'auto', minWidth: '260px', display: 'grid', gap: '6px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span>Subtotal</span><strong>{formatAmount(totals.subtotal)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span>IGV</span><strong>{formatAmount(totals.igv)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', fontSize: '16px' }}><strong>TOTAL</strong><strong>{formatAmount(totals.total)}</strong></div>
        </section>

        {totals.total > 0 && (
          <section>
            <FormField label="Importe en letras">
              <div style={{
                padding: '10px',
                background: 'var(--erp-surface)',
                border: '1px solid var(--erp-border)',
                borderRadius: '4px',
                fontSize: '13px',
                fontStyle: 'italic',
              }}>
                {totalEnLetras(totals.total)}
              </div>
            </FormField>
          </section>
        )}

        <section style={{ padding: '12px', background: 'var(--erp-bg-light)', borderRadius: '6px', fontSize: '13px' }}>
          <strong style={{ display: 'block', marginBottom: '6px' }}>RESUMEN DEL COMPROBANTE</strong>
          <div>Tipo: {typeLabel} · Venta de origen: {selectedSale ? `Venta #${selectedSale.id}` : 'No seleccionada'} · Cliente: {form.cliente.nombre || 'No especificado'}</div>
          <div>Documento: {form.cliente.tipoDocumento} {form.cliente.documento || 'No especificado'} · Moneda: {form.moneda} · Detalle: {form.detalle.length} producto(s) · Fecha de emisión: {form.fechaEmision}</div>
          <div>Subtotal: {formatAmount(totals.subtotal)} · IGV: {formatAmount(totals.igv)} · Total: {formatAmount(totals.total)}</div>
          <div>Forma de pago: CONTADO · efectivo</div>
          {form.observaciones && <div>Observaciones: {form.observaciones}</div>}
        </section>
      </div>
    </CrudDialog>
  );
};

export default NewComprobanteDialog;
