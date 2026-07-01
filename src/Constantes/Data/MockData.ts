import type { Producto, Categoria } from '../../Types/Producto';
import type { Usuario } from '../../Types/Usuario';
import type { Marca } from '../../Types/Marca';
import type { Pedido } from '../../Types/Pedido';

export const mockMarcas: Marca[] = [
  { id: 1, nombre: 'Artesco', estado: 'ACTIVO', url: 'https://cdn.worldvectorlogo.com/logos/artesco-1.svg' },
  { id: 2, nombre: 'Faber-Castell', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Faber-Castell_logo.svg' },
  { id: 3, nombre: 'Pilot', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Pilot_Corporation_logo.svg' },
  { id: 4, nombre: 'Staedtler', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Staedtler_Logo.svg' },
  { id: 5, nombre: 'Pelikan', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Pelikan_logo.svg' },
];

export const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Útiles Escolares', estado: true, url: '' },
  { id: 2, nombre: 'Oficina y Papelería', estado: true, url: '' },
  { id: 3, nombre: 'Arte y Manualidades', estado: true, url: '' },
  { id: 4, nombre: 'Mochilas y Estuches', estado: true, url: '' },
  { id: 5, nombre: 'Tecnología de Escritorio', estado: true, url: '' },
];

export const mockProductos: Producto[] = [
  { id: 1, codigo: 'PROD-001', nombre: 'Cuaderno A4 cuadriculado Artesco', idCategoria: 1, categoria: 'Útiles Escolares', descripcion: 'Cuaderno cuadriculado de 100 hojas', precio: 5.50, imagenUrl: 'https://promart.vteximg.com.br/arquivos/ids/6966847-1000-1000/121088.jpg', stock: 150, estado: 'ACTIVO' },
  { id: 2, codigo: 'PROD-002', nombre: 'Lápiz Faber-Castell 2B', idCategoria: 1, categoria: 'Útiles Escolares', descripcion: 'Lápiz para dibujo y escritura', precio: 1.20, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/2/2/2275-l-piz-negro-2b-goma-faber-castell_1.jpg', stock: 450, estado: 'ACTIVO' },
  { id: 3, codigo: 'PROD-003', nombre: 'Calculadora Científica Casio', idCategoria: 5, categoria: 'Tecnología de Escritorio', descripcion: 'Calculadora Casio 991', precio: 85.00, imagenUrl: 'https://http2.mlstatic.com/D_NQ_NP_900021-MPE52932375991_122022-O.webp', stock: 45, estado: 'ACTIVO' },
  { id: 4, codigo: 'PROD-004', nombre: 'Mochila Urbana Resistente', idCategoria: 4, categoria: 'Mochilas y Estuches', descripcion: 'Mochila resistente al agua', precio: 120.00, imagenUrl: 'https://portaline.com/wp-content/uploads/2021/04/Mochila-Porta-Urbana-Negra.jpg', stock: 18, estado: 'ACTIVO' },
  { id: 5, codigo: 'PROD-005', nombre: 'Caja de Colores x24 Faber', idCategoria: 3, categoria: 'Arte y Manualidades', descripcion: 'Colores intensos y duraderos', precio: 22.00, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/3/1/31802_1.jpg', stock: 75, estado: 'ACTIVO' },
  { id: 6, codigo: 'PROD-006', nombre: 'Archivador Lomo Ancho Artesco', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Archivador tamaño oficio', precio: 12.50, imagenUrl: 'https://esencial.pe/wp-content/uploads/2020/06/archivador-lomo-ancho-artesco-768x768.jpg', stock: 120, estado: 'ACTIVO' },
  { id: 7, codigo: 'PROD-007', nombre: 'Set de Regalo Premium', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Ideal para el día de la madre', precio: 45.00, imagenUrl: 'https://acdn.mitiendanube.com/stores/001/141/924/products/set-regalo-11-cff0a34005b6ab379115894170321289-640-0.jpg', stock: 8, estado: 'INACTIVO' },
  { id: 8, codigo: 'PROD-008', nombre: 'Tijera de Acero Maped', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Tijera multiusos', precio: 4.50, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/t/i/tijera-maped-17cm-1.jpg', stock: 200, estado: 'ACTIVO' },
];

export const mockUsuarios: Usuario[] = [
  { id: 'u1', username: 'admin', nombres: 'Carlos', apellidos: 'Mendoza Ríos', rol: 'ADMINISTRADOR', email: 'carlos.mendoza@lina.pe', estado: 'ACTIVO', sucursal: 'Sede Central', telefono: '987654321', createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-06-15T10:30:00Z' },
  { id: 'u2', username: 'lperez', nombres: 'Lucía', apellidos: 'Pérez García', rol: 'SUPERVISOR', email: 'lucia.perez@lina.pe', estado: 'ACTIVO', sucursal: 'Sede Central', telefono: '912345678', createdAt: '2024-02-05T09:00:00Z', updatedAt: '2024-06-10T11:00:00Z' },
  { id: 'u3', username: 'jramos', nombres: 'Jorge', apellidos: 'Ramos Torres', rol: 'TRABAJADOR', email: 'jorge.ramos@lina.pe', estado: 'ACTIVO', sucursal: 'Sucursal Norte', telefono: '923456789', createdAt: '2024-03-12T10:00:00Z', updatedAt: '2024-05-20T09:15:00Z' },
  { id: 'u4', username: 'mflores', nombres: 'María', apellidos: 'Flores Vega', rol: 'CAJERO', email: 'maria.flores@lina.pe', estado: 'ACTIVO', sucursal: 'Sucursal Sur', telefono: '934567890', createdAt: '2024-03-18T08:30:00Z', updatedAt: '2024-06-01T14:00:00Z' },
  { id: 'u5', username: 'arojas', nombres: 'Andrés', apellidos: 'Rojas Castillo', rol: 'TRABAJADOR', email: 'andres.rojas@lina.pe', estado: 'INACTIVO', sucursal: 'Sucursal Norte', telefono: '945678901', createdAt: '2024-01-25T11:00:00Z', updatedAt: '2024-04-30T16:00:00Z' },
];

export const mockLotes = [
  { id: 'L-001', productoId: 1, productoNombre: 'Cuaderno A4 cuadriculado Artesco', cantidadInicial: 200, cantidadActual: 150, fechaIngreso: '2024-05-01T08:00:00Z', fechaVencimiento: '2028-05-01T08:00:00Z', estado: 'ACTIVO' },
  { id: 'L-002', productoId: 2, productoNombre: 'Lápiz Faber-Castell 2B', cantidadInicial: 500, cantidadActual: 450, fechaIngreso: '2024-05-10T10:00:00Z', fechaVencimiento: '2029-05-10T10:00:00Z', estado: 'ACTIVO' },
  { id: 'L-003', productoId: 3, productoNombre: 'Calculadora Científica Casio', cantidadInicial: 50, cantidadActual: 45, fechaIngreso: '2024-05-15T14:00:00Z', fechaVencimiento: '', estado: 'ACTIVO' },
  { id: 'L-004', productoId: 4, productoNombre: 'Mochila Urbana Resistente', cantidadInicial: 20, cantidadActual: 18, fechaIngreso: '2024-05-20T09:00:00Z', fechaVencimiento: '', estado: 'ACTIVO' },
];

export const mockMovimientos = [
  { id: 'M-001', tipo: 'INGRESO', productoNombre: 'Cuaderno A4 cuadriculado Artesco', cantidad: 200, motivo: 'Compra a Proveedor', fecha: '2024-05-01T08:30:00Z', usuario: 'Lucía Pérez' },
  { id: 'M-002', tipo: 'INGRESO', productoNombre: 'Lápiz Faber-Castell 2B', cantidad: 500, motivo: 'Compra a Proveedor', fecha: '2024-05-10T10:15:00Z', usuario: 'Lucía Pérez' },
  { id: 'M-003', tipo: 'SALIDA', productoNombre: 'Cuaderno A4 cuadriculado Artesco', cantidad: 10, motivo: 'Venta #V-1001', fecha: '2024-06-25T11:00:00Z', usuario: 'María Flores' },
  { id: 'M-004', tipo: 'SALIDA', productoNombre: 'Calculadora Científica Casio', cantidad: 2, motivo: 'Venta #V-1002', fecha: '2024-06-26T15:30:00Z', usuario: 'María Flores' },
];

export const mockUnidades = [
  { id: 'U-001', nombre: 'Unidad', abreviatura: 'UND', estado: 'ACTIVO' },
  { id: 'U-002', nombre: 'Caja x 12', abreviatura: 'CJ12', estado: 'ACTIVO' },
  { id: 'U-003', nombre: 'Caja x 24', abreviatura: 'CJ24', estado: 'ACTIVO' },
  { id: 'U-004', nombre: 'Paquete x 10', abreviatura: 'PAQ10', estado: 'ACTIVO' },
];

export const mockProveedores = [
  { id: 'P-001', ruc: '20100200301', razonSocial: 'Distribuidora Continental S.A.', contacto: 'Alberto Ruiz', email: 'ventas@continental.com.pe', telefono: '998877665', direccion: 'Av. Argentina 1450, Callao', estado: 'ACTIVO' },
  { id: 'P-002', ruc: '20501234567', razonSocial: 'Faber-Castell del Perú S.A.', contacto: 'Patricia Wong', email: 'pwong@faber-castell.com.pe', telefono: '912345678', direccion: 'Av. La Molina 234, Ate', estado: 'ACTIVO' },
  { id: 'P-003', ruc: '20123487654', razonSocial: 'Comercializadora de Útiles Artesco', contacto: 'Manuel López', email: 'mlopez@artesco.com.pe', telefono: '934567890', direccion: 'Jr. Carabaya 567, Lima Centro', estado: 'INACTIVO' },
];

export const mockCompras = [
  { id: 'C-1001', codigo: 'COM-001', proveedor: 'Distribuidora Continental S.A.', fecha: '2024-05-01T08:00:00Z', estado: 'ACTIVO', total: 1100.00, detalles: [] },
  { id: 'C-1002', codigo: 'COM-002', proveedor: 'Faber-Castell del Perú S.A.', fecha: '2024-05-10T09:30:00Z', estado: 'ACTIVO', total: 540.00, detalles: [] },
  { id: 'C-1003', codigo: 'COM-003', proveedor: 'Comercializadora de Útiles Artesco', fecha: '2024-05-15T12:00:00Z', estado: 'PENDIENTE', total: 1250.00, detalles: [] },
];

export const mockVentas = [
  { id: 'V-1001', codigo: 'VT-001', cliente: 'Juan Pérez', fecha: '2024-06-25T11:00:00Z', metodoPago: 'EFECTIVO', total: 55.00, estado: 'ACTIVO' },
  { id: 'V-1002', codigo: 'VT-002', cliente: 'Ana María Solís', fecha: '2024-06-26T15:30:00Z', metodoPago: 'YAPE', total: 170.00, estado: 'ACTIVO' },
  { id: 'V-1003', codigo: 'VT-003', cliente: 'Diego Cáceres', fecha: '2024-06-27T10:15:00Z', metodoPago: 'VISA', total: 85.00, estado: 'ACTIVO' },
  { id: 'V-1004', codigo: 'VT-004', cliente: 'Sofía Benavides', fecha: '2024-06-28T09:00:00Z', metodoPago: 'PLIN', total: 22.00, estado: 'PENDIENTE' },
];

export const mockPedidos: Pedido[] = [
  { id: 'ped-1', codigo: 'PED-1001', clienteId: 'c1', fecha: '2024-06-25T11:00:00Z', estado: 'ENTREGADO', tipoEntrega: 'RECOJO_TIENDA', detalles: [], subtotal: 46.61, igv: 8.39, total: 55.00, pagoPendiente: 0 },
  { id: 'ped-2', codigo: 'PED-1002', clienteId: 'c2', fecha: '2024-06-26T15:30:00Z', estado: 'EN_PROCESO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 144.07, igv: 25.93, total: 170.00, pagoPendiente: 0 },
  { id: 'ped-3', codigo: 'PED-1003', clienteId: 'c3', fecha: '2024-06-27T10:15:00Z', estado: 'PENDIENTE_PAGO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 72.03, igv: 12.97, total: 85.00, pagoPendiente: 85.00 },
];

export const mockDevoluciones = [
  { id: 'D-001', codigo: 'DEV-001', ventaCodigo: 'VT-001', cliente: 'Juan Pérez', fecha: '2024-06-26T09:00:00Z', motivo: 'Producto dañado', total: 11.00, estado: 'ACTIVO' },
  { id: 'D-002', codigo: 'DEV-002', ventaCodigo: 'VT-003', cliente: 'Diego Cáceres', fecha: '2024-06-27T14:20:00Z', motivo: 'Error en despacho', total: 85.00, estado: 'PENDIENTE' },
];

export const mockRoles = [
  { id: 'R-001', nombre: 'ADMINISTRADOR', descripcion: 'Acceso total al sistema y configuraciones', usuariosAsignados: 2, estado: 'ACTIVO' },
  { id: 'R-002', nombre: 'SUPERVISOR', descripcion: 'Controla operaciones de compras e inventario', usuariosAsignados: 2, estado: 'ACTIVO' },
  { id: 'R-003', nombre: 'CAJERO', descripcion: 'Gestión de caja, cobranza y boletas/facturas', usuariosAsignados: 3, estado: 'ACTIVO' },
  { id: 'R-004', nombre: 'TRABAJADOR', descripcion: 'Registro de pedidos y consultas de stock', usuariosAsignados: 5, estado: 'ACTIVO' },
];

export const SUCURSALES = ['Sede Central', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Este'];
