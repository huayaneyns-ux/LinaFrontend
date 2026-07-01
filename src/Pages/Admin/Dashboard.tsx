import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mockProductos, mockUsuarios, mockVentas, mockCompras,
  mockPedidos, mockProveedores, mockLotes, mockDevoluciones
} from '../../Constantes/Data/MockData';
import { StatusBadge } from '../../Components/ERP/StatusBadge';
import {
  FiDollarSign, FiShoppingCart, FiBox, FiUsers,
  FiTruck, FiAlertTriangle, FiTrendingUp, FiClock,
  FiArrowRight, FiPackage, FiRotateCcw
} from 'react-icons/fi';
import '../../Styles/ERP/erp-table.css';
import './Inventario/Inventario.css';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const ventasTotal = mockVentas.reduce((acc, v) => acc + v.total, 0);
    const comprasTotal = mockCompras.reduce((acc, c) => acc + c.total, 0);
    const pedidosPendientes = mockPedidos.filter(p => p.estado !== 'ENTREGADO').length;
    const productosActivos = mockProductos.filter(p => p.estado === 'ACTIVO').length;
    const stockBajo = mockProductos.filter(p => (p.stock ?? 0) <= 20).length;
    const proveedoresActivos = mockProveedores.filter(p => p.estado === 'ACTIVO').length;
    const usuariosActivos = mockUsuarios.filter(u => u.estado === 'ACTIVO').length;
    const devolucionesPendientes = mockDevoluciones.filter(d => d.estado === 'PENDIENTE').length;
    return { ventasTotal, comprasTotal, pedidosPendientes, productosActivos, stockBajo, proveedoresActivos, usuariosActivos, devolucionesPendientes };
  }, []);

  const kpiCards = [
    { label: 'Ventas del Período', value: `S/ ${stats.ventasTotal.toFixed(2)}`, icon: <FiDollarSign />, color: 'success', route: '/admin/ventas' },
    { label: 'Compras Registradas', value: `S/ ${stats.comprasTotal.toFixed(2)}`, icon: <FiShoppingCart />, color: 'accent', route: '/admin/compras' },
    { label: 'Pedidos Pendientes', value: stats.pedidosPendientes.toString(), icon: <FiClock />, color: 'warning', route: '/admin/ventas' },
    { label: 'Stock Bajo (≤20)', value: stats.stockBajo.toString(), icon: <FiAlertTriangle />, color: 'danger', route: '/admin/inventario' },
  ];

  const moduleCards = [
    { label: 'Productos Activos', value: stats.productosActivos, icon: <FiBox />, route: '/admin/inventario' },
    { label: 'Proveedores Activos', value: stats.proveedoresActivos, icon: <FiTruck />, route: '/admin/compras' },
    { label: 'Usuarios del Sistema', value: stats.usuariosActivos, icon: <FiUsers />, route: '/admin/seguridad' },
    { label: 'Lotes Registrados', value: mockLotes.length, icon: <FiPackage />, route: '/admin/inventario' },
    { label: 'Devoluciones Pend.', value: stats.devolucionesPendientes, icon: <FiRotateCcw />, route: '/admin/ventas' },
    { label: 'Margen Bruto', value: `S/ ${(stats.ventasTotal - stats.comprasTotal).toFixed(0)}`, icon: <FiTrendingUp />, route: '/admin/ventas' },
  ];

  return (
    <div className="erp-module-container fade-in">
      {/* Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Panel de Control</h1>
          <p className="erp-module-subtitle">Resumen operativo del sistema &bull; {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="dash-kpi-row">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className={`dash-kpi-card dash-kpi-${kpi.color}`}
            onClick={() => navigate(kpi.route)}
          >
            <div className="dash-kpi-icon">{kpi.icon}</div>
            <div className="dash-kpi-info">
              <span className="dash-kpi-value">{kpi.value}</span>
              <span className="dash-kpi-label">{kpi.label}</span>
            </div>
            <FiArrowRight className="dash-kpi-arrow" />
          </div>
        ))}
      </div>

      {/* Module Cards Row */}
      <div className="dash-modules-grid">
        {moduleCards.map((mod, i) => (
          <div
            key={i}
            className="dash-module-card"
            onClick={() => navigate(mod.route)}
          >
            <div className="dash-module-icon">{mod.icon}</div>
            <span className="dash-module-value">{mod.value}</span>
            <span className="dash-module-label">{mod.label}</span>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="dash-tables-row">
        {/* Últimas Ventas */}
        <div className="erp-table-card">
          <div className="dash-table-header">
            <h3 className="dash-table-title">Últimas Ventas</h3>
            <button className="dash-table-link" onClick={() => navigate('/admin/ventas')}>Ver todo <FiArrowRight /></button>
          </div>
          <div className="erp-table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Método</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {mockVentas.slice(0, 5).map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.codigo}</strong></td>
                    <td>{v.cliente}</td>
                    <td><span className="dash-badge-method">{v.metodoPago}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>S/ {v.total.toFixed(2)}</td>
                    <td><StatusBadge status={v.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimos Pedidos */}
        <div className="erp-table-card">
          <div className="dash-table-header">
            <h3 className="dash-table-title">Pedidos Recientes</h3>
            <button className="dash-table-link" onClick={() => navigate('/admin/ventas')}>Ver todo <FiArrowRight /></button>
          </div>
          <div className="erp-table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {mockPedidos.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.codigo}</strong></td>
                    <td>{new Date(p.fecha).toLocaleDateString('es-PE')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>S/ {p.total.toFixed(2)}</td>
                    <td><StatusBadge status={p.estado === 'ENTREGADO' ? 'ACTIVO' : p.estado === 'EN_PROCESO' ? 'SUSPENDIDO' : 'PENDIENTE'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Products with Low Stock */}
      <div className="erp-table-card">
        <div className="dash-table-header">
          <h3 className="dash-table-title">Productos con Stock Bajo (&le;20 unidades)</h3>
          <button className="dash-table-link" onClick={() => navigate('/admin/inventario')}>Ir a Inventario <FiArrowRight /></button>
        </div>
        <div className="erp-table-wrapper">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockProductos
                .filter(p => (p.stock ?? 0) <= 20)
                .map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.codigo}</strong></td>
                    <td>{p.nombre}</td>
                    <td style={{ color: 'var(--erp-text-secondary)' }}>{p.categoria}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: (p.stock ?? 0) <= 10 ? 'var(--erp-danger)' : '#ca8a04',
                        backgroundColor: (p.stock ?? 0) <= 10 ? 'var(--erp-danger-light)' : 'rgba(234,179,8,0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {p.stock} und
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>S/ {p.precio.toFixed(2)}</td>
                    <td><StatusBadge status={p.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
