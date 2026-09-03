import { useMemo, useState } from 'react';
import { FiLock } from 'react-icons/fi';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import { totalEnLetras } from '../../../../../Utils/numberToWordsSoles';
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
  | 'moneda';
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

const NewComprobanteDialog = ({ isOpen, ventas, loading, onClose, onGenerate }: NewComprobanteDialogProps) => {
  const [form, setForm] = useState<ComprobanteFormData>(createInitialForm);
  const [saleSearch, setSaleSearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedSale = ventas.find(venta => venta.id === form.ventaOrigenId);
  const filteredSales = useMemo(() => {
    const query = saleSearch.trim().toLowerCase();
    let filtered = ventas;
    
    // Filtrar por tipo de comprobante correspondiente
    if (form.tipo === 'FACTURA') {
      // Para factura, mostrar solo ventas con RUC (11 dígitos)
      filtered = ventas.filter(venta => venta.cliente.documento && venta.cliente.documento.length === 11);
    } else if (form.tipo === 'BOLETA') {
      // Para boleta, mostrar ventas con DNI o sin documento (clientes generales)
      filtered = ventas.filter(venta => !venta.cliente.documento || venta.cliente.documento.length !== 11);
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
    
    const isRuc = sale.cliente.documento && sale.cliente.documento.length === 11;
    
    // Solo cambiar el tipo de comprobante si aún no hay uno seleccionado o si el tipo actual no coincide con el documento
    let shouldChangeTipo = false;
    if (form.tipo === 'BOLETA' && isRuc) {
      shouldChangeTipo = true;
    } else if (form.tipo === 'FACTURA' && !isRuc) {
      shouldChangeTipo = true;
    }
    
    const newTipo = shouldChangeTipo 
      ? (isRuc ? 'FACTURA' : 'BOLETA') 
      : form.tipo;
    
    // Para factura, siempre llenar datos del cliente
    // Para boleta con RUC, dejar datos vacíos (clientes generales)
    // Para boleta con DNI, llenar datos del cliente
    let clienteData;
    if (newTipo === 'FACTURA') {
      clienteData = {
        tipoDocumento: isRuc ? 'RUC' : (sale.cliente.tipoDocumento || 'DNI'),
        documento: sale.cliente.documento || '',
        nombre: sale.cliente.nombre || '',
        direccion: sale.cliente.direccion || '',
        correo: sale.cliente.correo || '',
      };
    } else if (newTipo === 'BOLETA' && isRuc) {
      // Boleta con RUC - dejar datos vacíos (cliente general)
      clienteData = {
        tipoDocumento: 'DNI',
        documento: '',
        nombre: '',
        direccion: '',
        correo: '',
      };
    } else {
      // Boleta con DNI o sin documento - llenar datos del cliente
      clienteData = {
        tipoDocumento: sale.cliente.tipoDocumento || 'DNI',
        documento: sale.cliente.documento || '',
        nombre: sale.cliente.nombre || '',
        direccion: sale.cliente.direccion || '',
        correo: sale.cliente.correo || '',
      };
    }
    
    setForm(previous => ({
      ...previous,
      tipo: newTipo,
      origen: 'VENTA',
      ventaOrigenId: sale.id,
      cliente: clienteData,
      detalle: sale.detalle.map(item => ({ ...item })),
    }));
    setErrors({});
  };

  const handleTipoChange = (newTipo: ComprobanteEmitibleTipo) => {
    setForm(prev => {
      let nextTipoDoc = prev.cliente.tipoDocumento;
      if (newTipo === 'FACTURA') {
        nextTipoDoc = 'RUC';
      } else if (prev.cliente.tipoDocumento === 'RUC' && newTipo === 'BOLETA') {
        nextTipoDoc = 'DNI';
      }
      
      // Limpiar datos del cliente si cambiamos a BOLETA y el cliente actual tiene RUC
      let clienteData = { ...prev.cliente, tipoDocumento: nextTipoDoc };
      if (newTipo === 'BOLETA' && prev.cliente.tipoDocumento === 'RUC') {
        clienteData = {
          tipoDocumento: 'DNI',
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
      if (form.cliente.documento.trim()) {
        if (form.cliente.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.cliente.documento.trim())) {
          nextErrors.clienteDocumento = 'El DNI debe tener 8 dígitos numéricos';
        } else if (form.cliente.tipoDocumento === 'RUC' && !/^\d{11}$/.test(form.cliente.documento.trim())) {
          nextErrors.clienteDocumento = 'El RUC debe tener 11 dígitos numéricos';
        } else if (form.cliente.tipoDocumento === 'CE' && form.cliente.documento.trim().length < 6) {
          nextErrors.clienteDocumento = 'El Carnet de Extranjería debe tener al menos 6 caracteres';
        }
        if (!form.cliente.nombre.trim()) {
          nextErrors.clienteNombre = 'Si registras documento en boleta, el nombre es obligatorio';
        }
        if (!form.cliente.direccion.trim()) {
          nextErrors.clienteDireccion = 'Si registras documento en boleta, la dirección es obligatoria';
        }
      }
    }

    if (form.tipo === 'FACTURA' && form.fechaVencimiento && form.fechaVencimiento < form.fechaEmision) {
      nextErrors.fechaVencimiento = 'La fecha de vencimiento no puede ser anterior a la emisión';
    }

    if (form.moneda !== 'PEN' && form.moneda !== 'USD') {
      nextErrors.moneda = 'La moneda permitida es PEN o USD';
    }

    if (form.tipo === 'FACTURA') {
      if (form.pago.formaPago === 'CREDITO') {
        if (form.pago.cuotas.length === 0) {
          nextErrors.pago = 'Agrega al menos una cuota para factura a crédito';
        } else {
          const totalCuotas = Number(form.pago.cuotas.reduce((sum, cuota) => sum + cuota.monto, 0).toFixed(2));
          const cuotaInvalida = form.pago.cuotas.some(
            cuota => cuota.monto < 0.01 || !cuota.fechaVencimiento || cuota.fechaVencimiento <= today(),
          );

          if (cuotaInvalida) {
            nextErrors.pago = 'Cada cuota debe tener monto válido y vencimiento posterior a hoy';
          } else if (totalCuotas !== totals.total) {
            nextErrors.pago = 'La suma de cuotas debe coincidir exactamente con el total';
          }
        }
      } else if (form.pago.cuotas.length > 0) {
        nextErrors.pago = 'La factura al contado no debe registrar cuotas';
      }
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
            <input type="date" className="erp-input" value={form.fechaEmision} onChange={event => setForm(previous => ({ ...previous, fechaEmision: event.target.value }))} />
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
          {form.tipo === 'FACTURA' && (
            <FormField label="Fecha de vencimiento" error={errors.fechaVencimiento}>
              <input type="date" className="erp-input" value={form.fechaVencimiento} onChange={event => setForm(previous => ({ ...previous, fechaVencimiento: event.target.value }))} />
            </FormField>
          )}
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
          {selectedSale && form.tipo === 'BOLETA' && !selectedSale.cliente.documento && (
            <p style={{ margin: '0 0 10px', color: 'var(--erp-text-muted)', fontSize: '12px' }}>
              Cliente general - Datos del cliente opcionales
            </p>
          )}
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
                    <option value="RUC">RUC</option>
                    <option value="CE">Carnet de Extranjería (CE)</option>
                  </>
                )}
              </select>
            </FormField>
            <FormField
              label="Número de documento"
              required={form.tipo === 'FACTURA'}
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
              label={form.tipo === 'FACTURA' ? 'Nombre / Razón social' : 'Nombre del cliente'}
              required={form.tipo === 'FACTURA' || Boolean(form.cliente.documento.trim())}
              error={errors.clienteNombre}
            >
              <input className="erp-input" value={form.cliente.nombre} onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, nombre: event.target.value } }))} />
            </FormField>
            <FormField label="Dirección" required={Boolean(form.cliente.documento.trim())} error={errors.clienteDireccion}>
              <input className="erp-input" value={form.cliente.direccion} onChange={event => setForm(previous => ({ ...previous, cliente: { ...previous.cliente, direccion: event.target.value } }))} />
            </FormField>
          </div>
        </section>

        {form.tipo === 'FACTURA' && (
          <section>
            <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Forma de pago</h3>
            <div className="erp-form-grid">
              <FormField label="Forma de pago" required error={errors.pago}>
                <select
                  className="erp-input"
                  value={form.pago.formaPago}
                  onChange={event =>
                    setForm(previous => ({
                      ...previous,
                      pago: {
                        formaPago: event.target.value as 'CONTADO' | 'CREDITO',
                        cuotas: event.target.value === 'CREDITO' ? previous.pago.cuotas : [],
                      },
                    }))
                  }
                >
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </FormField>
            </div>

            {form.pago.formaPago === 'CREDITO' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {form.pago.cuotas.map((cuota, index) => (
                  <div key={`cuota-${index}`} className="erp-form-grid">
                    <FormField label={`Cuota ${index + 1} - monto`} required>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="erp-input"
                        value={cuota.monto}
                        onChange={event =>
                          setForm(previous => ({
                            ...previous,
                            pago: {
                              ...previous.pago,
                              cuotas: previous.pago.cuotas.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, monto: Number(event.target.value) }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </FormField>
                    <FormField label={`Cuota ${index + 1} - vencimiento`} required>
                      <input
                        type="date"
                        className="erp-input"
                        value={cuota.fechaVencimiento}
                        onChange={event =>
                          setForm(previous => ({
                            ...previous,
                            pago: {
                              ...previous.pago,
                              cuotas: previous.pago.cuotas.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, fechaVencimiento: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </FormField>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                      <button
                        type="button"
                        className="erp-btn erp-btn-danger"
                        onClick={() =>
                          setForm(previous => ({
                            ...previous,
                            pago: {
                              ...previous.pago,
                              cuotas: previous.pago.cuotas.filter((_, itemIndex) => itemIndex !== index),
                            },
                          }))
                        }
                      >
                        Quitar cuota
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={() =>
                      setForm(previous => ({
                        ...previous,
                        pago: {
                          ...previous.pago,
                          cuotas: [
                            ...previous.pago.cuotas,
                            { monto: 0, fechaVencimiento: '' },
                          ],
                        },
                      }))
                    }
                  >
                    Agregar cuota
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>
                    Suma cuotas: {formatAmount(form.pago.cuotas.reduce((sum, cuota) => sum + cuota.monto, 0))}
                  </span>
                </div>
                {errors.pago && <div className="erp-form-error">{errors.pago}</div>}
              </div>
            )}
          </section>
        )}

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
          <div>Tipo: {typeLabel} · Venta de origen: {selectedSale ? `Venta #${selectedSale.id}` : 'No seleccionada'} · Cliente: {form.cliente.nombre || 'No especificado'}</div>
          <div>Documento: {form.cliente.tipoDocumento} {form.cliente.documento || 'No especificado'} · Moneda: {form.moneda} · Detalle: {form.detalle.length} producto(s) · Fecha de emisión: {form.fechaEmision}</div>
          <div>Subtotal: {formatAmount(totals.subtotal)} · IGV: {formatAmount(totals.igv)} · Total: {formatAmount(totals.total)}</div>
          {form.tipo === 'FACTURA' && <div>Fecha de vencimiento: {form.fechaVencimiento || 'No especificada'}</div>}
          {form.tipo === 'FACTURA' && <div>Forma de pago: {form.pago.formaPago}{form.pago.formaPago === 'CREDITO' ? ` · ${form.pago.cuotas.length} cuota(s)` : ''}</div>}
          {form.observaciones && <div>Observaciones: {form.observaciones}</div>}
        </section>
      </div>
    </CrudDialog>
  );
};

export default NewComprobanteDialog;
