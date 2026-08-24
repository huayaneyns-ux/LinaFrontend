import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { FaStore, FaHome, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { FiUpload, FiCheck, FiX, FiPlus, FiMapPin, FiStar } from 'react-icons/fi';
import { PedidoService } from '../Services/Admin/Ventas/Pedido';
import { MetodoPagoService } from '../Services/Admin/Ventas/MetodoPago';
import { LugaresService } from '../Services/Admin/Ventas/Lugares';
import { ImagenService } from '../Services/ImagenService';
import type { MetodoPagoSelectDto } from '../Types/Admin/Ventas/MetodoPago';
import type {
  DireccionDto,
  DepartamentoDto,
  ProvinciaDto,
  DistritoDto,
} from '../Types/Admin/Ventas/Lugares';
import { resolveImageUrl } from '../Utils/imageUtils';
import '../Styles/Pages/Checkout.css';

const CHECKOUT_KEY = 'checkoutLina';

type TipoEntrega = 'RECOJO_TIENDA' | 'ENVIO_DOMICILIO';

interface CheckoutDraft {
  pasoActivo: number;
  tipoEntrega: TipoEntrega;
  idDireccion: number;
  idMetodoPago: number;
  codigoOperacion: string;
  comprobantePath: string;
  comprobantePreview: string | null;
}

const loadDraft = (): Partial<CheckoutDraft> => {
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDraft = (draft: CheckoutDraft) => {
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(draft));
};

const clearDraft = () => localStorage.removeItem(CHECKOUT_KEY);

const Checkout = () => {
  const { carrito, total, igv, subtotal, limpiarCarrito } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const draft = useMemo(() => loadDraft(), []);

  const [pasoActivo, setPasoActivo] = useState(draft.pasoActivo && draft.pasoActivo >= 2 ? draft.pasoActivo : 2);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(draft.tipoEntrega || 'RECOJO_TIENDA');
  const [codigoPedido, setCodigoPedido] = useState('');
  const [montoConfirmado, setMontoConfirmado] = useState(0);

  const [metodosPago, setMetodosPago] = useState<MetodoPagoSelectDto[]>([]);
  const [idMetodoPago, setIdMetodoPago] = useState(draft.idMetodoPago || 0);
  const [codigoOperacion, setCodigoOperacion] = useState(draft.codigoOperacion || '');

  const [comprobantePreview, setComprobantePreview] = useState<string | null>(draft.comprobantePreview || null);
  const [comprobantePath, setComprobantePath] = useState(draft.comprobantePath || '');
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [direcciones, setDirecciones] = useState<DireccionDto[]>([]);
  const [idDireccion, setIdDireccion] = useState(draft.idDireccion || 0);
  const [loadingDir, setLoadingDir] = useState(false);
  const [showFormDir, setShowFormDir] = useState(false);

  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([]);
  const [provincias, setProvincias] = useState<ProvinciaDto[]>([]);
  const [distritos, setDistritos] = useState<DistritoDto[]>([]);
  const [idDepartamento, setIdDepartamento] = useState(0);
  const [idProvincia, setIdProvincia] = useState(0);
  const [idDistrito, setIdDistrito] = useState(0);
  const [nombreDireccion, setNombreDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [esPrincipalNueva, setEsPrincipalNueva] = useState(false);
  const [guardandoDir, setGuardandoDir] = useState(false);

  const [registrando, setRegistrando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const idUsuario = useMemo(() => {
    if (!usuario?.id) return 1;
    if (typeof usuario.id === 'number') return usuario.id;
    const parsed = parseInt(String(usuario.id).replace(/\D/g, ''), 10);
    return isNaN(parsed) || parsed === 0 ? 1 : parsed;
  }, [usuario]);

  // Persistir progreso (sobre todo paso de comprobante)
  useEffect(() => {
    if (pasoActivo === 4) return;
    saveDraft({
      pasoActivo,
      tipoEntrega,
      idDireccion,
      idMetodoPago,
      codigoOperacion,
      comprobantePath,
      comprobantePreview,
    });
  }, [pasoActivo, tipoEntrega, idDireccion, idMetodoPago, codigoOperacion, comprobantePath, comprobantePreview]);

  useEffect(() => {
    if (carrito.length === 0 && pasoActivo !== 4) {
      navigate('/carrito');
    }
  }, [carrito, navigate, pasoActivo]);

  useEffect(() => {
    MetodoPagoService.getMetodosPago()
      .then(data => {
        const activos = data.filter(m => m.estado);
        setMetodosPago(activos);
        if (!idMetodoPago && activos.length > 0) setIdMetodoPago(activos[0].id);
      })
      .catch(() => {
        const fallback: MetodoPagoSelectDto[] = [
          { id: 1, nombre: 'Efectivo', estado: true },
          { id: 2, nombre: 'Yape', estado: true },
          { id: 3, nombre: 'Plin', estado: true },
          { id: 4, nombre: 'Transferencia', estado: true },
        ];
        setMetodosPago(fallback);
        if (!idMetodoPago) setIdMetodoPago(1);
      });
  }, []);

  const loadDirecciones = useCallback(async () => {
    if (!idUsuario || isNaN(idUsuario)) return;
    setLoadingDir(true);
    try {
      const list = await LugaresService.getDireccionesUsuario(idUsuario);
      const dirs = Array.isArray(list) ? list : [];
      setDirecciones(dirs);
      const principal = dirs.find(d => d.esPrincipal);
      setIdDireccion(prev => {
        if (prev && dirs.some(d => d.id === prev)) return prev;
        return principal?.id || dirs[0]?.id || 0;
      });
      if (dirs.length === 0) setShowFormDir(true);
    } catch {
      setDirecciones([]);
    } finally {
      setLoadingDir(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    if (tipoEntrega === 'ENVIO_DOMICILIO') {
      loadDirecciones();
      LugaresService.getDepartamentos()
        .then(d => setDepartamentos(Array.isArray(d) ? d : []))
        .catch(() => setDepartamentos([]));
    }
  }, [tipoEntrega, loadDirecciones]);

  useEffect(() => {
    if (!idDepartamento) {
      setProvincias([]);
      setIdProvincia(0);
      return;
    }
    LugaresService.getProvincias(idDepartamento)
      .then(p => setProvincias(Array.isArray(p) ? p : []))
      .catch(() => setProvincias([]));
    setIdProvincia(0);
    setIdDistrito(0);
  }, [idDepartamento]);

  useEffect(() => {
    if (!idProvincia) {
      setDistritos([]);
      setIdDistrito(0);
      return;
    }
    LugaresService.getDistritos(idProvincia)
      .then(d => setDistritos(Array.isArray(d) ? d : []))
      .catch(() => setDistritos([]));
    setIdDistrito(0);
  }, [idProvincia]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprobantePreview(URL.createObjectURL(file));
    setErrorMsg(null);
    setSubiendoComprobante(true);
    try {
      const res = await ImagenService.subirImagen(file);
      setComprobantePath(res.rutaImagen || '');
      if (!res.rutaImagen) {
        setErrorMsg('No se obtuvo la URL del comprobante.');
        setComprobantePreview(null);
      }
    } catch {
      setErrorMsg('Error al subir el comprobante. Intente nuevamente.');
      setComprobantePreview(null);
      setComprobantePath('');
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const handleSiguienteEntrega = () => {
    setErrorMsg(null);
    if (tipoEntrega === 'ENVIO_DOMICILIO' && !idDireccion) {
      setErrorMsg('Seleccione o registre una dirección de entrega.');
      return;
    }
    setPasoActivo(3);
  };

  const handleCrearDireccion = async () => {
    if (!idUsuario || isNaN(idUsuario)) {
      setErrorMsg('Debe iniciar sesión para registrar una dirección.');
      return;
    }
    if (!nombreDireccion.trim() || !idDistrito) {
      setErrorMsg('Complete la dirección y seleccione departamento, provincia y distrito.');
      return;
    }
    setGuardandoDir(true);
    setErrorMsg(null);
    try {
      const res = await LugaresService.createDireccion({
        idUsuario,
        nombreDireccion: nombreDireccion.trim(),
        referencia: referencia.trim(),
        idDistrito,
        esPrincipal: esPrincipalNueva || direcciones.length === 0,
      });
      if (res?.success === false) {
        setErrorMsg(res.mensaje || 'No se pudo guardar la dirección.');
        return;
      }
      setNombreDireccion('');
      setReferencia('');
      setEsPrincipalNueva(false);
      setIdDepartamento(0);
      setShowFormDir(false);
      await loadDirecciones();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al crear la dirección');
    } finally {
      setGuardandoDir(false);
    }
  };

  const handleSetPrincipal = async (id: number) => {
    if (!idUsuario || isNaN(idUsuario)) return;
    setErrorMsg(null);
    try {
      await LugaresService.cambiarDireccionPrincipal({ idUsuario, idDireccion: id });
      setIdDireccion(id);
      await loadDirecciones();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo marcar como principal');
    }
  };

  const handleRegistrarPedido = async () => {
    if (!idMetodoPago) {
      setErrorMsg('Selecciona un método de pago.');
      return;
    }
    if (!comprobantePath) {
      setErrorMsg('Sube el comprobante de pago antes de confirmar.');
      return;
    }
    if (tipoEntrega === 'ENVIO_DOMICILIO' && !idDireccion) {
      setErrorMsg('Seleccione una dirección de entrega.');
      return;
    }
    if (!idUsuario || isNaN(idUsuario)) {
      setErrorMsg('Sesión inválida. Vuelva a iniciar sesión.');
      return;
    }

    setRegistrando(true);
    setErrorMsg(null);
    try {
      const response = await PedidoService.createPedido({
        idCliente: idUsuario,
        idDireccion: tipoEntrega === 'ENVIO_DOMICILIO' ? idDireccion : 0,
        fechaPedido: new Date().toISOString(),
        tipoEntrega,
        igv: Number(igv.toFixed(4)),
        idMetodoPago,
        monto: total,
        codigoOperacion: codigoOperacion.trim() || null,
        rutaComprobante: comprobantePath,
        detalle: carrito.map(item => ({
          idProducto: item.producto.id,
          cantidad: item.cantidad,
        })),
      });

      const idPed = response?.idPedido || 0;
      setCodigoPedido(idPed ? `PED-${idPed}` : `PED-${Date.now()}`);
      setMontoConfirmado(total);
      clearDraft();
      limpiarCarrito();
      setPasoActivo(4);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar el pedido.');
    } finally {
      setRegistrando(false);
    }
  };

  const comprobanteUrl = comprobantePath ? resolveImageUrl(comprobantePath) : null;

  return (
    <div className="checkout-page container">
      <div className="checkout-stepper">
        <div className="step active" onClick={() => navigate('/carrito')} style={{ cursor: 'pointer' }}>
          <div className="step-icon">1</div>
          <span>Carrito</span>
        </div>
        <div className="step-line active" />
        <div className={`step ${pasoActivo >= 2 ? 'active' : ''}`}>
          <div className="step-icon">2</div>
          <span>Entrega</span>
        </div>
        <div className={`step-line ${pasoActivo >= 3 ? 'active' : ''}`} />
        <div className={`step ${pasoActivo >= 3 ? 'active' : ''}`}>
          <div className="step-icon">3</div>
          <span>Pago</span>
        </div>
        <div className={`step-line ${pasoActivo >= 4 ? 'active' : ''}`} />
        <div className={`step ${pasoActivo >= 4 ? 'active' : ''}`}>
          <div className="step-icon"><FaCheckCircle /></div>
          <span>Enviado</span>
        </div>
      </div>

      <div className="checkout-content">
        {errorMsg && pasoActivo !== 4 && (
          <div className="checkout-error">
            <FiX size={16} /> {errorMsg}
          </div>
        )}

        {/* PASO 2: ENTREGA */}
        {pasoActivo === 2 && (
          <div className="checkout-panel fade-in">
            <h2>Selecciona el tipo de entrega</h2>
            <div className="entrega-opciones">
              <div
                className={`entrega-opcion ${tipoEntrega === 'RECOJO_TIENDA' ? 'selected' : ''}`}
                onClick={() => setTipoEntrega('RECOJO_TIENDA')}
              >
                <FaStore size={40} />
                <h3>Recojo en Tienda</h3>
                <p>Gratis. Acércate a nuestro local a recoger tus productos una vez confirmados.</p>
              </div>
              <div
                className={`entrega-opcion ${tipoEntrega === 'ENVIO_DOMICILIO' ? 'selected' : ''}`}
                onClick={() => setTipoEntrega('ENVIO_DOMICILIO')}
              >
                <FaHome size={40} />
                <h3>Envío a Domicilio</h3>
                <p>Recibe tus productos en la dirección que elijas.</p>
              </div>
            </div>

            {tipoEntrega === 'ENVIO_DOMICILIO' && (
              <div className="direcciones-block">
                <div className="direcciones-head">
                  <h3><FiMapPin /> Dirección de entrega</h3>
                  <button type="button" className="btn btn-outline btn-sm-dir" onClick={() => setShowFormDir(v => !v)}>
                    <FiPlus /> {showFormDir ? 'Ocultar formulario' : 'Nueva dirección'}
                  </button>
                </div>

                {loadingDir ? (
                  <p className="dir-hint">Cargando direcciones...</p>
                ) : direcciones.length === 0 && !showFormDir ? (
                  <p className="dir-hint">No tienes direcciones registradas. Agrega una para continuar.</p>
                ) : (
                  <div className="direcciones-list">
                    {direcciones.map(d => (
                      <label key={d.id} className={`direccion-card ${idDireccion === d.id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="direccion"
                          checked={idDireccion === d.id}
                          onChange={() => setIdDireccion(d.id)}
                        />
                        <div className="direccion-card-body">
                          <strong>
                            {d.nombreDireccion}
                            {d.esPrincipal && <span className="badge-principal"><FiStar /> Principal</span>}
                          </strong>
                          <span>{d.distrito}, {d.provincia}, {d.departamento}</span>
                          {d.referencia && <em>Ref: {d.referencia}</em>}
                        </div>
                        {!d.esPrincipal && (
                          <button
                            type="button"
                            className="btn-set-principal"
                            onClick={e => { e.preventDefault(); handleSetPrincipal(d.id); }}
                            title="Marcar como principal"
                          >
                            Hacer principal
                          </button>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {showFormDir && (
                  <div className="direccion-form">
                    <h4>Registrar nueva dirección</h4>
                    <div className="dir-form-grid">
                      <select className="input-campo" value={idDepartamento} onChange={e => setIdDepartamento(Number(e.target.value))}>
                        <option value={0}>1. Seleccione Departamento *</option>
                        {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                      </select>

                      <select className="input-campo" value={idProvincia} onChange={e => setIdProvincia(Number(e.target.value))} disabled={!idDepartamento}>
                        <option value={0}>2. Seleccione Provincia *</option>
                        {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>

                      <select className="input-campo" value={idDistrito} onChange={e => setIdDistrito(Number(e.target.value))} disabled={!idProvincia}>
                        <option value={0}>3. Seleccione Distrito *</option>
                        {distritos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                      </select>

                      <input
                        className="input-campo"
                        placeholder="4. Calle / Av. / Número de Casa *"
                        value={nombreDireccion}
                        onChange={e => setNombreDireccion(e.target.value)}
                      />

                      <input
                        className="input-campo"
                        placeholder="5. Referencia (opcional)"
                        value={referencia}
                        onChange={e => setReferencia(e.target.value)}
                      />

                      <label className="check-principal">
                        <input type="checkbox" checked={esPrincipalNueva} onChange={e => setEsPrincipalNueva(e.target.checked)} />
                        Marcar como dirección principal
                      </label>
                    </div>
                    <button type="button" className="btn btn-primary" disabled={guardandoDir} onClick={handleCrearDireccion}>
                      {guardandoDir ? 'Guardando...' : 'Guardar dirección'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="checkout-acciones">
              <button className="btn btn-outline" onClick={() => navigate('/carrito')}>Volver al Carrito</button>
              <button className="btn btn-primary" onClick={handleSiguienteEntrega}>Continuar al Pago</button>
            </div>
          </div>
        )}

        {/* PASO 3: PAGO */}
        {pasoActivo === 3 && (
          <div className="checkout-panel fade-in">
            <h2>Confirmar Pedido y Registrar Pago</h2>

            <div className="confirmacion-grid">
              <div className="confirmacion-lista">
                <h3><FaClipboardList /> Resumen de Productos</h3>
                <ul className="lista-mini-productos">
                  {carrito.map(item => (
                    <li key={item.producto.id}>
                      <span>{item.cantidad}x {item.producto.nombre}</span>
                      <span>S/ {item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="confirmacion-totales">
                <h3>Totales</h3>
                <p><strong>Entrega:</strong> {tipoEntrega === 'RECOJO_TIENDA' ? 'Recojo en Local' : 'Envío a Domicilio'}</p>
                {tipoEntrega === 'ENVIO_DOMICILIO' && (
                  <p><strong>Dirección:</strong> {direcciones.find(d => d.id === idDireccion)?.nombreDireccion || '—'}</p>
                )}
                <p><strong>Subtotal:</strong> S/ {subtotal.toFixed(2)}</p>
                <p><strong>IGV (18%):</strong> S/ {igv.toFixed(2)}</p>
                <div className="total-final">
                  <span>Total a Pagar:</span>
                  <span className="total-monto">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pago-form">
              <h3>Datos de Pago</h3>
              <div className="pago-form-grid">
                <div className="form-group">
                  <label>Método de Pago</label>
                  <select value={idMetodoPago} onChange={e => setIdMetodoPago(Number(e.target.value))} className="input-campo">
                    {metodosPago.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Código de Operación <span className="optional">(opcional)</span></label>
                  <input
                    type="text"
                    className="input-campo"
                    value={codigoOperacion}
                    onChange={e => setCodigoOperacion(e.target.value)}
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>

              <div className="comprobante-upload-area">
                <label className="comprobante-label">
                  Comprobante de Pago <span className="required">*</span>
                </label>
                <div
                  className={`upload-dropzone ${comprobantePath ? 'uploaded' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {subiendoComprobante ? (
                    <p className="uploading-text">Subiendo imagen...</p>
                  ) : (comprobantePreview || comprobanteUrl) ? (
                    <div className="preview-container">
                      <img src={comprobantePreview || comprobanteUrl || ''} alt="Comprobante" className="preview-img" />
                      {comprobantePath && (
                        <div className="upload-success">
                          <FiCheck size={16} /> Comprobante cargado
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FiUpload size={32} />
                      <p>Haz clic para subir tu comprobante de pago</p>
                      <span>JPG o PNG</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="checkout-acciones">
              <button className="btn btn-outline" onClick={() => setPasoActivo(2)}>Regresar</button>
              <button
                className="btn btn-primary"
                onClick={handleRegistrarPedido}
                disabled={registrando || subiendoComprobante || !comprobantePath}
              >
                {registrando ? 'Registrando...' : 'Confirmar y Registrar Pedido'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: ÉXITO */}
        {pasoActivo === 4 && (
          <div className="checkout-panel exito-panel fade-in">
            <div className="exito-icon"><FaCheckCircle /></div>
            <h2>¡Tu pedido fue registrado correctamente!</h2>
            <div className="codigo-pedido-box">
              <p>Código de Pedido</p>
              <h3>{codigoPedido}</h3>
              <p style={{ marginTop: '10px' }}>Fecha: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="instrucciones-pago">
              <h4>Estado: <span className="estado-pendiente">Pendiente de Revisión</span></h4>
              <p>Monto Total: <strong>S/ {montoConfirmado.toFixed(2)}</strong></p>
              <div className="info-box" style={{ textAlign: 'center', marginTop: '16px' }}>
                <p>Tu comprobante fue enviado. Revisaremos el pago y actualizaremos el estado de tu pedido.</p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/catalogo')}>
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
