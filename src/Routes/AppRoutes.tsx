import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../Layouts/PublicLayout';
import AdminLayout from '../Layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import Home from '../Pages/Home';
import Catalogo from '../Pages/Catalogo';
import Carrito from '../Pages/Carrito';
import Login from '../Pages/Login';
import Nosotros from '../Pages/Nosotros';
import Contacto from '../Pages/Contacto';
import Checkout from '../Pages/Checkout';
import MisPedidos from '../Pages/MisPedidos';

import Dashboard from '../Pages/Admin/Dashboard';
import InventarioPage from '../Pages/Admin/Inventario/index';
import VentasPage from '../Pages/Admin/Ventas/index';
import ComprobantesPage from '../Pages/Admin/Comprobantes/index';
import ComprasPage from '../Pages/Admin/Compras/index';
import SeguridadPage from '../Pages/Admin/Seguridad/index';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="login" element={<Login />} />
        <Route path="checkout" element={<ProtectedRoute rolesPermitidos={['CLIENTE', 'TRABAJADOR', 'ADMINISTRADOR']}><Checkout /></ProtectedRoute>} />
        <Route path="mis-pedidos" element={<ProtectedRoute rolesPermitidos={['CLIENTE']}><MisPedidos /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute rolesPermitidos={['TRABAJADOR', 'ADMINISTRADOR']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="comprobantes" element={<ComprobantesPage />} />
        <Route path="compras" element={<ComprasPage />} />
        <Route path="seguridad" element={
          <ProtectedRoute rolesPermitidos={['ADMINISTRADOR']}>
            <SeguridadPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
