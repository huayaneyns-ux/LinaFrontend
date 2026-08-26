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
  { id: 3, codigo: 'PROD-003', nombre: 'Calculadora Científica Casio', idCategoria: 5, categoria: 'Tecnología de Escritorio', descripcion: 'Calculadora Casio fx-991LA Plus', precio: 85.00, imagenUrl: 'https://http2.mlstatic.com/D_NQ_NP_900021-MPE52932375991_122022-O.webp', stock: 45, estado: 'ACTIVO' },
  { id: 4, codigo: 'PROD-004', nombre: 'Mochila Urbana Resistente', idCategoria: 4, categoria: 'Mochilas y Estuches', descripcion: 'Mochila escolar y universitaria impermeable', precio: 120.00, imagenUrl: 'https://portaline.com/wp-content/uploads/2021/04/Mochila-Porta-Urbana-Negra.jpg', stock: 18, estado: 'ACTIVO' },
  { id: 5, codigo: 'PROD-005', nombre: 'Caja de Colores x24 Faber-Castell', idCategoria: 3, categoria: 'Arte y Manualidades', descripcion: 'Colores de madera ecológicos intensos', precio: 22.00, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/3/1/31802_1.jpg', stock: 75, estado: 'ACTIVO' },
  { id: 6, codigo: 'PROD-006', nombre: 'Archivador Lomo Ancho Artesco', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Archivador palanca lomo ancho tamaño oficio', precio: 12.50, imagenUrl: 'https://esencial.pe/wp-content/uploads/2020/06/archivador-lomo-ancho-artesco-768x768.jpg', stock: 120, estado: 'ACTIVO' },
  { id: 7, codigo: 'PROD-007', nombre: 'Set de Regalo Premium Escritorio', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Set ejecutivo con bolígrafo y libreta de cuero', precio: 45.00, imagenUrl: 'https://acdn.mitiendanube.com/stores/001/141/924/products/set-regalo-11-cff0a34005b6ab379115894170321289-640-0.jpg', stock: 25, estado: 'ACTIVO' },
  { id: 8, codigo: 'PROD-008', nombre: 'Tijera de Acero Inoxidable Maped 17cm', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Tijera multiuso ergonómica', precio: 4.50, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/t/i/tijera-maped-17cm-1.jpg', stock: 200, estado: 'ACTIVO' },
  { id: 9, codigo: 'PROD-009', nombre: 'Millar de Papel Fotocopia A4 75g Navigator', idCategoria: 2, categoria: 'Oficina y Papelería', descripcion: 'Papel bond ultra blanco especial fotocopia e impresión', precio: 32.00, imagenUrl: 'https://promart.vteximg.com.br/arquivos/ids/6966847-1000-1000/121088.jpg', stock: 350, estado: 'ACTIVO' },
  { id: 10, codigo: 'PROD-010', nombre: 'Resaltador Pastel x6 Faber-Castell', idCategoria: 1, categoria: 'Útiles Escolares', descripcion: 'Set de 6 marcadores fluorescentes tonos pastel', precio: 18.00, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/2/2/2275-l-piz-negro-2b-goma-faber-castell_1.jpg', stock: 110, estado: 'ACTIVO' },
];

export const mockUsuarios: Usuario[] = [
  { id: 'u1', username: 'admin', nombres: 'Carlos', apellidos: 'Mendoza Ríos', rol: 'ADMINISTRADOR', email: 'carlos.mendoza@lina.pe', estado: 'ACTIVO', sucursal: 'Sede Central', telefono: '987654321', createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-06-15T10:30:00Z' },
  { id: 'u2', username: 'lperez', nombres: 'Lucía', apellidos: 'Pérez García', rol: 'SUPERVISOR', email: 'lucia.perez@lina.pe', estado: 'ACTIVO', sucursal: 'Sede Central', telefono: '912345678', createdAt: '2024-02-05T09:00:00Z', updatedAt: '2024-06-10T11:00:00Z' },
  { id: 'u3', username: 'jramos', nombres: 'Jorge', apellidos: 'Ramos Torres', rol: 'TRABAJADOR', email: 'jorge.ramos@lina.pe', estado: 'ACTIVO', sucursal: 'Sucursal Norte', telefono: '923456789', createdAt: '2024-03-12T10:00:00Z', updatedAt: '2024-05-20T09:15:00Z' },
  { id: 'u4', username: 'mflores', nombres: 'María', apellidos: 'Flores Vega', rol: 'CAJERO', email: 'maria.flores@lina.pe', estado: 'ACTIVO', sucursal: 'Sucursal Sur', telefono: '934567890', createdAt: '2024-03-18T08:30:00Z', updatedAt: '2024-06-01T14:00:00Z' },
  { id: 'u5', username: 'arojas', nombres: 'Andrés', apellidos: 'Rojas Castillo', rol: 'TRABAJADOR', email: 'andres.rojas@lina.pe', estado: 'INACTIVO', sucursal: 'Sucursal Norte', telefono: '945678901', createdAt: '2024-01-25T11:00:00Z', updatedAt: '2024-04-30T16:00:00Z' },
  { id: 'c1', username: 'mfertorres', nombres: 'María Fernanda', apellidos: 'Torres Quispe', rol: 'CLIENTE', email: 'maria.torres@gmail.com', estado: 'ACTIVO', sucursal: '', telefono: '987123456', createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z' },
  { id: 'c2', username: 'lapicero_sac', nombres: 'Distribuciones El Lapicero S.A.C.', apellidos: '', rol: 'CLIENTE', email: 'ventas@lapicero.pe', estado: 'ACTIVO', sucursal: '', telefono: '976543210', createdAt: '2024-06-05T09:00:00Z', updatedAt: '2024-06-05T09:00:00Z' },
  { id: 'c3', username: 'calarcon', nombres: 'Carlos', apellidos: 'Alarcón Paredes', rol: 'CLIENTE', email: 'carlos.alarcon@gmail.com', estado: 'ACTIVO', sucursal: '', telefono: '965432109', createdAt: '2024-06-10T10:00:00Z', updatedAt: '2024-06-10T10:00:00Z' },
  { id: 'c4', username: 'oficina_creativa', nombres: 'Oficina Creativa del Perú S.A.C.', apellidos: '', rol: 'CLIENTE', email: 'contacto@oficinacreativa.pe', estado: 'ACTIVO', sucursal: '', telefono: '954321098', createdAt: '2024-06-12T11:00:00Z', updatedAt: '2024-06-12T11:00:00Z' },
  { id: 'c5', username: 'sbenavides', nombres: 'Sofía', apellidos: 'Benavides Ramos', rol: 'CLIENTE', email: 'sofia.benavides@gmail.com', estado: 'ACTIVO', sucursal: '', telefono: '943210987', createdAt: '2024-06-15T12:00:00Z', updatedAt: '2024-06-15T12:00:00Z' },
  { id: 'c6', username: 'corp_escolar', nombres: 'Corporación Escolar Moderna S.A.C.', apellidos: '', rol: 'CLIENTE', email: 'admin@escolarmoderna.pe', estado: 'ACTIVO', sucursal: '', telefono: '932109876', createdAt: '2024-06-18T14:00:00Z', updatedAt: '2024-06-18T14:00:00Z' },
  { id: 'c7', username: 'dcaceres', nombres: 'Diego', apellidos: 'Cáceres Vidal', rol: 'CLIENTE', email: 'diego.caceres@gmail.com', estado: 'ACTIVO', sucursal: '', telefono: '921098765', createdAt: '2024-06-20T16:00:00Z', updatedAt: '2024-06-20T16:00:00Z' },
  { id: 'c8', username: 'graficos_sur', nombres: 'Servicios Gráficos del Sur S.A.C.', apellidos: '', rol: 'CLIENTE', email: 'ventas@graficossur.pe', estado: 'ACTIVO', sucursal: '', telefono: '910987654', createdAt: '2024-06-22T17:00:00Z', updatedAt: '2024-06-22T17:00:00Z' },
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
  { id: 'V-1001', codigo: 'VT-001', cliente: 'María Fernanda Torres', fecha: '2026-08-20T11:00:00Z', metodoPago: 'EFECTIVO', total: 100.00, estado: 'ACTIVO' },
  { id: 'V-1002', codigo: 'VT-002', cliente: 'Distribuciones El Lapicero S.A.C.', fecha: '2026-08-21T15:30:00Z', metodoPago: 'TRANSFERENCIA', total: 1475.00, estado: 'ACTIVO' },
  { id: 'V-1003', codigo: 'VT-003', cliente: 'Carlos Alarcón Paredes', fecha: '2026-08-22T10:15:00Z', metodoPago: 'YAPE', total: 120.00, estado: 'ACTIVO' },
  { id: 'V-1004', codigo: 'VT-004', cliente: 'Oficina Creativa del Perú S.A.C.', fecha: '2026-08-23T09:00:00Z', metodoPago: 'TRANSFERENCIA', total: 849.60, estado: 'ACTIVO' },
  { id: 'V-1005', codigo: 'VT-005', cliente: 'Sofía Benavides Ramos', fecha: '2026-08-24T14:20:00Z', metodoPago: 'TARJETA', total: 220.00, estado: 'ACTIVO' },
  { id: 'V-1006', codigo: 'VT-006', cliente: 'Corporación Escolar Moderna S.A.C.', fecha: '2026-08-25T16:00:00Z', metodoPago: 'TRANSFERENCIA', total: 4248.00, estado: 'ACTIVO' },
  { id: 'V-1007', codigo: 'VT-007', cliente: 'Diego Cáceres Vidal', fecha: '2026-08-25T17:30:00Z', metodoPago: 'PLIN', total: 170.00, estado: 'ACTIVO' },
  { id: 'V-1008', codigo: 'VT-008', cliente: 'Servicios Gráficos del Sur S.A.C.', fecha: '2026-08-26T08:45:00Z', metodoPago: 'TRANSFERENCIA', total: 566.40, estado: 'ACTIVO' },
];

export const mockPedidos: Pedido[] = [
  { id: 'ped-1', codigo: 'PED-1001', clienteId: 'c1', fecha: '2026-08-20T11:00:00Z', estado: 'ENTREGADO', tipoEntrega: 'RECOJO_TIENDA', detalles: [], subtotal: 84.75, igv: 15.25, total: 100.00, pagoPendiente: 0 },
  { id: 'ped-2', codigo: 'PED-1002', clienteId: 'c2', fecha: '2026-08-21T15:30:00Z', estado: 'EN_PROCESO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 1250.00, igv: 225.00, total: 1475.00, pagoPendiente: 0 },
  { id: 'ped-3', codigo: 'PED-1003', clienteId: 'c3', fecha: '2026-08-22T10:15:00Z', estado: 'PAGADO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 101.69, igv: 18.31, total: 120.00, pagoPendiente: 0 },
  { id: 'ped-4', codigo: 'PED-1004', clienteId: 'c4', fecha: '2026-08-23T09:00:00Z', estado: 'PAGADO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 720.00, igv: 129.60, total: 849.60, pagoPendiente: 0 },
  { id: 'ped-5', codigo: 'PED-1005', clienteId: 'c5', fecha: '2026-08-24T14:20:00Z', estado: 'PAGADO', tipoEntrega: 'RECOJO_TIENDA', detalles: [], subtotal: 186.44, igv: 33.56, total: 220.00, pagoPendiente: 0 },
  { id: 'ped-6', codigo: 'PED-1006', clienteId: 'c6', fecha: '2026-08-25T16:00:00Z', estado: 'PAGADO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 3600.00, igv: 648.00, total: 4248.00, pagoPendiente: 0 },
  { id: 'ped-7', codigo: 'PED-1007', clienteId: 'c7', fecha: '2026-08-25T17:30:00Z', estado: 'PAGADO', tipoEntrega: 'RECOJO_TIENDA', detalles: [], subtotal: 144.07, igv: 25.93, total: 170.00, pagoPendiente: 0 },
  { id: 'ped-8', codigo: 'PED-1008', clienteId: 'c8', fecha: '2026-08-26T08:45:00Z', estado: 'PAGADO', tipoEntrega: 'ENVIO_DOMICILIO', detalles: [], subtotal: 480.00, igv: 86.40, total: 566.40, pagoPendiente: 0 },
];

export const mockDevoluciones = [
  { id: 'D-001', codigo: 'DEV-001', ventaCodigo: 'VT-001', cliente: 'María Fernanda Torres', fecha: '2026-08-21T09:00:00Z', motivo: 'Producto dañado', total: 11.00, estado: 'ACTIVO' },
  { id: 'D-002', codigo: 'DEV-002', ventaCodigo: 'VT-003', cliente: 'Carlos Alarcón Paredes', fecha: '2026-08-23T14:20:00Z', motivo: 'Error en despacho', total: 85.00, estado: 'PENDIENTE' },
];

export const mockRoles = [
  { id: 'R-001', nombre: 'ADMINISTRADOR', descripcion: 'Acceso total al sistema y configuraciones', usuariosAsignados: 2, estado: 'ACTIVO' },
  { id: 'R-002', nombre: 'SUPERVISOR', descripcion: 'Controla operaciones de compras e inventario', usuariosAsignados: 2, estado: 'ACTIVO' },
  { id: 'R-003', nombre: 'CAJERO', descripcion: 'Gestión de caja, cobranza y boletas/facturas', usuariosAsignados: 3, estado: 'ACTIVO' },
  { id: 'R-004', nombre: 'TRABAJADOR', descripcion: 'Registro de pedidos y consultas de stock', usuariosAsignados: 5, estado: 'ACTIVO' },
];

export const SUCURSALES = ['Sede Central', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Este'];

