import { useState, useMemo, useEffect, useCallback } from 'react';
import { CajaService } from '../../../../Services/Admin/Ventas/Caja';
import { MetodoPagoService } from '../../../../Services/Admin/Ventas/MetodoPago';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';
import type { MetodoPagoSelectDto } from '../../../../Types/Admin/Ventas/MetodoPago';
import type {
  CajaClienteDto,
  CajaClienteInsertDto,
  CajaVentaInsertDto,
  CajaDetalleInsertDto,
  CajaPagoInsertDto,
} from '../../../../Types/Admin/Ventas/Caja';
import { useAuth } from '../../../../Context/AuthContext';
import { resolveImageUrl, isActivoEstado } from '../../../../Utils/imageUtils';
import { downloadComprobantePdf } from '../../../../Utils/generateComprobantePdf';
import {
  FiSearch,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiX,
  FiEdit3,
  FiCreditCard,
  FiPackage,
  FiUserPlus,
} from 'react-icons/fi';
import './CajaSection.css';

interface CartItem {
  producto: ProductoSelectDto;
  cantidad: number;
}

interface PagoForm {
  idMetodoPago: number;
  monto: string;
  codigoOperacion: string;
}

type ClientStatus = 'idle' | 'pending' | 'valid' | 'invalid';
type SalePhase = 'editing' | 'confirmed';

const EMPTY_CLIENT_FORM: CajaClienteInsertDto = {
  nombreApellido: '',
  dni: '',
  telefono: '',
  correo: '',
};

const createEmptyPago = (metodos: MetodoPagoSelectDto[]): PagoForm => ({
  idMetodoPago: metodos[0]?.id ?? 0,
  monto: '',
  codigoOperacion: '',
});

const CajaSection = () => {
  const { usuario } = useAuth();

  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salePhase, setSalePhase] = useState<SalePhase>('editing');

  const [searchDni, setSearchDni] = useState('');
  const [clientStatus, setClientStatus] = useState<ClientStatus>('idle');
  const [selectedClient, setSelectedClient] = useState<CajaClienteDto | null>(null);
  const [searchingClient, setSearchingClient] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [clientForm, setClientForm] = useState<CajaClienteInsertDto>(EMPTY_CLIENT_FORM);
  const [savingClient, setSavingClient] = useState(false);

  const [showDniExistsDialog, setShowDniExistsDialog] = useState(false);
  const [existingClientFound, setExistingClientFound] = useState<CajaClienteDto | null>(null);

  const [productDialog, setProductDialog] = useState<ProductoSelectDto | null>(null);
  const [dialogQty, setDialogQty] = useState(1);

  const [useMultiplePayments, setUseMultiplePayments] = useState(false);
  const [pagos, setPagos] = useState<PagoForm[]>([createEmptyPago([])]);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const vendedorNombre = usuario
    ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim()
    : 'Vendedor';

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, metodos] = await Promise.all([
        ProductoService.getProductos(),
        MetodoPagoService.getMetodosPago(),
      ]);
      setProductos(prods.filter(p => p.estado));
      const activos = metodos.filter(m => isActivoEstado(m.estado));
      setMetodosPago(activos);
      setPagos([createEmptyPago(activos)]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de caja');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const totals = useMemo(() => {
    const total = cart.reduce((s, i) => s + i.producto.precioVenta * i.cantidad, 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;
    return { subtotal, igv, total };
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return productos;
    return productos.filter(
      p =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q)
    );
  }, [productos, productSearch]);

  const cartLocked = salePhase === 'confirmed';

  const resetSale = () => {
    setCart([]);
    setSalePhase('editing');
    setSearchDni('');
    setSelectedClient(null);
    setClientStatus('idle');
    setUseMultiplePayments(false);
    setPagos([{ ...createEmptyPago(metodosPago), monto: '' }]);
    setSuccessMsg(null);
    setShowCreateDialog(false);
    setShowDniExistsDialog(false);
    setClientForm(EMPTY_CLIENT_FORM);
  };

  const applyClient = (client: CajaClienteDto) => {
    setSelectedClient(client);
    setSearchDni(client.dni);
    setClientStatus('valid');
    setShowCreateDialog(false);
    setShowDniExistsDialog(false);
    setClientForm(EMPTY_CLIENT_FORM);
  };

  const handleSearchClientByDni = async () => {
    const dni = searchDni.trim();
    if (!dni) {
      setClientStatus('idle');
      setSelectedClient(null);
      return;
    }
    setSearchingClient(true);
    setClientStatus('pending');
    setSelectedClient(null);
    try {
      const client = await CajaService.buscarClientePorDni(dni);
      if (client?.id) {
        applyClient(client);
      } else {
        setClientStatus('invalid');
      }
    } catch {
      setClientStatus('invalid');
      setSelectedClient(null);
    } finally {
      setSearchingClient(false);
    }
  };

  const openCreateClient = () => {
    setClientForm({ ...EMPTY_CLIENT_FORM, dni: searchDni });
    setShowCreateDialog(true);
    setShowDniExistsDialog(false);
    setExistingClientFound(null);
  };

  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.nombreApellido.trim() || !clientForm.dni.trim()) return;

    setSavingClient(true);
    setError(null);
    try {
      const existing = await CajaService.buscarClientePorDni(clientForm.dni.trim());
      if (existing?.id) {
        setExistingClientFound(existing);
        setShowDniExistsDialog(true);
        return;
      }
    } catch {
      /* DNI no existe, continuar creación */
    }

    try {
      const res = await CajaService.crearCliente(clientForm);
      if (res?.idCliente) {
        applyClient({
          id: res.idCliente,
          nombreApellido: clientForm.nombreApellido,
          dni: clientForm.dni,
          telefono: clientForm.telefono,
          correo: clientForm.correo,
        });
      } else {
        setError(res?.mensaje || 'No se pudo registrar el cliente');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setSavingClient(false);
    }
  };

  const handleDniExistsYes = () => {
    if (existingClientFound) applyClient(existingClientFound);
  };

  const handleDniExistsNo = () => {
    setShowDniExistsDialog(false);
    setExistingClientFound(null);
    setClientForm(prev => ({ ...prev, dni: '' }));
  };

  const handleAddToCart = (producto: ProductoSelectDto, cantidad: number) => {
    if (cartLocked) return;
    const stock = Math.max(0, Number(producto.stock) || 0);
    const qty = Math.max(1, cantidad);
    const existing = cart.find(i => i.producto.id === producto.id);
    const nuevaCantidad = existing ? existing.cantidad + qty : qty;

    if (stock <= 0) {
      setError(`No hay stock disponible de "${producto.nombre}".`);
      return;
    }
    if (nuevaCantidad > stock) {
      setError(`No hay suficiente stock de "${producto.nombre}". Disponible: ${stock}`);
      return;
    }

    setError(null);
    setCart(prev => {
      const current = prev.find(i => i.producto.id === producto.id);
      if (current) {
        return prev.map(i =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + qty } : i
        );
      }
      return [...prev, { producto, cantidad: qty }];
    });
    setProductDialog(null);
    setDialogQty(1);
  };

  const updateQty = (id: number, delta: number) => {
    if (cartLocked) return;
    const item = cart.find(i => i.producto.id === id);
    if (!item) return;

    const next = item.cantidad + delta;
    if (next <= 0) {
      setCart(prev => prev.filter(i => i.producto.id !== id));
      return;
    }

    const stock = Math.max(0, Number(item.producto.stock) || 0);
    if (next > stock) {
      setError(`No hay suficiente stock de "${item.producto.nombre}". Disponible: ${stock}`);
      return;
    }

    setError(null);
    setCart(prev =>
      prev.map(i => (i.producto.id === id ? { ...i, cantidad: next } : i))
    );
  };

  const removeItem = (id: number) => {
    if (cartLocked) return;
    setCart(prev => prev.filter(i => i.producto.id !== id));
  };

  const metodoRequiereCodigo = (id: number) => {
    const m = metodosPago.find(x => x.id === id);
    return !m?.nombre.toUpperCase().includes('EFECTIVO');
  };

  const updatePago = (idx: number, patch: Partial<PagoForm>) => {
    setPagos(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const addPagoRow = () => {
    setPagos(prev => [...prev, createEmptyPago(metodosPago)]);
  };

  const removePagoRow = (idx: number) => {
    if (pagos.length <= 1) return;
    setPagos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      setError('Agregue al menos un producto al carrito');
      return;
    }
    if (!selectedClient || clientStatus !== 'valid') {
      setError('Debe buscar y validar un cliente por DNI antes de confirmar');
      return;
    }
    setError(null);
    setSalePhase('confirmed');
    setPagos([{ ...createEmptyPago(metodosPago), monto: totals.total.toFixed(2) }]);
    setUseMultiplePayments(false);
  };

  const buildPagosPayload = (): CajaPagoInsertDto[] | null => {
    const list = useMultiplePayments ? pagos : [pagos[0]];
    const parsed = list.map(p => ({
      idMetodoPago: p.idMetodoPago,
      monto: parseFloat(p.monto),
      codigoOperacion: p.codigoOperacion.trim() || undefined,
    }));

    if (parsed.some(p => isNaN(p.monto) || p.monto <= 0)) return null;

    const sum = parsed.reduce((s, p) => s + p.monto, 0);
    if (Math.abs(sum - totals.total) > 0.02) return null;

    return parsed;
  };

  const handleFinalizeSale = async () => {
    if (!selectedClient) return;
    const pagosPayload = buildPagosPayload();
    if (!pagosPayload) {
      setError('Verifique los montos: la suma de pagos debe igualar el total.');
      return;
    }
    for (const p of pagosPayload) {
      if (metodoRequiereCodigo(p.idMetodoPago) && !p.codigoOperacion?.trim()) {
        setError('Ingrese el número de operación para los métodos que lo requieren');
        return;
      }
    }

    setProcessing(true);
    setError(null);
    try {
      const detalle: CajaDetalleInsertDto[] = cart.map(i => ({
        idProducto: i.producto.id,
        cantidad: i.cantidad,
        precioUnitario: i.producto.precioVenta,
      }));

      const idUsuario = usuario?.id ? Number(usuario.id) : 1;
      const payload: CajaVentaInsertDto = {
        idCliente: selectedClient.id,
        idUsuario: isNaN(idUsuario) ? 1 : idUsuario,
        igv: Number(totals.igv.toFixed(4)),
        detalle,
        pagos: pagosPayload,
      };

      const response = await CajaService.registrarVenta(payload);

      await downloadComprobantePdf({
        idVenta: response.idVenta,
        cliente: selectedClient,
        vendedor: vendedorNombre,
        items: cart,
        subtotal: totals.subtotal,
        igv: totals.igv,
        total: totals.total,
        pagos: pagosPayload,
        metodos: metodosPago,
      });

      setSuccessMsg(`Venta registrada — Comprobante #${response.idVenta}. PDF descargado.`);
      resetSale();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const clientStatusLabel = () => {
    if (clientStatus === 'valid') return { text: 'Cliente validado', cls: 'valid' };
    if (clientStatus === 'invalid') return { text: 'Cliente no encontrado', cls: 'invalid' };
    if (clientStatus === 'pending') return { text: 'Buscando...', cls: 'pending' };
    return { text: 'Sin validar — ingrese DNI y busque', cls: 'idle' };
  };

  const statusInfo = clientStatusLabel();
  const pagosSum = pagos.reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);

  return (
    <div className="caja-container">
      {error && <div className="caja-alert caja-alert-error">{error}</div>}
      {successMsg && <div className="caja-alert caja-alert-success">{successMsg}</div>}

      <div className="caja-layout">
        <aside className={`caja-panel caja-panel-catalog ${cartLocked ? 'locked' : ''}`}>
          <div className="caja-panel-head">
            <FiPackage />
            <span>Catálogo de productos</span>
          </div>
          <div className="caja-filters">
            <div className="caja-search-wrap">
              <FiSearch />
              <input
                type="text"
                className="erp-input"
                placeholder="Buscar por nombre o categoría..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                disabled={cartLocked}
              />
            </div>
          </div>
          <div className="caja-product-list">
            {loading ? (
              <p className="caja-empty">Cargando productos...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="caja-empty">No hay productos coincidentes</p>
            ) : (
              filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className="caja-product-row"
                  onClick={() => !cartLocked && setProductDialog(p)}
                  disabled={cartLocked || (Number(p.stock) || 0) <= 0}
                >
                  <span className="caja-product-name">{p.nombre}</span>
                  <span className="caja-product-meta">
                    {p.categoria} · S/ {p.precioVenta.toFixed(2)} · Stock: {Number(p.stock) || 0}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="caja-panel caja-panel-main">
          <section className="caja-client-block">
            <div className="caja-panel-head">
              <FiUser />
              <span>Datos del cliente</span>
            </div>
            <div className="caja-client-search">
              <input
                type="text"
                className="erp-input"
                placeholder="DNI del cliente (8 dígitos)"
                value={searchDni}
                maxLength={8}
                onChange={e => {
                  setSearchDni(e.target.value.replace(/\D/g, ''));
                  if (clientStatus !== 'idle') {
                    setClientStatus('idle');
                    setSelectedClient(null);
                  }
                }}
                disabled={cartLocked && clientStatus === 'valid'}
              />
              <button
                type="button"
                className="erp-btn erp-btn-primary caja-btn-search"
                onClick={handleSearchClientByDni}
                disabled={searchingClient || !searchDni.trim()}
                aria-label="Buscar cliente por DNI"
                title="Buscar cliente"
              >
                <FiSearch />
              </button>
            </div>
            <div className={`caja-client-status caja-client-status--${statusInfo.cls}`}>
              {statusInfo.cls === 'valid' && <FiCheckCircle />}
              {statusInfo.cls === 'invalid' && <FiAlertCircle />}
              {(statusInfo.cls === 'idle' || statusInfo.cls === 'pending') && <FiHelpCircle />}
              <span>{statusInfo.text}</span>
            </div>
            {selectedClient && (
              <div className="caja-client-fields">
                <div><strong>Nombre:</strong> {selectedClient.nombreApellido}</div>
                <div><strong>DNI:</strong> {selectedClient.dni}</div>
                <div><strong>Teléfono:</strong> {selectedClient.telefono || '—'}</div>
                <div><strong>Correo:</strong> {selectedClient.correo || '—'}</div>
              </div>
            )}
            {!cartLocked && (
              <div className="caja-client-actions">
                <button type="button" className="erp-btn erp-btn-sm erp-btn-primary" onClick={openCreateClient}>
                  <FiUserPlus /> Crear cliente
                </button>
              </div>
            )}
          </section>

          <section className={`caja-cart-block ${cartLocked ? 'caja-cart-block--confirmed' : ''}`}>
            <div className="caja-panel-head">
              <FiShoppingCart />
              <span>Carrito de venta</span>
              <span className="caja-cart-count">{cart.length} ítem{cart.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="caja-cart-list">
              {cart.length === 0 ? (
                <p className="caja-empty">Seleccione productos del catálogo</p>
              ) : (
                cart.map(item => {
                  const img = resolveImageUrl(item.producto.rutaImagen);
                  return (
                    <div key={item.producto.id} className="caja-cart-item">
                      <div className="caja-cart-img">
                        {img ? <img src={img} alt={item.producto.nombre} /> : <FiPackage />}
                      </div>
                      <div className="caja-cart-info">
                        <strong>{item.producto.nombre}</strong>
                        <span>S/ {item.producto.precioVenta.toFixed(2)} c/u · Stock: {Number(item.producto.stock) || 0}</span>
                      </div>
                      {!cartLocked ? (
                        <div className="caja-cart-qty">
                          <button type="button" onClick={() => updateQty(item.producto.id, -1)}><FiMinus /></button>
                          <span>{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.producto.id, 1)}
                            disabled={item.cantidad >= (Number(item.producto.stock) || 0)}
                            title={
                              item.cantidad >= (Number(item.producto.stock) || 0)
                                ? 'No hay suficiente stock'
                                : 'Aumentar'
                            }
                          >
                            <FiPlus />
                          </button>
                          <button type="button" className="danger" onClick={() => removeItem(item.producto.id)}><FiTrash2 /></button>
                        </div>
                      ) : (
                        <span className="caja-cart-qty-readonly">× {item.cantidad}</span>
                      )}
                      <div className="caja-cart-sub">
                        S/ {(item.producto.precioVenta * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="caja-totals">
              <div><span>Subtotal</span><span>S/ {totals.subtotal.toFixed(2)}</span></div>
              <div><span>IGV (18%)</span><span>S/ {totals.igv.toFixed(2)}</span></div>
              <div className="caja-total-row"><span>Total</span><span>S/ {totals.total.toFixed(2)}</span></div>
            </div>
          </section>

          <div className="caja-actions">
            {salePhase === 'editing' ? (
              <button
                type="button"
                className="caja-btn-confirm"
                onClick={handleConfirmOrder}
                disabled={cart.length === 0}
              >
                Confirmar carrito
              </button>
            ) : (
              <>
                <button type="button" className="caja-btn-secondary" onClick={() => setSalePhase('editing')}>
                  <FiEdit3 /> Volver a editar
                </button>

                <div className="caja-payment-block">
                  <div className="caja-panel-head">
                    <FiCreditCard />
                    <span>Realizar pago</span>
                  </div>

                  {metodosPago.length === 0 ? (
                    <p className="caja-empty">No hay métodos de pago disponibles</p>
                  ) : (
                    <>
                      <label className="caja-split-toggle">
                        <input
                          type="checkbox"
                          checked={useMultiplePayments}
                          onChange={e => {
                            setUseMultiplePayments(e.target.checked);
                            if (e.target.checked) {
                              setPagos([
                                { ...createEmptyPago(metodosPago), monto: '' },
                                { ...createEmptyPago(metodosPago), monto: '' },
                              ]);
                            } else {
                              setPagos([{ ...createEmptyPago(metodosPago), monto: totals.total.toFixed(2) }]);
                            }
                          }}
                        />
                        Dividir pago en varios métodos
                      </label>

                      {(useMultiplePayments ? pagos : [pagos[0]]).map((pago, idx) => (
                        <div key={idx} className="caja-pago-form">
                          <div className="caja-pago-form-header">
                            <span className="caja-pago-label">Pago {idx + 1}</span>
                            {useMultiplePayments && pagos.length > 1 && (
                              <button type="button" className="caja-pago-remove" onClick={() => removePagoRow(idx)}>
                                <FiTrash2 size={12} />
                              </button>
                            )}
                          </div>
                          <select
                            className="erp-input"
                            value={pago.idMetodoPago}
                            onChange={e => updatePago(idx, { idMetodoPago: Number(e.target.value) })}
                          >
                            {metodosPago.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="erp-input"
                            placeholder="Monto"
                            min="0"
                            step="0.01"
                            value={pago.monto}
                            onChange={e => updatePago(idx, { monto: e.target.value })}
                          />
                          {metodoRequiereCodigo(pago.idMetodoPago) && (
                            <input
                              type="text"
                              className="erp-input"
                              placeholder="N° operación / referencia"
                              value={pago.codigoOperacion}
                              onChange={e => updatePago(idx, { codigoOperacion: e.target.value })}
                            />
                          )}
                        </div>
                      ))}

                      {useMultiplePayments && (
                        <>
                          <button type="button" className="caja-btn-add-pago" onClick={addPagoRow}>
                            <FiPlus /> Agregar otro método de pago
                          </button>
                          <p className="caja-pago-hint">
                            Suma: S/ {pagosSum.toFixed(2)} / Total: S/ {totals.total.toFixed(2)}
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="caja-btn-confirm"
                  onClick={handleFinalizeSale}
                  disabled={processing || metodosPago.length === 0}
                >
                  {processing ? 'Registrando...' : 'Confirmar venta y descargar boleta'}
                </button>
              </>
            )}
          </div>
        </main>
      </div>

      {productDialog && (
        <div className="caja-modal-backdrop" onClick={() => setProductDialog(null)}>
          <div className="caja-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="caja-modal-close" onClick={() => setProductDialog(null)}><FiX /></button>
            <div className="caja-modal-img">
              {resolveImageUrl(productDialog.rutaImagen) ? (
                <img src={resolveImageUrl(productDialog.rutaImagen)!} alt={productDialog.nombre} />
              ) : (
                <FiPackage size={48} />
              )}
            </div>
            <h3>{productDialog.nombre}</h3>
            <p className="caja-modal-desc">{productDialog.descripcion || 'Sin descripción'}</p>
            <p className="caja-modal-price">S/ {productDialog.precioVenta.toFixed(2)}</p>
            <p className="caja-modal-desc">
              {(Number(productDialog.stock) || 0) <= 0
                ? 'Sin stock disponible'
                : `${Number(productDialog.stock) || 0} ejemplar${(Number(productDialog.stock) || 0) !== 1 ? 'es' : ''} disponible${(Number(productDialog.stock) || 0) !== 1 ? 's' : ''}`}
            </p>
            <div className="caja-modal-qty">
              <label>Cantidad</label>
              <div className="caja-qty-controls">
                <button type="button" onClick={() => setDialogQty(q => Math.max(1, q - 1))}><FiMinus /></button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, Number(productDialog.stock) || 1)}
                  value={dialogQty}
                  onChange={e => {
                    const stock = Math.max(0, Number(productDialog.stock) || 0);
                    const val = Math.max(1, Number(e.target.value) || 1);
                    if (stock > 0 && val > stock) {
                      setDialogQty(stock);
                      setError(`No hay suficiente stock. Disponible: ${stock}`);
                    } else {
                      setError(null);
                      setDialogQty(val);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const stock = Math.max(0, Number(productDialog.stock) || 0);
                    setDialogQty(q => {
                      if (q + 1 > stock) {
                        setError(`No hay suficiente stock. Disponible: ${stock}`);
                        return q;
                      }
                      setError(null);
                      return q + 1;
                    });
                  }}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            <button
              type="button"
              className="caja-btn-confirm"
              onClick={() => handleAddToCart(productDialog, dialogQty)}
              disabled={(Number(productDialog.stock) || 0) <= 0}
            >
              {(Number(productDialog.stock) || 0) <= 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      )}

      {showCreateDialog && (
        <div className="caja-modal-backdrop" onClick={() => setShowCreateDialog(false)}>
          <div className="caja-modal caja-modal-wide" onClick={e => e.stopPropagation()}>
            <button type="button" className="caja-modal-close" onClick={() => setShowCreateDialog(false)}><FiX /></button>
            <h3>Crear cliente</h3>
            <p className="caja-modal-sub">Complete los datos del nuevo cliente</p>
            <form className="caja-create-client" onSubmit={handleCreateClientSubmit}>
              <div className="caja-form-grid">
                <input className="erp-input" placeholder="Nombres y apellidos *" required value={clientForm.nombreApellido} onChange={e => setClientForm(p => ({ ...p, nombreApellido: e.target.value }))} />
                <input className="erp-input" placeholder="DNI *" required maxLength={8} value={clientForm.dni} onChange={e => setClientForm(p => ({ ...p, dni: e.target.value.replace(/\D/g, '').slice(0, 8) }))} />
                <input className="erp-input" placeholder="Teléfono" value={clientForm.telefono} onChange={e => setClientForm(p => ({ ...p, telefono: e.target.value }))} />
                <input className="erp-input" placeholder="Correo" type="email" value={clientForm.correo} onChange={e => setClientForm(p => ({ ...p, correo: e.target.value }))} />
              </div>
              <button type="submit" className="erp-btn erp-btn-primary" disabled={savingClient}>
                {savingClient ? 'Guardando...' : 'Registrar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDniExistsDialog && existingClientFound && (
        <div className="caja-modal-backdrop">
          <div className="caja-modal caja-modal-confirm">
            <h3>Cliente ya registrado</h3>
            <p className="caja-modal-sub">
              El DNI <strong>{existingClientFound.dni}</strong> pertenece a:
            </p>
            <p className="caja-dni-exists-name">{existingClientFound.nombreApellido}</p>
            <p className="caja-modal-sub">¿Es su DNI?</p>
            <div className="caja-confirm-actions">
              <button type="button" className="erp-btn erp-btn-primary" onClick={handleDniExistsYes}>
                Sí, es mi DNI
              </button>
              <button type="button" className="erp-btn erp-btn-secondary" onClick={handleDniExistsNo}>
                No, ingresar otro DNI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaSection;
