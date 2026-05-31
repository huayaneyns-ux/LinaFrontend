import type { Producto, Categoria } from '../../Types/Producto';
import type { Usuario } from '../../Types/Usuario';

import type { Marca } from '../../Types/Marca';

export const mockMarcas: Marca[] = [
  { id: 1, nombre: 'Artesco', estado: 'ACTIVO', url: 'https://cdn.worldvectorlogo.com/logos/artesco-1.svg' },
  { id: 2, nombre: 'Faber-Castell', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Faber-Castell_logo.svg' },
  { id: 3, nombre: 'Pilot', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Pilot_Corporation_logo.svg' },
  { id: 4, nombre: 'Staedtler', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Staedtler_Logo.svg' },
  { id: 5, nombre: 'Pelikan', estado: 'ACTIVO', url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Pelikan_logo.svg' },
];

export const mockProductos: Producto[] = [
  { id: 1, codigo: 'PROD-001', nombre: 'Cuaderno A4', categoria: 'Útiles Escolares', descripcion: 'Cuaderno cuadriculado de 100 hojas', precio: 5.50, imagenUrl: 'https://promart.vteximg.com.br/arquivos/ids/6966847-1000-1000/121088.jpg', stock: 50 },
  { id: 2, codigo: 'PROD-002', nombre: 'Lápiz 2B', categoria: 'Útiles Escolares', descripcion: 'Lápiz para dibujo y escritura', precio: 1.20, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/2/2/2275-l-piz-negro-2b-goma-faber-castell_1.jpg', stock: 100 },
  { id: 3, codigo: 'PROD-003', nombre: 'Calculadora Científica', categoria: 'Tecnología', descripcion: 'Calculadora Casio 991', precio: 85.00, imagenUrl: 'https://http2.mlstatic.com/D_NQ_NP_900021-MPE52932375991_122022-O.webp', stock: 20 },
  { id: 4, codigo: 'PROD-004', nombre: 'Mochila Urbana', categoria: 'Mochilas', descripcion: 'Mochila resistente al agua', precio: 120.00, imagenUrl: 'https://portaline.com/wp-content/uploads/2021/04/Mochila-Porta-Urbana-Negra.jpg', stock: 15 },
  { id: 5, codigo: 'PROD-005', nombre: 'Caja de Colores x24', categoria: 'Arte', descripcion: 'Colores intensos y duraderos', precio: 22.00, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/3/1/31802_1.jpg', stock: 30 },
  { id: 6, codigo: 'PROD-006', nombre: 'Archivador Lomo Ancho', categoria: 'Oficina', descripcion: 'Archivador tamaño oficio', precio: 12.50, imagenUrl: 'https://esencial.pe/wp-content/uploads/2020/06/archivador-lomo-ancho-artesco-768x768.jpg', stock: 40 },
  { id: 7, codigo: 'PROD-007', nombre: 'Set de Regalo', categoria: 'Regalos', descripcion: 'Ideal para el día de la madre', precio: 45.00, imagenUrl: 'https://acdn.mitiendanube.com/stores/001/141/924/products/set-regalo-11-cff0a34005b6ab379115894170321289-640-0.jpg', stock: 10 },
  { id: 8, codigo: 'PROD-008', nombre: 'Tijera de Acero', categoria: 'Papelería', descripcion: 'Tijera multiusos', precio: 4.50, imagenUrl: 'https://www.tailoy.com.pe/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/t/i/tijera-maped-17cm-1.jpg', stock: 60 },
];

export const mockUsuarios: Usuario[] = [
  { id: 'u1', username: 'admin', nombres: 'Administrador', apellidos: 'Principal', rol: 'ADMINISTRADOR', email: 'admin@test.com', password: '123' },
  { id: 'u2', username: 'juancliente', nombres: 'Juan', apellidos: 'Pérez', rol: 'CLIENTE', email: 'juan@test.com', password: '123' },
];

export const mockPedidos: any[] = [];
