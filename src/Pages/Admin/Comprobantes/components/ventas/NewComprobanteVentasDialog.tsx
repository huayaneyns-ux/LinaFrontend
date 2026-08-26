import { useMemo, useState } from 'react';
import { FiLock, FiPlus, FiTrash2 } from 'react-icons/fi';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import IconButton from '../../../../../Components/ERP/IconButton';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import { totalEnLetras } from '../../../../../Utils/numberToWordsSoles';
import type {
  ComprobanteEmitibleTipo,
  ComprobanteFormData,
  ComprobanteFormItem,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface NewComprobanteDialogProps {
  isOpen: boolean;
  ventas: VentaOrigenComprobanteDto[];
  productos: ProductoComprobanteMockDto[];
  loading: boolean;
  onClose: () => void;
  onGenerate: (data: ComprobanteFormData) => Promise<boolean>;
}

type FormErrorKey = 'clienteNombre' | 'clienteDocumento' | 'fechaVencimiento' | 'detalle';
type FormErrors = Partial<Record<FormErrorKey, string>>;

const today = () => new Date().toISOString().slice(0, 10);

const createEmptyItem = (): ComprobanteFormItem => ({
  productoId: null,
  codigo: '',
  productoServicio: '',
  cantidad: 1,
  precio: 0,
  igv: 0,
  importe: 0,
});

const createInitialForm = (): ComprobanteFormData => ({
  tipo: 'BOLETA',
  origen: 'VENTA',
  ventaOrigenId: '',
  cliente: { tipoDocumento: 'DNI', documento: '', nombre: '', direccion: '', correo: '' },
  detalle: [],
  fechaEmision: today(),
  fechaVencimiento: '',
  observaciones: '',
});

const calculateItem = (item: ComprobanteFormItem): ComprobanteFormItem => {
  const cantidad = isNaN(item.cantidad) || item.cantidad <= 0 ? 1 : item.cantidad;
  const precio = isNaN(item.precio) || item.precio < 0 ? 0 : item.precio;
  const subtotal = Number((cantidad * precio).toFixed(2));
  const igv = Number((subtotal * 0.18).toFixed(2));
  const importe = Number((subtotal + igv).toFixed(2));
  return { ...item, cantidad, precio, igv, importe };
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

const NewComprobanteDialog = ({ isOpen, ventas, productos, loading, onClose, onGenerate }: NewComprobanteDialogProps) => {
  const [form, setForm] = useState<ComprobanteFormData>(createInitialForm);
  const [saleSearch, setSaleSearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedSale = ventas.find(venta => venta.id === form.ventaOrigenId);
  const filteredSales = useMemo(() => {
    const query = saleSearch.trim().toLowerCase();
    if (!query) return ventas;
    return ventas.filter(venta => [venta.id, venta.codigo, venta.fecha, venta.cliente.nombre, String(venta.total)]
      .some(value => value.toLowerCase().includes(query)));
  }, [saleSearch, ventas]);

  const totals = useMemo(() => {
    const subtotal = Number(form.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
    const igv = Number(form.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2));
    const total = Number((subtotal + igv).toFixed(2));
    return { subtotal, igv, total };
  }, [form.detalle]);

  const selectSale = (saleId: string) => {
    const sale = ventas.find(venta => venta.id === saleId);
    if (!sale) return;
    setForm(previous => ({
      ...previous,
      origen: 'VENTA',
      ventaOrigenId: sale.id,
      cliente: { ...sale.cliente },
      detalle: sale.detalle.map(item => ({ ...item })),
    }));
    setErrors({});
  };

  const handleTipoChange = (newTipo: ComprobanteEmitibleTipo) => {
    setForm(prev => {
      let nextTipoDoc = prev.cliente.tipoDocumento;
      if (newTipo === 'FACTURA') {
        nextTipoDoc = 'RUC';
      } else if (prev.cliente.tipoDocumento === 'RUC') {
        nextTipoDoc = 'DNI';
      }
      return {
        ...prev,
        tipo: newTipo,
        cliente: {
          ...prev.cliente,
          tipoDocumento: nextTipoDoc,
        },
        fechaVencimiento: newTipo === 'FACTURA' ? prev.fechaVencimiento : '',
      };
    });
    setErrors({});
  };

  const changeOrigin = (origen: ComprobanteFormData['origen']) => {
    setForm(previous => origen === 'VENTA'
      ? { ...previous, origen, ventaOrigenId: '', detalle: [] }
      : { ...previous, origen, ventaOrigenId: '', detalle: previous.detalle.length ? previous.detalle : [createEmptyItem()] });
    setErrors({});
  };

  const updateManualItem = (index: number, change: Partial<ComprobanteFormItem>) => {
    setForm(previous => ({
      ...previous,
      detalle: previous.detalle.map((item, itemIndex) => itemIndex === index ? calculateItem({ ...item, ...change }) : item),
    }));
  };

  const selectProduct = (index: number, productId: number) => {
    const product = productos.find(item => item.id === productId);
    if (!product) return;
    updateManualItem(index, {
      productoId: product.id,
      codigo: product.codigo,
      productoServicio: product.nombre,
      precio: product.precio,
    });
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (form.tipo === 'FACTURA') {
      if (!form.cliente.nombre.trim()) {
        nextErrors.clienteNombre = 'La razón social es obligatoria para una factura';
      }
      if (!form.cliente.documento.trim()) {
        nextErrors.clienteDocumento = 'El RUC del cliente es obligatorio para una factura';
      } else if (!/^\d{11}$/.test(form.cliente.documento.trim())) {
        nextErrors.clienteDocumento = 'El RUC debe tener 11 dígitos numéricos';
      }
    } else if (form.tipo === 'LIQUIDACION_COMPRA') {
      if (!form.cliente.nombre.trim()) {
        nextErrors.clienteNombre = 'El nombre del vendedor / proveedor es obligatorio';
      }
      if (!form.cliente.documento.trim()) {
        nextErrors.clienteDocumento = 'El documento del vendedor es obligatorio';
      } else if (form.cliente.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.cliente.documento.trim())) {
        nextErrors.clienteDocumento = 'El DNI debe tener 8 dígitos numéricos';
      }
    } else if (form.tipo === 'BOLETA') {
      if (form.cliente.documento.trim() && form.cliente.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.cliente.documento.trim())) {
        nextErrors.clienteDocumento = 'El DNI debe tener 8 dígitos numéricos';
      }
      if (totals.total >= 700) {
        if (!form.cliente.nombre.trim()) {
          nextErrors.clienteNombre = 'Para boletas de S/ 700 a más, el nombre es obligatorio';
        }
        if (!form.cliente.documento.trim()) {
          nextErrors.clienteDocumento = 'Para boletas de S/ 700 a más, el documento es obligatorio';
        }
      }
    }

    if (form.tipo === 'FACTURA' && form.fechaVencimiento && form.fechaVencimiento < form.fechaEmision) {
      nextErrors.fechaVencimiento = 'La fecha de vencimiento no puede ser anterior a la emisión';
    }

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
    : form.tipo === 'FACTURA'
      ? 'Factura'
      : 'Liquidación de Compra';

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
              <option value="LIQUIDACION_COMPRA">Liquidación de Compra</option>
            </select>
          </FormField>
          <FormField label="Fecha de emisión">
            <input type="date" className="erp-input" value={form.fechaEmision} onChange={event => setForm(previous => ({ ...previous, fechaEmision: event.target.value }))} />
          </FormField>
          {form.tipo === 'FACTURA' && (
            <FormField label="Fecha de vencimiento" error={errors.fechaVencimiento}>
              <input type="date" className="erp-input" value={form.fechaVencimiento} onChange={event => setForm(previous => ({ ...previous, fechaVencimiento: event.target.value }))} />
            </FormField>
          )}
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Origen</h3>
          <div style={{ display: 'flex', gap: '18px', fontSize: '13px' }}>
            <label><input type="radio" checked={form.origen === 'VENTA'} onChange={() => changeOrigin('VENTA')} /> Venta existente</label>
            <label><input type="radio" checked={form.origen === 'MANUAL'} onChange={() => changeOrigin('MANUAL')} /> Crear comprobante sin venta</label>
          </div>
        </section>

        {form.origen === 'VENTA' && (
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
        )}

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>
            {form.tipo === 'FACTURA' ? 'Datos del Cliente (Receptor)' : form.tipo === 'LIQUIDACION_COMPRA' ? 'Datos del Vendedor / Proveedor' : 'Datos del Cliente'}
          </h3>
          <div className="erp-form-grid">
            <FormField label="Tipo de documento">
              <select
                className="erp-input"
                value={form.cliente.tipoDocumento}
                onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, tipoDocumento: event.target.value } }))}
              >
                {form.tipo === 'FACTURA' ? (
                  <option value="RUC">RUC</option>
                ) : (
                  <>
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería (CE)</option>
                    {form.tipo === 'BOLETA' && <option value="PASAPORTE">Pasaporte</option>}
                  </>
                )}
              </select>
            </FormField>
            <FormField
              label="Número de documento"
              required={form.tipo === 'FACTURA' || form.tipo === 'LIQUIDACION_COMPRA' || totals.total >= 700}
              error={errors.clienteDocumento}
            >
              <input
                className="erp-input"
                maxLength={form.cliente.tipoDocumento === 'RUC' ? 11 : form.cliente.tipoDocumento === 'DNI' ? 8 : 15}
                value={form.cliente.documento}
                onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, documento: event.target.value } }))}
              />
            </FormField>
            <FormField
              label={form.tipo === 'FACTURA' ? 'Nombre / Razón social' : form.tipo === 'LIQUIDACION_COMPRA' ? 'Nombre del vendedor' : 'Nombre del cliente'}
              required={form.tipo === 'FACTURA' || form.tipo === 'LIQUIDACION_COMPRA' || totals.total >= 700}
              error={errors.clienteNombre}
            >
              <input className="erp-input" value={form.cliente.nombre} onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, nombre: event.target.value } }))} />
            </FormField>
            <FormField label="Dirección" required={form.tipo === 'LIQUIDACION_COMPRA'}>
              <input className="erp-input" value={form.cliente.direccion} onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, direccion: event.target.value } }))} />
            </FormField>
          </div>
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>{form.origen === 'VENTA' ? 'Detalle de la venta' : 'Detalle del comprobante'}</h3>
          {form.origen === 'VENTA' && form.detalle.length > 0 && <p style={{ margin: '0 0 10px', color: 'var(--erp-text-muted)', fontSize: '12px', display: 'flex', gap: '5px', alignItems: 'center' }}><FiLock /> Los productos y montos corresponden a la venta seleccionada y no pueden modificarse.</p>}
          {form.origen === 'MANUAL' && <button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => setForm(previous => ({ ...previous, detalle: [...previous.detalle, createEmptyItem()] }))}><FiPlus /> Agregar ítem</button>}
          {errors.detalle && <div className="erp-form-error" style={{ marginTop: '8px' }}>{errors.detalle}</div>}
          <div className="erp-table-wrapper" style={{ marginTop: '10px' }}>
            <table className="erp-table">
              <thead><tr><th>Código</th><th>Producto / Servicio</th><th>Cantidad</th><th>Precio unitario</th><th>IGV</th><th>Importe</th>{form.origen === 'MANUAL' && <th />}</tr></thead>
              <tbody>
                {form.detalle.length === 0 ? <tr><td colSpan={form.origen === 'MANUAL' ? 7 : 6} className="text-muted">Selecciona una venta o agrega un ítem manual.</td></tr> : form.detalle.map((item, index) => (
                  <tr key={`${item.codigo}-${index}`}>
                    <td>{form.origen === 'VENTA' ? item.codigo : <span>{item.codigo || '—'}</span>}</td>
                    <td>{form.origen === 'VENTA' ? item.productoServicio : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <select className="erp-input" value={item.productoId ?? ''} onChange={event => selectProduct(index, Number(event.target.value))}>
                          <option value="">Seleccionar producto</option>
                          {productos.map(product => <option key={product.id} value={product.id}>{product.nombre}</option>)}
                        </select>
                        <input
                          type="text"
                          className="erp-input"
                          placeholder="O ingrese descripción libre"
                          value={item.productoServicio}
                          onChange={event => updateManualItem(index, { productoServicio: event.target.value })}
                        />
                      </div>
                    )}</td>
                    <td>{form.origen === 'VENTA' ? item.cantidad : <input type="number" min="1" className="erp-input" value={item.cantidad} onChange={event => updateManualItem(index, { cantidad: Number(event.target.value) })} />}</td>
                    <td>{form.origen === 'VENTA' ? formatAmount(item.precio) : <input type="number" min="0" step="0.01" className="erp-input" value={item.precio} onChange={event => updateManualItem(index, { precio: Number(event.target.value) })} />}</td>
                    <td>{formatAmount(item.igv)}</td><td><strong>{formatAmount(item.importe)}</strong></td>
                    {form.origen === 'MANUAL' && <td><IconButton icon={<FiTrash2 />} tooltip="Eliminar ítem" variant="danger" onClick={() => setForm(previous => ({ ...previous, detalle: previous.detalle.filter((_, itemIndex) => itemIndex !== index) }))} /></td>}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span>IGV (18%)</span><strong>{formatAmount(totals.igv)}</strong></div>
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
          <div>Tipo: {typeLabel} · Venta de origen: {selectedSale ? `Venta #${selectedSale.id}` : 'No especificada'} · Cliente: {form.cliente.nombre || 'No especificado'}</div>
          <div>Documento: {form.cliente.tipoDocumento} {form.cliente.documento || 'No especificado'} · Detalle: {form.detalle.length} producto(s) · Fecha de emisión: {form.fechaEmision}</div>
          <div>Subtotal: {formatAmount(totals.subtotal)} · IGV: {formatAmount(totals.igv)} · Total: {formatAmount(totals.total)}</div>
          {form.tipo === 'FACTURA' && <div>Fecha de vencimiento: {form.fechaVencimiento || 'No especificada'}</div>}
          {form.observaciones && <div>Observaciones: {form.observaciones}</div>}
        </section>
      </div>
    </CrudDialog>
  );
};

export default NewComprobanteDialog;

