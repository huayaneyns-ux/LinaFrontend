import { useMemo, useState } from 'react';
import { FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import IconButton from '../../../../../Components/ERP/IconButton';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import type {
  NotaComprobanteBaseDto,
  NotaFormData,
  NotaFormItem,
  TipoNota,
  TipoNotaCredito,
  TipoNotaDebito,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { motivosNotaCredito, motivosNotaDebito } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { totalEnLetras } from '../../../../../Utils/numberToWordsSoles';
import { getMotivoConfig } from './motivosConfig';
import NotaTypeSelector from './NotaTypeSelector';

interface NewNotaDialogProps {
  isOpen: boolean;
  comprobantesBase: NotaComprobanteBaseDto[];
  loading: boolean;
  onClose: () => void;
  onGenerate: (data: NotaFormData) => Promise<boolean | null>;
}

type FormErrorKey =
  | 'motivo'
  | 'motivoDescripcion'
  | 'comprobanteRelacionado'
  | 'clienteDocumento'
  | 'clienteNombre'
  | 'detalle'
  | 'importe'
  | 'cantidad';

type FormErrors = Partial<Record<FormErrorKey, string>>;

const today = () => new Date().toISOString().slice(0, 10);

const createEmptyItem = (): NotaFormItem => ({
  productoId: null,
  codigo: '',
  productoServicio: '',
  cantidad: 1,
  precio: 0,
  igv: 0,
  importe: 0,
});

const createInitialForm = (): NotaFormData => ({
  tipo: 'NOTA_CREDITO',
  motivo: 'Anulación de la operación',
  motivoDescripcion: '',
  comprobanteRelacionado: {
    id: '',
    tipo: 'BOLETA',
    serie: '',
    numero: '',
  },
  cliente: {
    tipoDocumento: '',
    documento: '',
    nombre: '',
    direccion: '',
    correo: '',
  },
  detalle: [],
  fechaEmision: today(),
  observaciones: '',
});

const calculateItem = (item: NotaFormItem): NotaFormItem => {
  const cantidad = Math.max(1, item.cantidad || 1);
  const precio = Math.max(0, item.precio || 0);
  const subtotal = cantidad * precio;
  const igv = Number((subtotal * 0.18).toFixed(2));
  return { ...item, cantidad, precio, igv, importe: Number((subtotal + igv).toFixed(2)) };
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

const NewNotaDialog = ({ isOpen, comprobantesBase, loading, onClose, onGenerate }: NewNotaDialogProps) => {
  const [form, setForm] = useState<NotaFormData>(createInitialForm);
  const [comprobanteSearch, setComprobanteSearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const filteredComprobantes = useMemo(() => {
    const query = comprobanteSearch.trim().toLowerCase();
    if (!query) return comprobantesBase;
    return comprobantesBase.filter((comp) =>
      [comp.serie, comp.numero, comp.clienteNombre, comp.clienteDocumento, String(comp.total)]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [comprobanteSearch, comprobantesBase]);

  const selectedComprobante = useMemo(
    () => comprobantesBase.find((comp) => comp.id === form.comprobanteRelacionado.id) || null,
    [comprobantesBase, form.comprobanteRelacionado.id],
  );

  const motivoConfig = useMemo(
    () => getMotivoConfig(form.tipo, form.motivo),
    [form.tipo, form.motivo],
  );

  const totals = useMemo(() => ({
    subtotal: Number(form.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2)),
    igv: Number(form.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2)),
    total: Number(form.detalle.reduce((sum, item) => sum + item.importe, 0).toFixed(2)),
  }), [form.detalle]);

  const selectComprobante = (comprobanteId: string) => {
    const comprobante = comprobantesBase.find((comp) => comp.id === comprobanteId);
    if (!comprobante) return;

    setForm((previous) => ({
      ...previous,
      comprobanteRelacionado: {
        id: comprobante.id,
        tipo: comprobante.tipo,
        serie: comprobante.serie,
        numero: comprobante.numero,
      },
      cliente: {
        tipoDocumento: comprobante.clienteTipoDocumento || '',
        documento: comprobante.clienteDocumento || '',
        nombre: comprobante.clienteNombre || '',
        direccion: comprobante.clienteDireccion || '',
        correo: '',
      },
      detalle: [],
    }));
    setErrors({});
  };

  const handleTypeChange = (tipo: TipoNota) => {
    const nuevoMotivo = tipo === 'NOTA_CREDITO' ? motivosNotaCredito[0] : motivosNotaDebito[0];
    setForm((previous) => ({
      ...previous,
      tipo,
      motivo: nuevoMotivo as TipoNotaCredito | TipoNotaDebito,
      detalle: [],
    }));
    setErrors({});
  };

  const updateItem = (index: number, change: Partial<NotaFormItem>) => {
    setForm((previous) => ({
      ...previous,
      detalle: previous.detalle.map((item, itemIndex) =>
        itemIndex === index ? calculateItem({ ...item, ...change }) : item,
      ),
    }));
  };

  const selectProduct = (index: number, productKey: string) => {
    const product = selectedComprobante?.items.find((item) => item.id === productKey);
    if (!product) return;

    updateItem(index, {
      productoId: product.productoId,
      codigo: product.codigo,
      productoServicio: product.descripcion,
      precio: product.precioUnitario,
    });
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      detalle: [...previous.detalle, createEmptyItem()],
    }));
  };

  const removeItem = (index: number) => {
    setForm((previous) => ({
      ...previous,
      detalle: previous.detalle.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.motivo) nextErrors.motivo = 'Debe seleccionar el motivo de la nota';
    if (!form.motivoDescripcion?.trim()) nextErrors.motivoDescripcion = 'La descripción del motivo es obligatoria';
    if (!selectedComprobante) nextErrors.comprobanteRelacionado = 'Debe seleccionar el comprobante que modifica';

    const docCliente = form.cliente.documento?.trim() || '';
    if (!docCliente) {
      nextErrors.clienteDocumento = 'El documento del cliente es obligatorio para notas';
    }
    if (!form.cliente.nombre?.trim()) {
      nextErrors.clienteNombre = 'El nombre del cliente es obligatorio para notas';
    }

    if (motivoConfig.trabajaConItems && motivoConfig.itemsObligatorios && form.detalle.length === 0) {
      nextErrors.detalle = `Para el motivo "${form.motivo}" es necesario agregar al menos un ítem`;
    }

    if (selectedComprobante && motivoConfig.trabajaConItems) {
      form.detalle.forEach((item) => {
        const baseItem = selectedComprobante.items.find((source) => source.descripcion === item.productoServicio);
        if (baseItem && item.cantidad > baseItem.cantidad) {
          nextErrors.cantidad = `El ítem "${item.productoServicio}" excede la cantidad disponible (${baseItem.cantidad})`;
        }
        if (form.tipo === 'NOTA_CREDITO' && baseItem && item.importe > baseItem.importe) {
          nextErrors.importe = `El ítem "${item.productoServicio}" excede el importe disponible (S/ ${baseItem.importe.toFixed(2)})`;
        }
      });

      if (form.tipo === 'NOTA_CREDITO' && totals.total > selectedComprobante.total) {
        nextErrors.importe = `El importe de la nota no puede exceder S/ ${selectedComprobante.total.toFixed(2)}`;
      }
    }

    if (motivoConfig.trabajaConItems && totals.total <= 0 && form.detalle.length > 0) {
      nextErrors.importe = 'El importe total debe ser mayor a cero';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    const generated = await onGenerate({
      ...form,
      detalle: form.detalle.map((item) => ({ ...item })),
    });
    if (generated) {
      setForm(createInitialForm());
      setComprobanteSearch('');
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setForm(createInitialForm());
    setComprobanteSearch('');
    setErrors({});
    onClose();
  };

  const motives = form.tipo === 'NOTA_CREDITO' ? motivosNotaCredito : motivosNotaDebito;

  return (
    <CrudDialog
      isOpen={isOpen}
      mode="create"
      onClose={handleClose}
      onConfirm={() => void handleGenerate()}
      title={form.tipo === 'NOTA_CREDITO' ? 'Nueva Nota de Crédito' : 'Nueva Nota de Débito'}
      subtitle="Documento tributario que modifica un comprobante existente"
      confirmLabel={form.tipo === 'NOTA_CREDITO' ? 'Emitir Nota de Crédito' : 'Emitir Nota de Débito'}
      loading={loading}
      size="xl"
    >
      <div style={{ display: 'grid', gap: '20px' }}>
        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Tipo de nota</h3>
          <NotaTypeSelector selectedType={form.tipo} onTypeChange={handleTypeChange} />
        </section>

        <section className="erp-form-grid">
          <FormField label="Motivo de la nota" required error={errors.motivo}>
            <select className="erp-input" value={form.motivo} onChange={(event) => setForm((previous) => ({
              ...previous,
              motivo: event.target.value as TipoNotaCredito | TipoNotaDebito,
              detalle: [],
            }))}>
              {motives.map((motivo) => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Descripción del motivo" required error={errors.motivoDescripcion}>
            <input
              type="text"
              className="erp-input"
              value={form.motivoDescripcion || ''}
              onChange={(event) => setForm((previous) => ({ ...previous, motivoDescripcion: event.target.value }))}
            />
          </FormField>
          <FormField label="Fecha de emisión">
            <input
              type="date"
              className="erp-input"
              value={form.fechaEmision}
              onChange={(event) => setForm((previous) => ({ ...previous, fechaEmision: event.target.value }))}
            />
          </FormField>
        </section>

        {motivoConfig.descripcion && (
          <section style={{ padding: '12px', borderRadius: '6px', background: 'var(--erp-info-light)', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <FiInfo style={{ marginTop: '2px', color: 'var(--erp-info)' }} />
            <span>{motivoConfig.descripcion}</span>
          </section>
        )}

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Documento que modifica</h3>
          <SearchInput value={comprobanteSearch} onChange={setComprobanteSearch} placeholder="Buscar por serie, número, cliente o documento..." />
          <select
            className="erp-input"
            style={{ marginTop: '8px' }}
            value={form.comprobanteRelacionado.id || ''}
            onChange={(event) => selectComprobante(event.target.value)}
          >
            <option value="">Seleccionar comprobante</option>
            {filteredComprobantes.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.tipo} - {comp.serie}-{comp.numero} · {comp.clienteNombre} · {formatAmount(comp.total)}
              </option>
            ))}
          </select>
          {errors.comprobanteRelacionado && <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--erp-danger)' }}>{errors.comprobanteRelacionado}</div>}
        </section>

        {selectedComprobante && (
          <section style={{ padding: '16px', borderRadius: '6px', background: 'var(--erp-surface)', border: '1px solid var(--erp-border)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--erp-text-secondary)' }}>
              Información del comprobante original
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
              <div><strong>Tipo:</strong> {selectedComprobante.tipo}</div>
              <div><strong>Serie-Número:</strong> {selectedComprobante.serie}-{selectedComprobante.numero}</div>
              <div><strong>Fecha:</strong> {selectedComprobante.fechaEmision}</div>
              <div><strong>Cliente:</strong> {selectedComprobante.clienteNombre}</div>
              <div><strong>Documento:</strong> {selectedComprobante.clienteDocumento || '-'}</div>
              <div><strong>Total:</strong> {formatAmount(selectedComprobante.total)}</div>
            </div>
          </section>
        )}

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Datos del cliente</h3>
          <div className="erp-form-grid">
            <FormField label="Tipo de documento">
              <input className="erp-input" value={form.cliente.tipoDocumento || ''} readOnly />
            </FormField>
            <FormField label="Número de documento" required error={errors.clienteDocumento}>
              <input className="erp-input" value={form.cliente.documento || ''} readOnly />
            </FormField>
            <FormField label="Nombre / Razón social" required error={errors.clienteNombre}>
              <input className="erp-input" value={form.cliente.nombre || ''} readOnly />
            </FormField>
            <FormField label="Dirección">
              <input className="erp-input" value={form.cliente.direccion || ''} readOnly />
            </FormField>
          </div>
        </section>

        {motivoConfig.trabajaConItems && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '14px' }}>Ítems de la nota</h3>
              <IconButton icon={<FiPlus />} onClick={addItem} tooltip="Agregar ítem" />
            </div>
            {errors.detalle && <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--erp-danger)' }}>{errors.detalle}</div>}
            {errors.cantidad && <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--erp-danger)' }}>{errors.cantidad}</div>}
            {form.detalle.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.3fr 90px 110px 120px 40px',
                  gap: '8px',
                  alignItems: 'start',
                  padding: '10px',
                  background: 'var(--erp-surface)',
                  borderRadius: '6px',
                  border: '1px solid var(--erp-border)',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>Producto base</label>
                  <select className="erp-input" value={selectedComprobante?.items.find((baseItem) => baseItem.descripcion === item.productoServicio)?.id || ''} onChange={(event) => selectProduct(index, event.target.value)}>
                    <option value="">Seleccionar ítem</option>
                    {(selectedComprobante?.items ?? []).map((prod) => (
                      <option key={prod.id} value={prod.id}>{prod.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>Descripción</label>
                  <input className="erp-input" value={item.productoServicio} onChange={(event) => updateItem(index, { productoServicio: event.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>Cantidad</label>
                  <input type="number" min="1" step="1" className="erp-input" value={item.cantidad} onChange={(event) => updateItem(index, { cantidad: Number(event.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>Precio</label>
                  <input type="number" min="0" step="0.01" className="erp-input" value={item.precio} onChange={(event) => updateItem(index, { precio: Number(event.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>Importe</label>
                  <div style={{ padding: '8px', background: 'var(--erp-surface)', borderRadius: '4px', fontSize: '13px' }}>{formatAmount(item.importe)}</div>
                </div>
                <div style={{ paddingTop: '24px' }}>
                  <IconButton icon={<FiTrash2 />} onClick={() => removeItem(index)} tooltip="Eliminar" variant="danger" />
                </div>
              </div>
            ))}
          </section>
        )}

        {!motivoConfig.trabajaConItems && (
          <section style={{ padding: '12px', borderRadius: '6px', background: 'var(--erp-success-light)', fontSize: '13px' }}>
            Para este motivo no es necesario agregar ítems.
          </section>
        )}

        {motivoConfig.trabajaConItems && form.detalle.length > 0 && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', background: 'var(--erp-surface)', borderRadius: '6px', border: '1px solid var(--erp-border)' }}>
            <div><label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', display: 'block' }}>Subtotal</label><div style={{ fontSize: '16px', fontWeight: 600 }}>{formatAmount(totals.subtotal)}</div></div>
            <div><label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', display: 'block' }}>IGV</label><div style={{ fontSize: '16px', fontWeight: 600 }}>{formatAmount(totals.igv)}</div></div>
            <div><label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', display: 'block' }}>Total</label><div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--erp-primary)' }}>{formatAmount(totals.total)}</div></div>
          </section>
        )}

        <section>
          <FormField label="Observaciones">
            <textarea
              className="erp-input"
              rows={3}
              value={form.observaciones || ''}
              onChange={(event) => setForm((previous) => ({ ...previous, observaciones: event.target.value }))}
            />
          </FormField>
        </section>

        {(motivoConfig.trabajaConItems ? totals.total > 0 : selectedComprobante) && (
          <section style={{ padding: '12px', borderRadius: '6px', background: 'var(--erp-surface)' }}>
            <strong>Total en letras:</strong>{' '}
            {totalEnLetras(motivoConfig.trabajaConItems ? totals.total : selectedComprobante?.total || 0)}
          </section>
        )}

        {errors.importe && <div style={{ fontSize: '12px', color: 'var(--erp-danger)' }}>{errors.importe}</div>}
      </div>
    </CrudDialog>
  );
};

export default NewNotaDialog;
