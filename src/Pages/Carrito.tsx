import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import '../Styles/Pages/Carrito.css';

const Carrito = () => {
  const { carrito, removerDelCarrito, subtotal, igv, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      alert('Debes iniciar sesión para continuar con el pago.');
      navigate('/login');
    }
  };

  return (
    <div className="carrito-page container">
      <div className="checkout-stepper">
        <div className="step active">
          <div className="step-icon">1</div>
          <span>Carrito</span>
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="step-icon">2</div>
          <span>Entrega</span>
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="step-icon">3</div>
          <span>Confirmación</span>
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="step-icon"><FaCheckCircle /></div>
          <span>Enviado</span>
        </div>
      </div>

      <h1>Tu Carrito de Compras</h1>

      
      {!isAuthenticated && (
        <div className="login-warning">
          <p><strong>Inicia sesión</strong> para guardar y gestionar tus productos, y proceder con el pago.</p>
        </div>
      )}

      {carrito.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío.</p>
          <button className="btn btn-primary" onClick={() => navigate('/catalogo')}>
            Ir al catálogo
          </button>
        </div>
      ) : (
        <div className="carrito-content">
          <div className="carrito-items">
            {carrito.map(item => (
              <div key={item.producto.id} className="carrito-item">
                <div className="item-imagen">
                  <img src={item.producto.imagenUrl} alt={item.producto.nombre} />
                  {/* Vista previa grande al hacer hover (implementado en CSS) */}
                  <div className="imagen-preview">
                    <img src={item.producto.imagenUrl} alt={item.producto.nombre} />
                  </div>
                </div>
                <div className="item-info">
                  <h3>{item.producto.nombre}</h3>
                  <p className="item-precio">S/ {item.precioUnitario.toFixed(2)} c/u</p>
                </div>
                <div className="item-cantidad">
                  <p>Cant: {item.cantidad}</p>
                </div>
                <div className="item-subtotal">
                  <p>S/ {item.subtotal.toFixed(2)}</p>
                </div>
                <button 
                  className="btn-remove" 
                  onClick={() => removerDelCarrito(item.producto.id)}
                  title="Eliminar producto"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="carrito-resumen">
            <h3>Resumen de la orden</h3>
            <div className="resumen-fila">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="resumen-fila">
              <span>IGV (18%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="resumen-total">
              <span>Total:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
              Proceder al Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
