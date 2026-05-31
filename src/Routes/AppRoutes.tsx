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
import Caja from '../Pages/Admin/Caja';
import MisPedidos from '../Pages/MisPedidos';

import Checkout from '../Pages/Checkout';

import Dashboard from '../Pages/Admin/Dashboard';
import Ventas from '../Pages/Admin/Ventas';
import PedidosAdmin from '../Pages/Admin/PedidosAdmin';
import Compras from '../Pages/Admin/Compras';
import Abastecer from '../Pages/Admin/Abastecer';
import Proveedores from '../Pages/Admin/Proveedores';
import ProductosAdmin from '../Pages/Admin/ProductosAdmin';
import Stock from '../Pages/Admin/Stock';
import Movimientos from '../Pages/Admin/Movimientos';
import Kardex from '../Pages/Admin/Kardex';
import Usuarios from '../Pages/Admin/Usuarios';

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
        <Route path="caja" element={<Caja />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="pedidos" element={<PedidosAdmin />} />
        <Route path="compras" element={<Compras />} />
        <Route path="abastecer" element={<Abastecer />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="productos" element={<ProductosAdmin />} />
        <Route path="inventario/stock" element={<Stock />} />
        <Route path="inventario/movimientos" element={<Movimientos />} />
        <Route path="inventario/kardex" element={<Kardex />} />
        <Route path="usuarios" element={
          <ProtectedRoute rolesPermitidos={['ADMINISTRADOR']}>
            <Usuarios />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
