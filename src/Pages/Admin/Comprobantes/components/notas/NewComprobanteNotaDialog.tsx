import { useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import IconButton from '../../../../../Components/ERP/IconButton';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import NotaTypeSelector from './NotaTypeSelector';
import { getMotivoConfig } from './motivosConfig';
import type {
  TipoNota,
  TipoNotaCredito,
  TipoNotaDebito,
  NotaFormData,
  NotaFormItem,
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';
import {
  motivosNotaCredito,
  motivosNotaDebito,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface NewNotaDialogProps {
  isOpen: boolean;
  comprobantes: ComprobanteSelectDto[];
  productos: ProductoComprobanteMockDto[];
  loading: boolean;
  onClose: () => void;
  onGenerate: (data: NotaFormData) => Promise<boolean>;
}

type FormErrorKey = 'tipo' | 'motivo' | 'comprobanteRelacionado' | 'detalle' | 'importe' | 'cantidad';
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
  comprobanteRelacionado: {
    id: 0,
    tipo: 'BOLETA',
    serie: '',
    numero: '',
  },
  cliente: {
    tipoDocumento: 'DNI',
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

const NewNotaDialog = ({ isOpen, comprobantes, productos, loading, onClose, onGenerate }: NewNotaDialogProps) => {
  const [form, setForm] = useState<NotaFormData>(createInitialForm);
  const [comprobanteSearch, setComprobanteSearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Filtrar comprobantes que pueden ser modificados (solo BOLETA y FACTURA)
  const comprobantesModificables = comprobantes.filter(
    comp => comp.tipo === 'BOLETA' || comp.tipo === 'FACTURA'
  );

  const filteredComprobantes = useMemo(() => {
    const query = comprobanteSearch.trim().toLowerCase();
    if (!query) return comprobantesModificables;
    return comprobantesModificables.filter(comp =>
      [comp.serie, comp.numero, comp.cliente, comp.documentoCliente, String(comp.total)]
        .some(value => value.toLowerCase().includes(query))
    );
  }, [comprobanteSearch, comprobantesModificables]);

  const selectedComprobante = comprobantesModificables.find(
    comp => comp.id === form.comprobanteRelacionado.id
  );

  // Obtener configuración del motivo actual
  const motivoConfig = useMemo(() => {
    return getMotivoConfig(form.tipo, form.motivo);
  }, [form.tipo, form.motivo]);

  const totals = useMemo(() => ({
    subtotal: Number(form.detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2)),
    igv: Number(form.detalle.reduce((sum, item) => sum + item.igv, 0).toFixed(2)),
    total: Number(form.detalle.reduce((sum, item) => sum + item.importe, 0).toFixed(2)),
  }), [form.detalle]);

  const selectComprobante = (comprobanteId: number) => {
    const comprobante = comprobantesModificables.find(comp => comp.id === comprobanteId);
    if (!comprobante) return;
    
    setForm(previous => ({
      ...previous,
      comprobanteRelacionado: {
        id: comprobante.id,
        tipo: comprobante.tipo,
        serie: comprobante.serie,
        numero: comprobante.numero,
      },
      // Si el comprobante tiene cliente, lo pre-cargamos pero es opcional
      cliente: {
        tipoDocumento: comprobante.tipoDocumentoCliente || 'DNI',
        documento: comprobante.documentoCliente || '',
        nombre: comprobante.cliente || '',
        direccion: comprobante.direccionCliente || '',
        correo: comprobante.correoCliente || '',
      },
      // Limpiar los ítems al cambiar de comprobante para no copiar automáticamente
      detalle: [],
    }));
    setErrors({});
  };

  const handleTypeChange = (tipo: TipoNota) => {
    // Cambiar el motivo al primero del tipo seleccionado
    const nuevoMotivo = tipo === 'NOTA_CREDITO' 
      ? motivosNotaCredito[0] 
      : motivosNotaDebito[0];
    
    setForm(previous => ({
      ...previous,
      tipo,
      motivo: nuevoMotivo as TipoNotaCredito | TipoNotaDebito,
      // Limpiar ítems al cambiar de tipo si el nuevo motivo no requiere ítems
      detalle: [],
    }));
    setErrors({});
  };

  const handleMotivoChange = (motivo: string) => {
    const config = getMotivoConfig(form.tipo, motivo);
    
    setForm(previous => ({
      ...previous,
      motivo: motivo as TipoNotaCredito | TipoNotaDebito,
      // Limpiar ítems si el nuevo motivo no trabaja con ítems
      detalle: config.trabajaConItems ? previous.detalle : [],
    }));
    setErrors({});
  };

  const updateItem = (index: number, change: Partial<NotaFormItem>) => {
    setForm(previous => ({
      ...previous,
      detalle: previous.detalle.map((item, itemIndex) => 
        itemIndex === index ? calculateItem({ ...item, ...change }) : item
      ),
    }));
  };

  const selectProduct = (index: number, productId: number) => {
    const product = productos.find(item => item.id === productId);
    if (!product) return;
    updateItem(index, {
      productoId: product.id,
      codigo: product.codigo,
      productoServicio: product.nombre,
      precio: product.precio,
    });
  };

  const addItem = () => {
    setForm(previous => ({
      ...previous,
      detalle: [...previous.detalle, createEmptyItem()],
    }));
  };

  const removeItem = (index: number) => {
    setForm(previous => ({
      ...previous,
      detalle: previous.detalle.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    
    // Validar tipo de nota
    if (!form.tipo) {
      nextErrors.tipo = 'Debe seleccionar el tipo de nota';
    }
    
    // Validar motivo
    if (!form.motivo) {
      nextErrors.motivo = 'Debe seleccionar el motivo de la nota';
    }
    
    // Validar comprobante relacionado (OBLIGATORIO)
    if (!form.comprobanteRelacionado.id || !form.comprobanteRelacionado.serie || !form.comprobanteRelacionado.numero) {
      nextErrors.comprobanteRelacionado = 'Debe seleccionar el comprobante que modifica';
    }
    
    // Validar detalle según configuración del motivo
    if (motivoConfig.trabajaConItems && motivoConfig.itemsObligatorios) {
      if (form.detalle.length === 0) {
        nextErrors.detalle = `Para el motivo "${form.motivo}" es necesario agregar al menos un ítem`;
      } else if (form.detalle.some(item => !item.productoServicio || item.cantidad <= 0 || item.precio < 0)) {
        nextErrors.detalle = 'Todos los ítems deben tener descripción, cantidad mayor a 0 y precio válido';
      }
    }
    
    // Validar cantidades respecto al comprobante original
    if (selectedComprobante && motivoConfig.trabajaConItems) {
      form.detalle.forEach((item) => {
        const originalItem = selectedComprobante.detalle.find(
          orig => orig.productoServicio === item.productoServicio
        );
        
        if (originalItem && item.cantidad > originalItem.cantidad) {
          nextErrors.cantidad = `El ítem "${item.productoServicio}" excede la cantidad disponible (${originalItem.cantidad})`;
        }
      });
    }
    
    // Validar importe total cuando corresponda
    if (motivoConfig.trabajaConItems && motivoConfig.itemsObligatorios && totals.total <= 0) {
      nextErrors.importe = 'El importe total debe ser mayor a cero';
    }
    
    // Validar que el importe de la nota no exceda el comprobante original para Nota de Crédito
    if (selectedComprobante && form.tipo === 'NOTA_CREDITO' && totals.total > selectedComprobante.total) {
      nextErrors.importe = `El importe de la nota (S/ ${totals.total.toFixed(2)}) no puede exceder el total del comprobante original (S/ ${selectedComprobante.total.toFixed(2)})`;
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    const generated = await onGenerate({ 
      ...form, 
      detalle: form.detalle.map(item => ({ ...item })) 
    });
    if (generated) {
      // Reset form on success
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

  const getMotivos = () => {
    return form.tipo === 'NOTA_CREDITO' ? motivosNotaCredito : motivosNotaDebito;
  };

  const getButtonLabel = () => {
    return form.tipo === 'NOTA_CREDITO' ? 'Emitir Nota de Crédito' : 'Emitir Nota de Débito';
  };

  const getTitle = () => {
    return form.tipo === 'NOTA_CREDITO' ? 'Nueva Nota de Crédito' : 'Nueva Nota de Débito';
  };

  const numberToWords = (num: number): string => {
    // Implementación básica de número a letras
    if (num === 0) return 'CERO';
    const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    if (intPart >= 1000) return `${intPart} CON ${decPart}/100 SOLES`;
    if (intPart >= 100) return `CIEN CON ${decPart}/100 SOLES`;
    if (intPart >= 20) {
      const ten = Math.floor(intPart / 10);
      const unit = intPart % 10;
      return `${tens[ten]} ${unit > 0 ? 'Y ' + units[unit] : ''} CON ${decPart}/100 SOLES`;
    }
    if (intPart >= 10) return `${teens[intPart - 10]} CON ${decPart}/100 SOLES`;
    return `${units[intPart]} CON ${decPart}/100 SOLES`;
  };

  return (
    <CrudDialog
      isOpen={isOpen}
      mode="create"
      onClose={handleClose}
      onConfirm={() => void handleGenerate()}
      title={getTitle()}
      subtitle="Documento tributario que modifica un comprobante existente"
      confirmLabel={getButtonLabel()}
      loading={loading}
      size="xl"
    >
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Tipo de Nota */}
        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Tipo de nota</h3>
          <NotaTypeSelector 
            selectedType={form.tipo} 
            onTypeChange={handleTypeChange} 
          />
        </section>

        {/* Motivo de la nota */}
        <section className="erp-form-grid">
          <FormField label="Motivo de la nota" required error={errors.motivo}>
            <select 
              className="erp-input" 
              value={form.motivo} 
              onChange={event => handleMotivoChange(event.target.value)}
            >
              {getMotivos().map(motivo => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </FormField>
          
          <FormField label="Fecha de emisión">
            <input 
              type="date" 
              className="erp-input" 
              value={form.fechaEmision} 
              onChange={event => setForm(previous => ({ ...previous, fechaEmision: event.target.value }))} 
            />
          </FormField>
        </section>

        {/* Descripción del motivo */}
        {motivoConfig.descripcion && (
          <section style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            background: 'var(--erp-info-light)', 
            fontSize: '13px',
            display: 'flex',
            gap: '10px',
            alignItems: 'start'
          }}>
            <FiInfo style={{ marginTop: '2px', color: 'var(--erp-info)' }} />
            <span>{motivoConfig.descripcion}</span>
          </section>
        )}

        {/* Comprobante que modifica (OBLIGATORIO) */}
        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>
            Documento que modifica <span style={{ color: 'var(--erp-danger)' }}>*</span>
          </h3>
          <SearchInput 
            value={comprobanteSearch} 
            onChange={setComprobanteSearch} 
            placeholder="Buscar por serie, número, cliente o documento..." 
          />
          <select 
            className="erp-input" 
            style={{ marginTop: '8px' }} 
            value={form.comprobanteRelacionado.id || ''} 
            onChange={event => selectComprobante(Number(event.target.value))}
          >
            <option value="">Seleccionar comprobante</option>
            {filteredComprobantes.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.tipo} - {comp.serie}-{comp.numero} · {comp.cliente} · {formatAmount(comp.total)}
              </option>
            ))}
          </select>
          {errors.comprobanteRelacionado && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--erp-danger)' }}>
              {errors.comprobanteRelacionado}
            </div>
          )}
        </section>

        {/* Información del comprobante original (REFERENCIA) */}
        {selectedComprobante && (
          <section style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            background: 'var(--erp-surface)', 
            border: '1px solid var(--erp-border)'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--erp-text-secondary)' }}>
              Información del comprobante original (Referencia)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
              <div><strong>Tipo:</strong> {selectedComprobante.tipo}</div>
              <div><strong>Serie-Número:</strong> {selectedComprobante.serie}-{selectedComprobante.numero}</div>
              <div><strong>Fecha:</strong> {selectedComprobante.fechaEmision}</div>
              <div><strong>Cliente:</strong> {selectedComprobante.cliente}</div>
              <div><strong>Documento:</strong> {selectedComprobante.documentoCliente || '-'}</div>
              <div><strong>Total:</strong> {formatAmount(selectedComprobante.total)}</div>
            </div>
            
            {/* Ítems del comprobante original */}
            {selectedComprobante.detalle && selectedComprobante.detalle.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--erp-text-secondary)' }}>Ítems originales:</strong>
                <div style={{ marginTop: '6px', fontSize: '12px' }}>
                  {selectedComprobante.detalle.map((item, idx) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid var(--erp-border)' }}>
                      {item.productoServicio} · Cantidad: {item.cantidad} · {formatAmount(item.importe)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Datos del cliente (OPCIONAL) */}
        <section className="erp-form-grid">
          <FormField label="Cliente (opcional)">
            <input 
              type="text" 
              className="erp-input" 
              value={form.cliente.nombre || ''} 
              onChange={event => setForm(previous => ({ 
                ...previous, 
                cliente: { ...previous.cliente, nombre: event.target.value } 
              }))} 
              placeholder="Nombre o razón social"
            />
          </FormField>
          
          <FormField label="RUC/DNI (opcional)">
            <input 
              type="text" 
              className="erp-input" 
              value={form.cliente.documento || ''} 
              onChange={event => setForm(previous => ({ 
                ...previous, 
                cliente: { ...previous.cliente, documento: event.target.value } 
              }))} 
              placeholder="Número de documento"
            />
          </FormField>
          
          <FormField label="Dirección (opcional)">
            <input 
              type="text" 
              className="erp-input" 
              value={form.cliente.direccion || ''} 
              onChange={event => setForm(previous => ({ 
                ...previous, 
                cliente: { ...previous.cliente, direccion: event.target.value } 
              }))} 
              placeholder="Dirección fiscal"
            />
          </FormField>
        </section>

        {/* Ítems de la nota (SOLO cuando el motivo lo requiere) */}
        {motivoConfig.trabajaConItems && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: '0', fontSize: '14px' }}>
                Ítems de la nota
                {motivoConfig.itemsObligatorios && <span style={{ color: 'var(--erp-danger)', marginLeft: '4px' }}>*</span>}
              </h3>
              <IconButton 
                icon={<FiPlus />} 
                onClick={addItem} 
                tooltip="Agregar ítem"
              />
            </div>
            
            {errors.detalle && (
              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--erp-danger)' }}>
                {errors.detalle}
              </div>
            )}
            
            {errors.cantidad && (
              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--erp-danger)' }}>
                {errors.cantidad}
              </div>
            )}
            
            {form.detalle.length === 0 ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: 'var(--erp-text-secondary)', 
                border: '1px dashed var(--erp-border)',
                borderRadius: '6px'
              }}>
                {motivoConfig.itemsObligatorios 
                  ? 'Debe agregar al menos un ítem para este motivo. Haz clic en "Agregar ítem" para comenzar.'
                  : 'No hay items agregados. Haz clic en "Agregar ítem" si deseas agregar conceptos a esta nota.'
                }
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.detalle.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 80px 100px 120px 40px',
                      gap: '8px',
                      alignItems: 'start',
                      padding: '10px',
                      background: 'var(--erp-surface)',
                      borderRadius: '6px',
                      border: '1px solid var(--erp-border)'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>
                        Producto
                      </label>
                      <select
                        className="erp-input"
                        value={item.productoId || ''}
                        onChange={event => selectProduct(index, Number(event.target.value))}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>
                        Descripción
                      </label>
                      <input
                        type="text"
                        className="erp-input"
                        value={item.productoServicio}
                        onChange={event => updateItem(index, { productoServicio: event.target.value })}
                        placeholder="Descripción del producto/servicio"
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>
                        Cantidad
                      </label>
                      <input
                        type="number"
                        className="erp-input"
                        value={item.cantidad}
                        onChange={event => updateItem(index, { cantidad: Number(event.target.value) })}
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>
                        Precio
                      </label>
                      <input
                        type="number"
                        className="erp-input"
                        value={item.precio}
                        onChange={event => updateItem(index, { precio: Number(event.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--erp-text-secondary)', marginBottom: '2px', display: 'block' }}>
                        Importe
                      </label>
                      <div style={{ padding: '8px', background: 'var(--erp-surface)', borderRadius: '4px', fontSize: '13px' }}>
                        {formatAmount(item.importe)}
                      </div>
                    </div>
                    
                    <div style={{ paddingTop: '24px' }}>
                      <IconButton
                        icon={<FiTrash2 />}
                        onClick={() => removeItem(index)}
                        tooltip="Eliminar"
                        variant="danger"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Mensaje cuando el motivo no trabaja con ítems */}
        {!motivoConfig.trabajaConItems && (
          <section style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            background: 'var(--erp-success-light)', 
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <strong>Nota:</strong> Para el motivo "{form.motivo}" no es necesario agregar ítems individuales.
          </section>
        )}

        {/* Totales */}
        {motivoConfig.trabajaConItems && form.detalle.length > 0 && (
          <section style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px',
            padding: '16px',
            background: 'var(--erp-surface)',
            borderRadius: '6px',
            border: '1px solid var(--erp-border)'
          }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px', display: 'block' }}>
                Subtotal
              </label>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {formatAmount(totals.subtotal)}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px', display: 'block' }}>
                IGV (18%)
              </label>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {formatAmount(totals.igv)}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px', display: 'block' }}>
                Total
              </label>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--erp-primary)' }}>
                {formatAmount(totals.total)}
              </div>
            </div>
          </section>
        )}

        {errors.importe && (
          <div style={{ fontSize: '12px', color: 'var(--erp-danger)' }}>
            {errors.importe}
          </div>
        )}

        {/* Importe en letras */}
        {motivoConfig.trabajaConItems && form.detalle.length > 0 && (
          <section>
            <FormField label="Importe en letras">
              <div style={{ 
                padding: '10px', 
                background: 'var(--erp-surface)', 
                borderRadius: '4px', 
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                {numberToWords(totals.total)}
              </div>
            </FormField>
          </section>
        )}

        {/* Observaciones */}
        <section>
          <FormField label="Observaciones / Notas">
            <textarea
              className="erp-input"
              value={form.observaciones || ''}
              onChange={event => setForm(previous => ({ ...previous, observaciones: event.target.value }))}
              rows={3}
              placeholder="Observaciones adicionales sobre la nota..."
            />
          </FormField>
        </section>
      </div>
    </CrudDialog>
  );
};

export default NewNotaDialog;