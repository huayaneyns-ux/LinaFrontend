import { useState, useMemo, useEffect, useCallback } from 'react';
import { CajaService } from '../../../../Services/Admin/Ventas/Caja';
import { VentaRealizadaService } from '../../../../Services/Admin/Ventas/Venta';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { CategoriaService } from '../../../../Services/Admin/Inventario/Categoria';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';
import type { CategoriaSelectDto } from '../../../../Types/Admin/Inventario/Categoria';
import type { VentaRealizadaSelectDto } from '../../../../Types/Admin/Ventas/Venta';
import type {
  CajaClienteDto,
  CajaClienteInsertDto,
  CajaVentaInsertDto,
  CajaDetalleInsertDto,
  CajaPagoInsertDto,
} from '../../../../Types/Admin/Ventas/Caja';
import { useAuth } from '../../../../Context/AuthContext';
import { formatDate } from '../../../../Utils/formatters';
import { 
  FiDollarSign, 
  FiSmartphone, 
  FiCreditCard, 
  FiTrendingUp, 
  FiSearch, 
  FiShoppingCart, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiUser, 
  FiCheckCircle, 
  FiPlusCircle,
  FiXCircle
} from 'react-icons/fi';
import './CajaSection.css';

const BASE_APERTURA = 350;

interface CartItem {
  producto: ProductoSelectDto;
  cantidad: number;
}

const resolveImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `https://localhost:7146${clean}`;
};

const CajaSection = () => {
  const { usuario } = useAuth();
  
  // Data States
  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaSelectDto[]>([]);
  const [ventas, setVentas] = useState<VentaRealizadaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [ventasLoading, setVentasLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client States
  const [searchDni, setSearchDni] = useState('');
  const [searchingClient, setSearchingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CajaClienteDto | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState<CajaClienteInsertDto>({
    nombreApellido: '',
    dni: '',
    telefono: '',
    correo: '',
  });
  const [savingClient, setSavingClient] = useState(false);

  // Product Selection/POS States
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'todas'>('todas');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout States
  const [selectedMetodo, setSelectedMetodo] = useState<number>(1); // 1 = EFECTIVO
  const [codigoOperacion, setCodigoOperacion] = useState('');
  const [processing, setProcessing] = useState(false);

  // Local/Session opening simulation
  const [cajaAbierta] = useState(true);

  // Load Initial Data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, catsData] = await Promise.all([
        ProductoService.getProductos(),
        CategoriaService.getCategorias(),
      ]);
      // Filter only active products and active categories
      setProductos(prodsData.filter(p => p.estado));
      setCategorias(catsData.filter(c => c.estado));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos y catálogos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVentas = useCallback(async () => {
    try {
      setVentasLoading(true);
      const data = await VentaRealizadaService.getVentas();
      setVentas(data);
    } catch {
      // Ignorar silenciosamente o poner vacío si falla
      setVentas([]);
    } finally {
      setVentasLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    loadVentas();
  }, [loadInitialData, loadVentas]);

  // Client Lookup
  const handleSearchClient = async () => {
    if (!searchDni.trim()) return;
    setSearchingClient(true);
    setSelectedClient(null);
    setShowClientForm(false);
    try {
      const client = await CajaService.buscarClientePorDni(searchDni);
      if (client && client.id) {
        setSelectedClient(client);
      } else {
        // Pre-fill DNI and show form
        setClientForm({
          nombreApellido: '',
          dni: searchDni,
          telefono: '',
          correo: '',
        });
        setShowClientForm(true);
      }
    } catch {
      // Client not found, show form
      setClientForm({
        nombreApellido: '',
        dni: searchDni,
        telefono: '',
        correo: '',
      });
      setShowClientForm(true);
    } finally {
      setSearchingClient(false);
    }
  };

  // Client Creation
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.nombreApellido || !clientForm.dni) {
      alert('Por favor complete Nombre y DNI');
      return;
    }
    setSavingClient(true);
    try {
      const response = await CajaService.crearCliente(clientForm);
      if (response && response.idCliente) {
        setSelectedClient({
          id: response.idCliente,
          nombreApellido: clientForm.nombreApellido,
          dni: clientForm.dni,
          telefono: clientForm.telefono,
          correo: clientForm.correo,
        });
        setShowClientForm(false);
      } else {
        alert(response.mensaje || 'Error al registrar cliente');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar cliente');
    } finally {
      setSavingClient(false);
    }
  };

  // Cart Management
  const handleAddToCart = (producto: ProductoSelectDto) => {
    setCart(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleUpdateQuantity = (idProducto: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.producto.id === idProducto) {
            const nextQty = item.cantidad + delta;
            return { ...item, cantidad: nextQty };
          }
          return item;
        })
        .filter(item => item.cantidad > 0)
    );
  };

  const handleRemoveFromCart = (idProducto: number) => {
    setCart(prev => prev.filter(item => item.producto.id !== idProducto));
  };

  // Cart Calculations
  const totals = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + item.producto.precioVenta * item.cantidad, 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;
    return { subtotal, igv, total };
  }, [cart]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchSearch =
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
      const matchCat = selectedCategory === 'todas' || p.idCategoria === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [productos, productSearch, selectedCategory]);

  // Checkout
  const handleProcessSale = async () => {
    if (!cajaAbierta) return;
    if (!selectedClient) {
      alert('Por favor busque o registre un cliente para continuar');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito de ventas está vacío');
      return;
    }

    setProcessing(true);
    try {
      const detalle: CajaDetalleInsertDto[] = cart.map(item => ({
        idProducto: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioVenta,
      }));

      const pagos: CajaPagoInsertDto[] = [
        {
          idMetodoPago: selectedMetodo,
          monto: totals.total,
          codigoOperacion: codigoOperacion.trim(),
        },
      ];

      // Use active user ID or fallback to 1 (Admin)
      const idUsuario = usuario?.id ? Number(usuario.id) : 1;

      const payload: CajaVentaInsertDto = {
        idCliente: selectedClient.id,
        idUsuario: isNaN(idUsuario) ? 1 : idUsuario,
        igv: Number(totals.igv.toFixed(4)),
        detalle,
        pagos,
      };

      const response = await CajaService.registrarVenta(payload);
      alert(`Venta registrada con éxito. Boleta #${response.idVenta}\n${response.mensaje}`);
      
      // Clear Cart and Client
      setCart([]);
      setSelectedClient(null);
      setSearchDni('');
      setCodigoOperacion('');
      
      // Reload History
      await loadVentas();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 1, label: 'Efectivo', color: '#16a34a', bg: '#dcfce7', icon: <FiDollarSign /> },
    { id: 2, label: 'Yape', color: '#7c3aed', bg: '#f3e8ff', icon: <FiSmartphone /> },
    { id: 3, label: 'Plin', color: '#06b6d4', bg: '#ecfeff', icon: <FiSmartphone /> },
    { id: 4, label: 'Visa', color: '#2563eb', bg: '#dbeafe', icon: <FiCreditCard /> },
    { id: 5, label: 'Mastercard', color: '#ea580c', bg: '#ffedd5', icon: <FiCreditCard /> },
    { id: 6, label: 'Transferencia', color: '#0284c7', bg: '#e0f2fe', icon: <FiTrendingUp /> },
  ];

  // Turn History (simulated or real from today)
  const turnoVentas = useMemo(() => {
    const todayStr = new Date().toDateString();
    return ventas.filter(v => new Date(v.fecha).toDateString() === todayStr);
  }, [ventas]);

  // Statistics
  const stats = useMemo(() => {
    const totalVentasTurno = turnoVentas.reduce((sum, v) => sum + v.total, 0);
    const totalCaja = BASE_APERTURA + totalVentasTurno;
    return { totalVentasTurno, totalCaja };
  }, [turnoVentas]);

  return (
    <div className="caja-container">
      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="caja-top-grid">
        <div className="caja-card-stat">
          <div className="caja-card-header-row">
            <span className="caja-card-label">Caja Chica General</span>
            <span className={`caja-badge-status ${cajaAbierta ? 'abierta' : 'cerrada'}`}>
              <FiCheckCircle /> {cajaAbierta ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <span className="caja-card-value">S/ {stats.totalCaja.toFixed(2)}</span>
          <span className="caja-card-sub">Base apertura: S/ {BASE_APERTURA.toFixed(2)}</span>
        </div>

        <div className="caja-card-stat">
          <span className="caja-card-label">Ventas del Turno (Hoy)</span>
          <span className="caja-card-value text-green">S/ {stats.totalVentasTurno.toFixed(2)}</span>
          <span className="caja-card-sub">{turnoVentas.length} transacciones registradas hoy</span>
        </div>

        <div className="caja-card-stat">
          <span className="caja-card-label">Operador Activo</span>
          <span className="caja-card-value text-blue" style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0' }}>
            {usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Administrador'}
          </span>
          <span className="caja-card-sub">Rol: {usuario?.rol || 'ADMINISTRADOR'}</span>
        </div>
      </div>

      {/* POS Panels Grid */}
      <div className="caja-main-panels" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        
        {/* LEFT PANEL: POS Shopping Grid */}
        <div className="caja-panel-register">
          
          {/* Client Selection Section */}
          <div className="caja-panel-title" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiUser /> Datos del Cliente
            </span>
            {selectedClient && (
              <button 
                type="button" 
                onClick={() => setSelectedClient(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--erp-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}
              >
                <FiXCircle style={{ marginRight: '3px' }} /> Cambiar Cliente
              </button>
            )}
          </div>

          {!selectedClient ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="erp-input"
                  placeholder="Ingrese DNI del cliente..."
                  value={searchDni}
                  onChange={e => setSearchDni(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchClient()}
                />
                <button 
                  type="button" 
                  className="erp-btn erp-btn-primary" 
                  onClick={handleSearchClient}
                  disabled={searchingClient}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FiSearch /> {searchingClient ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {showClientForm && (
                <form onSubmit={handleCreateClient} className="fade-in" style={{ padding: '12px', border: '1px solid var(--erp-border)', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--erp-text-primary)' }}>Registrar Cliente Nuevo</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="erp-form-group">
                      <label className="erp-form-label" style={{ fontSize: '10px' }}>Nombres y Apellidos</label>
                      <input
                        type="text"
                        required
                        className="erp-input erp-input-sm"
                        value={clientForm.nombreApellido}
                        onChange={e => setClientForm(prev => ({ ...prev, nombreApellido: e.target.value }))}
                      />
                    </div>
                    <div className="erp-form-group">
                      <label className="erp-form-label" style={{ fontSize: '10px' }}>DNI</label>
                      <input
                        type="text"
                        required
                        className="erp-input erp-input-sm"
                        value={clientForm.dni}
                        disabled
                      />
                    </div>
                    <div className="erp-form-group">
                      <label className="erp-form-label" style={{ fontSize: '10px' }}>Teléfono (Opcional)</label>
                      <input
                        type="text"
                        className="erp-input erp-input-sm"
                        value={clientForm.telefono}
                        onChange={e => setClientForm(prev => ({ ...prev, telefono: e.target.value }))}
                      />
                    </div>
                    <div className="erp-form-group">
                      <label className="erp-form-label" style={{ fontSize: '10px' }}>Correo (Opcional)</label>
                      <input
                        type="email"
                        className="erp-input erp-input-sm"
                        value={clientForm.correo}
                        onChange={e => setClientForm(prev => ({ ...prev, correo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="erp-btn erp-btn-sm erp-btn-success" 
                    disabled={savingClient}
                    style={{ alignSelf: 'flex-end', marginTop: '4px' }}
                  >
                    {savingClient ? 'Guardando...' : 'Registrar y Seleccionar'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="fade-in" style={{ padding: '10px 12px', border: '1px solid #dcfce7', borderRadius: '6px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <FiCheckCircle style={{ color: '#16a34a', fontSize: '18px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d' }}>{selectedClient.nombreApellido}</div>
                <div style={{ fontSize: '11px', color: '#166534' }}>DNI: {selectedClient.dni} | Cel: {selectedClient.telefono || 'No registrado'}</div>
              </div>
            </div>
          )}

          {/* Product Grid Header & Search */}
          <div className="caja-panel-title" style={{ marginBottom: '8px' }}>
            <FiPlusCircle /> Selección de Artículos
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="erp-input"
                placeholder="Buscar por código, SKU o nombre de producto..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <FiSearch style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--erp-text-muted)' }} />
            </div>
            
            <select
              className="erp-input"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
              style={{ width: '160px' }}
            >
              <option value="todas">Todas las Categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Product Grid Area */}
          <div className="pos-products-scroller" style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--erp-text-muted)', fontSize: '13px' }}>Cargando catálogo de productos...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--erp-text-muted)', fontSize: '13px' }}>No se encontraron productos coincidentes</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {filteredProducts.map(p => (
                  <div 
                    key={p.id} 
                    className="pos-product-card"
                    style={{
                      border: '1px solid var(--erp-border)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <img 
                      src={resolveImageUrl(p.rutaImagen)} 
                      alt={p.nombre} 
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f8fafc' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--erp-text-muted)', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.codigo}
                    </span>
                    <strong style={{ fontSize: '12px', color: 'var(--erp-text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px', lineHeight: '17px' }}>
                      {p.nombre}
                    </strong>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--erp-accent)' }}>S/ {p.precioVenta.toFixed(2)}</span>
                      <button 
                        type="button" 
                        onClick={() => handleAddToCart(p)} 
                        className="erp-btn erp-btn-sm erp-btn-primary"
                        style={{ padding: '2px 8px', minWidth: 'auto', borderRadius: '4px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Cart & Checkout */}
        <div className="caja-panel-register" style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div className="caja-panel-title">
            <FiShoppingCart /> Carrito de Venta
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px', marginBottom: '10px', paddingRight: '4px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--erp-text-muted)', fontSize: '12px' }}>
                El carrito está vacío. Agrega productos desde el panel izquierdo.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cart.map(item => (
                  <div 
                    key={item.producto.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      border: '1px solid var(--erp-border)',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--erp-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.producto.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>
                        S/ {item.producto.precioVenta.toFixed(2)} c/u
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(item.producto.id, -1)}
                        style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <FiMinus size={10} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 700, width: '20px', textAlign: 'center' }}>
                        {item.cantidad}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(item.producto.id, 1)}
                        style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <FiPlus size={10} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFromCart(item.producto.id)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--erp-danger)', cursor: 'pointer', padding: '4px' }}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals Section */}
          <div style={{ borderTop: '1px solid var(--erp-border)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--erp-text-secondary)' }}>
              <span>Subtotal:</span>
              <span>S/ {totals.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--erp-text-secondary)' }}>
              <span>IGV (18%):</span>
              <span>S/ {totals.igv.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: 'var(--erp-text-primary)' }}>
              <span>Total General:</span>
              <span>S/ {totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Panel */}
          <div className="erp-form-group" style={{ marginBottom: '10px' }}>
            <label className="erp-form-label" style={{ fontSize: '11px' }}>Método de Pago</label>
            <div className="caja-methods-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  className={`caja-method-btn ${selectedMetodo === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMetodo(method.id)}
                  style={{
                    '--method-color': method.color,
                    '--method-bg': method.bg,
                    padding: '6px 2px',
                    borderRadius: '4px',
                    borderWidth: '1px',
                  } as React.CSSProperties}
                >
                  <span className="caja-method-icon" style={{ fontSize: '14px' }}>{method.icon}</span>
                  <span className="caja-method-label" style={{ fontSize: '10px' }}>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedMetodo !== 1 && (
            <div className="erp-form-group fade-in" style={{ marginBottom: '12px' }}>
              <label className="erp-form-label" style={{ fontSize: '11px' }}>Código de Operación / Referencia</label>
              <input
                type="text"
                required
                className="erp-input erp-input-sm"
                placeholder="Ej: OP-987654"
                value={codigoOperacion}
                onChange={e => setCodigoOperacion(e.target.value)}
              />
            </div>
          )}

          <button
            type="button"
            className="caja-submit-btn"
            onClick={handleProcessSale}
            disabled={processing || cart.length === 0 || !selectedClient}
            style={{ width: '100%', marginTop: 'auto' }}
          >
            {processing ? 'Procesando...' : `Registrar Venta (S/ ${totals.total.toFixed(2)})`}
          </button>

        </div>

      </div>

      {/* SESSIONS / HISTORY PANEL */}
      <div className="caja-panel-history" style={{ marginTop: '10px', minHeight: '180px' }}>
        <div className="caja-panel-title">Transacciones del Turno (Hoy)</div>
        <div className="caja-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {ventasLoading ? (
            <div className="caja-history-empty">Cargando transacciones...</div>
          ) : turnoVentas.length === 0 ? (
            <div className="caja-history-empty">No hay transacciones registradas hoy</div>
          ) : (
            turnoVentas.map(s => (
              <div key={s.id} className="caja-history-row" style={{ padding: '6px 10px' }}>
                <div className="caja-row-info">
                  <span className="caja-row-code">Boleta #{s.id}</span>
                  <span className="caja-row-client">Cliente: {s.cliente} | Vendedor: {s.vendedor}</span>
                  <span className="caja-row-time">{formatDate(s.fecha)}</span>
                </div>
                <div className="caja-row-right">
                  <span className="caja-row-amount">S/ {s.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default CajaSection;
