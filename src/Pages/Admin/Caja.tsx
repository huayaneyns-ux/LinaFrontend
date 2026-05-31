import { useState } from 'react';
import { FiSearch, FiPlus, FiCheck } from 'react-icons/fi';
import { mockProductos } from '../../Constantes/Data/MockData';
import type { Producto } from '../../Types/Producto';
import type { DetallePedido } from '../../Types/Pedido';
import './Caja.css';

const Caja = () => {
  const [pasoActual, setPasoActual] = useState(1);
  const [dniCliente, setDniCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  
  // Productos Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroProducto, setFiltroProducto] = useState('');
  
  // Venta actual
  const [itemsVenta, setItemsVenta] = useState<DetallePedido[]>([]);
  
  // Pagos combinados
  const [pagos, setPagos] = useState<{ metodo: string, monto: number }[]>([
    { metodo: 'Efectivo', monto: 0 },
    { metodo: 'Tarjeta', monto: 0 },
    { metodo: 'Yape/Plin', monto: 0 }
  ]);

  const subtotal = itemsVenta.reduce((acc, item) => acc + item.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  const totalPagado = pagos.reduce((acc, p) => acc + p.monto, 0);

  const buscarCliente = () => {
    if (dniCliente.length >= 8) {
      setClienteEncontrado(true);
      setPasoActual(2);
    } else {
      alert("Ingrese un DNI válido");
    }
  };

  const agregarProducto = (producto: Producto) => {
    setItemsVenta(prev => {
      const existe = prev.find(p => p.producto.id === producto.id);
      if (existe) {
        return prev.map(p => 
          p.producto.id === producto.id 
          ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precioUnitario }
          : p
        );
      }
      return [...prev, { producto, cantidad: 1, precioUnitario: producto.precio, subtotal: producto.precio }];
    });
    setMostrarModal(false);
    setFiltroProducto('');
  };

  const actualizarPago = (metodo: string, valor: string) => {
    const numValor = parseFloat(valor) || 0;
    setPagos(prev => prev.map(p => p.metodo === metodo ? { ...p, monto: numValor } : p));
  };

  const confirmarVenta = () => {
    if (totalPagado < total) {
      alert("El monto pagado no cubre el total de la venta.");
      return;
    }
    alert("¡Venta confirmada exitosamente!");
    // Resetear
    setPasoActual(1);
    setDniCliente('');
    setClienteEncontrado(false);
    setItemsVenta([]);
    setPagos([{ metodo: 'Efectivo', monto: 0 }, { metodo: 'Tarjeta', monto: 0 }, { metodo: 'Yape/Plin', monto: 0 }]);
  };

  const productosFiltrados = mockProductos.filter(p => 
    p.nombre.toLowerCase().includes(filtroProducto.toLowerCase()) || 
    p.codigo.toLowerCase().includes(filtroProducto.toLowerCase())
  );

  return (
    <div className="caja-container">
      <header className="caja-header">
        <h1>Módulo de Caja</h1>
        <div className="pasos-caja">
          <div className={`paso ${pasoActual >= 1 ? 'activo' : ''}`}>1. Cliente</div>
          <div className={`paso ${pasoActual >= 2 ? 'activo' : ''}`}>2. Productos</div>
          <div className={`paso ${pasoActual >= 3 ? 'activo' : ''}`}>3. Pago</div>
        </div>
      </header>

      <div className="caja-body">
        {/* PASO 1: CLIENTE */}
        {pasoActual === 1 && (
          <div className="caja-panel">
            <h2>Identificar Cliente</h2>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Ingrese DNI del cliente..." 
                value={dniCliente}
                onChange={e => setDniCliente(e.target.value)}
              />
              <button className="btn btn-primary" onClick={buscarCliente}>
                <FiSearch /> Buscar
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: PRODUCTOS */}
        {pasoActual === 2 && (
          <div className="caja-panel">
            <div className="panel-header">
              <h2>Detalle de Venta {clienteEncontrado && `(Cliente DNI: ${dniCliente})`}</h2>
              <button className="btn btn-outline" onClick={() => setMostrarModal(true)}>
                <FiPlus /> Buscar Producto
              </button>
            </div>

            <table className="tabla-caja">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio U.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsVenta.length === 0 ? (
                  <tr><td colSpan={5} className="empty-row">No hay productos agregados</td></tr>
                ) : (
                  itemsVenta.map(item => (
                    <tr key={item.producto.id}>
                      <td>{item.producto.codigo}</td>
                      <td>{item.producto.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>S/ {item.precioUnitario.toFixed(2)}</td>
                      <td>S/ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="totales-caja">
              <p>Subtotal: <span>S/ {subtotal.toFixed(2)}</span></p>
              <p>IGV: <span>S/ {igv.toFixed(2)}</span></p>
              <h3>Total: <span>S/ {total.toFixed(2)}</span></h3>
              
              <button 
                className="btn btn-primary btn-next" 
                disabled={itemsVenta.length === 0}
                onClick={() => setPasoActual(3)}
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: PAGO COMBINADO */}
        {pasoActual === 3 && (
          <div className="caja-panel">
            <h2>Pago Combinado</h2>
            <p className="monto-a-pagar">Monto Total a Pagar: <strong>S/ {total.toFixed(2)}</strong></p>
            
            <div className="pagos-grid">
              {pagos.map(p => (
                <div key={p.metodo} className="pago-input">
                  <label>{p.metodo}</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.10"
                    placeholder="S/ 0.00"
                    value={p.monto || ''}
                    onChange={(e) => actualizarPago(p.metodo, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="resumen-pago">
              <p>Total Pagado: <span>S/ {totalPagado.toFixed(2)}</span></p>
              <p className={totalPagado >= total ? 'ok' : 'faltante'}>
                Faltante: <span>S/ {Math.max(0, total - totalPagado).toFixed(2)}</span>
              </p>
              <p className="vuelto">
                Vuelto: <span>S/ {Math.max(0, totalPagado - total).toFixed(2)}</span>
              </p>
            </div>

            <div className="caja-acciones">
              <button className="btn btn-outline" onClick={() => setPasoActual(2)}>Volver</button>
              <button 
                className="btn btn-primary" 
                onClick={confirmarVenta}
                disabled={totalPagado < total}
              >
                <FiCheck /> Confirmar Venta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Buscador Productos */}
      {mostrarModal && (
        <div className="caja-modal-overlay">
          <div className="caja-modal">
            <div className="caja-modal-header">
              <h3>Buscar Producto</h3>
              <button className="close-btn" onClick={() => setMostrarModal(false)}>&times;</button>
            </div>
            <div className="caja-modal-body">
              <input 
                type="text" 
                className="modal-search" 
                placeholder="Buscar por código o nombre..." 
                value={filtroProducto}
                onChange={e => setFiltroProducto(e.target.value)}
                autoFocus
              />
              <div className="modal-results">
                {productosFiltrados.map(p => (
                  <div key={p.id} className="result-item" onClick={() => agregarProducto(p)}>
                    <div>
                      <span className="result-cod">{p.codigo}</span>
                      <span className="result-name">{p.nombre}</span>
                    </div>
                    <span className="result-price">S/ {p.precio.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;
