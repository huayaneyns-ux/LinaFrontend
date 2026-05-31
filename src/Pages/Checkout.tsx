import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { FaWhatsapp, FaStore, FaHome, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import '../Styles/Pages/Checkout.css';

const Checkout = () => {
  const { carrito, total, limpiarCarrito } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  
  const [pasoActivo, setPasoActivo] = useState(2);
  const [tipoEntrega, setTipoEntrega] = useState<'RECOJO_TIENDA' | 'ENVIO_DOMICILIO'>('RECOJO_TIENDA');
  const [codigoPedido, setCodigoPedido] = useState('');

  // Si el carrito está vacío y no estamos en el paso final, sacarlo de aquí.
  useEffect(() => {
    if (carrito.length === 0 && pasoActivo !== 4) {
      navigate('/carrito');
    }
  }, [carrito, navigate, pasoActivo]);

  const handleSiguiente = () => {
    if (pasoActivo === 2) setPasoActivo(3);
  };

  const handleGenerarPedido = () => {
    // Generar un código aleatorio simple
    const nuevoCodigo = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setCodigoPedido(nuevoCodigo);
    setPasoActivo(4);
  };

  const handleWhatsApp = () => {
    const mensaje = `Voy a realizar el pago de mi pedido con codigo ${codigoPedido}.`;
    const url = `https://wa.me/51999999999?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    limpiarCarrito();
  };

  return (
    <div className="checkout-page container">
      <div className="checkout-stepper">
        <div className="step active" onClick={() => navigate('/carrito')} style={{cursor: 'pointer'}}>
          <div className="step-icon">1</div>
          <span>Carrito</span>
        </div>
        <div className="step-line active"></div>
        <div className={`step ${pasoActivo >= 2 ? 'active' : ''}`}>
          <div className="step-icon">2</div>
          <span>Entrega</span>
        </div>
        <div className={`step-line ${pasoActivo >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${pasoActivo >= 3 ? 'active' : ''}`}>
          <div className="step-icon">3</div>
          <span>Confirmación</span>
        </div>
        <div className={`step-line ${pasoActivo >= 4 ? 'active' : ''}`}></div>
        <div className={`step ${pasoActivo >= 4 ? 'active' : ''}`}>
          <div className="step-icon"><FaCheckCircle /></div>
          <span>Enviado</span>
        </div>
      </div>

      <div className="checkout-content">
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
                <p>Costo adicional según la zona. Recibe tus productos en la comodidad de tu hogar.</p>
              </div>
            </div>
            
            {tipoEntrega === 'ENVIO_DOMICILIO' && (
              <div className="direccion-form">
                <h3>Dirección de Envío</h3>
                <p>Se usará la dirección predeterminada de tu perfil: <strong>{usuario?.nombres}</strong></p>
                <input type="text" placeholder="Ej: Av. Principal 123" defaultValue="Av. Central 456, Lima" className="input-direccion" />
              </div>
            )}

            <div className="checkout-acciones">
              <button className="btn btn-outline" onClick={() => navigate('/carrito')}>Volver al Carrito</button>
              <button className="btn btn-primary" onClick={handleSiguiente}>Continuar a Confirmación</button>
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMACION */}
        {pasoActivo === 3 && (
          <div className="checkout-panel fade-in">
            <h2>Revisar y Confirmar Pedido</h2>
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
                <h3>Detalles</h3>
                <p><strong>Tipo de Entrega:</strong> {tipoEntrega === 'RECOJO_TIENDA' ? 'Recojo en Local' : 'Envío a Domicilio'}</p>
                <div className="total-final">
                  <span>Total a Pagar:</span>
                  <span className="total-monto">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-acciones">
              <button className="btn btn-outline" onClick={() => setPasoActivo(2)}>Regresar</button>
              <button className="btn btn-primary" onClick={handleGenerarPedido}>Confirmar y Generar Pedido</button>
            </div>
          </div>
        )}

        {/* PASO 4: EXITO Y PAGO */}
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
              <p>Monto Total a Pagar: <strong>S/ {total.toFixed(2)}</strong></p>
              
              <div className="info-box" style={{textAlign: 'center', marginTop: '20px'}}>
                <p>Por favor, haz clic en el siguiente botón para enviarnos el comprobante de pago vía WhatsApp y finalizar tu orden.</p>
              </div>

              <button className="btn-whatsapp-pago" onClick={handleWhatsApp}>
                <FaWhatsapp size={24} /> Enviar pago/foto
              </button>
            </div>

            <button className="btn btn-outline" style={{ marginTop: '30px' }} onClick={() => navigate('/mis-pedidos')}>
              Ir a Mis Pedidos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
