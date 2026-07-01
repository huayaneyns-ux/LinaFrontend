import { useState, useMemo } from 'react';
import { mockVentas } from '../../../../Constantes/Data/MockData';
import { formatDate } from '../../../../Utils/formatters';
import { FiDollarSign, FiSmartphone, FiCreditCard, FiTrendingUp, FiUnlock, FiLock, FiPlusCircle } from 'react-icons/fi';
import './CajaSection.css';

interface PagoRegistro {
  metodo: string;
  monto: number;
  referencia: string;
  cliente: string;
  comentario: string;
}

const CajaSection = () => {
  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [salesHistory, setSalesHistory] = useState(mockVentas);

  // New Transaction Form State
  const [monto, setMonto] = useState('');
  const [selectedMetodo, setSelectedMetodo] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [cliente, setCliente] = useState('');
  const [comentario, setComentario] = useState('');

  // Daily totals based on payment methods
  const stats = useMemo(() => {
    let efectivo = 350.00; // base cash amount
    let yape = 0;
    let plin = 0;
    let tarjeta = 0;
    let banco = 0;

    salesHistory.forEach(s => {
      const met = s.metodoPago.toUpperCase();
      const val = s.total;
      if (met === 'EFECTIVO') efectivo += val;
      else if (met === 'YAPE') yape += val;
      else if (met === 'PLIN') plin += val;
      else if (met === 'VISA' || met === 'MASTERCARD') tarjeta += val;
      else banco += val;
    });

    const totalCaja = efectivo + yape + plin + tarjeta + banco;
    return { efectivo, yape, plin, tarjeta, banco, totalCaja };
  }, [salesHistory]);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    const newSale = {
      id: 'V-' + (salesHistory.length + 1001),
      codigo: 'VT-' + (salesHistory.length + 1).toString().padStart(3, '0'),
      cliente: cliente || 'Cliente General',
      fecha: new Date().toISOString(),
      metodoPago: selectedMetodo,
      total: Number(monto),
      estado: 'ACTIVO',
    };

    setSalesHistory(prev => [newSale, ...prev]);

    // Reset Form
    setMonto('');
    setReferencia('');
    setCliente('');
    setComentario('');
  };

  const paymentMethods = [
    { id: 'EFECTIVO', label: 'Efectivo', color: '#16a34a', bg: '#dcfce7', icon: <FiDollarSign /> },
    { id: 'YAPE', label: 'Yape', color: '#7c3aed', bg: '#f3e8ff', icon: <FiSmartphone /> },
    { id: 'PLIN', label: 'Plin', color: '#06b6d4', bg: '#ecfeff', icon: <FiSmartphone /> },
    { id: 'VISA', label: 'Visa', color: '#2563eb', bg: '#dbeafe', icon: <FiCreditCard /> },
    { id: 'MASTERCARD', label: 'Mastercard', color: '#ea580c', bg: '#ffedd5', icon: <FiCreditCard /> },
    { id: 'TRANSFERENCIA', label: 'Transferencia', color: '#0284c7', bg: '#e0f2fe', icon: <FiTrendingUp /> },
  ];

  return (
    <div className="caja-container">
      {/* Upper info cards */}
      <div className="caja-top-grid">
        <div className="caja-card-stat">
          <div className="caja-card-header-row">
            <span className="caja-card-label">Caja General</span>
            <span className={`caja-badge-status ${cajaAbierta ? 'abierta' : 'cerrada'}`}>
              {cajaAbierta ? <FiUnlock /> : <FiLock />} {cajaAbierta ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
          <span className="caja-card-value">S/ {stats.totalCaja.toFixed(2)}</span>
          <button className="caja-btn-action" onClick={() => setCajaAbierta(!cajaAbierta)}>
            {cajaAbierta ? 'Realizar Cierre de Caja' : 'Iniciar Apertura de Caja'}
          </button>
        </div>

        <div className="caja-card-stat">
          <span className="caja-card-label">Efectivo en Caja</span>
          <span className="caja-card-value text-green">S/ {stats.efectivo.toFixed(2)}</span>
          <span className="caja-card-sub">Base apertura: S/ 350.00</span>
        </div>

        <div className="caja-card-stat">
          <span className="caja-card-label">Yape & Plin</span>
          <span className="caja-card-value text-purple">S/ {(stats.yape + stats.plin).toFixed(2)}</span>
          <span className="caja-card-sub">Yape: S/ {stats.yape.toFixed(2)} | Plin: S/ {stats.plin.toFixed(2)}</span>
        </div>

        <div className="caja-card-stat">
          <span className="caja-card-label">Tarjetas & Transf.</span>
          <span className="caja-card-value text-blue">S/ {(stats.tarjeta + stats.banco).toFixed(2)}</span>
          <span className="caja-card-sub">Tarjetas: S/ {stats.tarjeta.toFixed(2)} | Transf: S/ {stats.banco.toFixed(2)}</span>
        </div>
      </div>

      {/* Main split panels */}
      <div className="caja-main-panels">
        {/* Left Panel: Register Payment Form */}
        <div className="caja-panel-register">
          <div className="caja-panel-title">
            <FiPlusCircle /> Registrar Entrada de Pago
          </div>

          <form onSubmit={handleRegisterPayment} className="caja-form">
            <div className="erp-form-group">
              <label className="erp-form-label">Monto a Cobrar (S/)</label>
              <input
                type="number"
                step="0.01"
                required
                className="erp-input caja-amount-input"
                placeholder="0.00"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                disabled={!cajaAbierta}
              />
            </div>

            <div className="erp-form-group">
              <label className="erp-form-label">Seleccionar Método de Pago</label>
              <div className="caja-methods-grid">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    className={`caja-method-btn ${selectedMetodo === method.id ? 'active' : ''}`}
                    onClick={() => setSelectedMetodo(method.id)}
                    disabled={!cajaAbierta}
                    style={{
                      '--method-color': method.color,
                      '--method-bg': method.bg
                    } as React.CSSProperties}
                  >
                    <span className="caja-method-icon">{method.icon}</span>
                    <span className="caja-method-label">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="erp-form-grid" style={{ marginTop: '10px' }}>
              <div className="erp-form-group">
                <label className="erp-form-label">DNI / Nombre Cliente</label>
                <input
                  type="text"
                  className="erp-input"
                  placeholder="Ej: Juan Pérez"
                  value={cliente}
                  onChange={e => setCliente(e.target.value)}
                  disabled={!cajaAbierta}
                />
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Nro. Operación / Ref</label>
                <input
                  type="text"
                  className="erp-input"
                  placeholder="Ej: Op #526312"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                  disabled={!cajaAbierta}
                />
              </div>
            </div>

            <div className="erp-form-group" style={{ marginTop: '10px' }}>
              <label className="erp-form-label">Concepto / Comentario</label>
              <input
                type="text"
                className="erp-input"
                placeholder="Ej: Compra de artículos escolares varios"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                disabled={!cajaAbierta}
              />
            </div>

            <button
              type="submit"
              className="caja-submit-btn"
              disabled={!cajaAbierta}
            >
              Procesar y Emitir Comprobante (S/ {monto ? Number(monto).toFixed(2) : '0.00'})
            </button>
          </form>
        </div>

        {/* Right Panel: Daily Transactions List */}
        <div className="caja-panel-history">
          <div className="caja-panel-title">Transacciones del Turno Actual</div>

          <div className="caja-history-list">
            {salesHistory.length === 0 ? (
              <div className="caja-history-empty">No hay transacciones registradas hoy</div>
            ) : (
              salesHistory.map((s, idx) => (
                <div key={idx} className="caja-history-row">
                  <div className="caja-row-info">
                    <span className="caja-row-code">{s.codigo}</span>
                    <span className="caja-row-client">{s.cliente}</span>
                    <span className="caja-row-time">{formatDate(s.fecha)}</span>
                  </div>

                  <div className="caja-row-right">
                    <span className="caja-row-method" style={{
                      color: paymentMethods.find(p => p.id === s.metodoPago)?.color || '#475569',
                      backgroundColor: paymentMethods.find(p => p.id === s.metodoPago)?.bg || '#f1f5f9'
                    }}>
                      {s.metodoPago}
                    </span>
                    <span className="caja-row-amount">S/ {s.total.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaSection;
