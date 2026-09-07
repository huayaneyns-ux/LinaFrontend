import { Routes, Route, Navigate } from 'react-router-dom';
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

// Inventario
import InventarioPage from '../Pages/Admin/Inventario/index';
import ProductsSection from '../Pages/Admin/Inventario/components/ProductsSection';
import ProductFormPage from '../Pages/Admin/Inventario/pages/ProductFormPage';
import ProductDetailPage from '../Pages/Admin/Inventario/pages/ProductDetailPage';
import CategoriesSection from '../Pages/Admin/Inventario/components/CategoriesSection';
import BrandsSection from '../Pages/Admin/Inventario/components/BrandsSection';
import LotsSection from '../Pages/Admin/Inventario/components/LotsSection';
import MovementsSection from '../Pages/Admin/Inventario/components/MovementsSection';
import UnitsSection from '../Pages/Admin/Inventario/components/UnitsSection';

// Ventas
import VentasPage from '../Pages/Admin/Ventas/index';
import VentasSection from '../Pages/Admin/Ventas/components/VentasSection';
import PedidosSection from '../Pages/Admin/Ventas/components/PedidosSection';
import CajaSection from '../Pages/Admin/Ventas/components/CajaSection';
import DevolucionesSection from '../Pages/Admin/Ventas/components/DevolucionesSection';

// Comprobantes
import ComprobantesPage from '../Pages/Admin/Comprobantes/index';
import ComprobanteTodosSection from '../Pages/Admin/Comprobantes/components/todos/ComprobanteTodosSection';
import { ComprobantePagoVentas } from '../Pages/Admin/Comprobantes/components/ventas/ComprobanteVentasSection';
import { ComprobanteNotaVentas } from '../Pages/Admin/Comprobantes/components/notas/ComprobanteNotaSection';
import ComprobantePendientesSection from '../Pages/Admin/Comprobantes/components/pendientes/ComprobantePendientesSection';
import { ComprobanteLiquidacionSection } from '../Pages/Admin/Comprobantes/components/liquidaciones/ComprobanteLiquidacionSection';
import { ComprobanteTiemposSection } from '../Pages/Admin/Comprobantes/components/tiempos/ComprobanteTiemposSection';

// Compras
import ComprasPage from '../Pages/Admin/Compras/index';
import ComprasSection from '../Pages/Admin/Compras/components/ComprasSection';
import ProveedoresSection from '../Pages/Admin/Compras/components/ProveedoresSection';

// Seguridad
import SeguridadPage from '../Pages/Admin/Seguridad/index';
import UsersSection from '../Pages/Admin/Seguridad/components/UsersSection';
import RolesSection from '../Pages/Admin/Seguridad/components/RolesSection';

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

        {/* MÓDULO INVENTARIO */}
        <Route path="inventario" element={<InventarioPage />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<ProductsSection />} />
          <Route path="productos/nuevo" element={<ProductFormPage mode="create" />} />
          <Route path="productos/:id" element={<ProductDetailPage />} />
          <Route path="productos/:id/editar" element={<ProductFormPage mode="edit" />} />
          <Route path="categorias" element={<CategoriesSection />} />
          <Route path="marcas" element={<BrandsSection />} />
          <Route path="lotes" element={<LotsSection />} />
          <Route path="movimientos" element={<MovementsSection />} />
          <Route path="unidades" element={<UnitsSection />} />
        </Route>

        {/* MÓDULO VENTAS */}
        <Route path="ventas" element={<VentasPage />}>
          <Route index element={<Navigate to="ventas" replace />} />
          <Route path="ventas" element={<VentasSection />} />
          <Route path="pedidos" element={<PedidosSection />} />
          <Route path="caja" element={<CajaSection />} />
          <Route path="devoluciones" element={<DevolucionesSection />} />
        </Route>

        {/* MÓDULO COMPROBANTES */}
        <Route path="comprobantes" element={<ComprobantesPage />}>
          <Route index element={<Navigate to="todos" replace />} />
          <Route path="todos" element={<ComprobanteTodosSection />} />
          <Route path="ventas" element={<ComprobantePagoVentas />} />
          <Route path="notas" element={<ComprobanteNotaVentas />} />
          <Route path="pendientes" element={<ComprobantePendientesSection />} />
          <Route path="liquidaciones" element={<ComprobanteLiquidacionSection />} />
          <Route path="tiempos" element={<ComprobanteTiemposSection />} />
        </Route>

        {/* MÓDULO COMPRAS */}
        <Route path="compras" element={<ComprasPage />}>
          <Route index element={<Navigate to="ordenes" replace />} />
          <Route path="ordenes" element={<ComprasSection />} />
          <Route path="proveedores" element={<ProveedoresSection />} />
        </Route>

        {/* MÓDULO CAJA Y PAGOS */}
        <Route path="caja" element={<CajaSection />} />

        {/* MÓDULO SEGURIDAD */}
        <Route path="seguridad" element={
          <ProtectedRoute rolesPermitidos={['ADMINISTRADOR']}>
            <SeguridadPage />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios" element={<UsersSection />} />
          <Route path="roles" element={<RolesSection />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
