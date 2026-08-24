import type { Producto } from '../Types/Producto';
import { ProductoService as AdminProductoService } from './Admin/Inventario/Producto';
import type { ProductoSelectDto } from '../Types/Admin/Inventario/Producto';

function mapProducto(p: ProductoSelectDto): Producto {
  return {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    idCategoria: p.idCategoria,
    categoria: p.categoria,
    idMarca: p.idMarca,
    marca: p.marca,
    descripcion: p.descripcion ?? '',
    precio: p.precioVenta,
    rutaImagen: p.rutaImagen,
    url: p.rutaImagen,
    imagenUrl: p.rutaImagen,
    estado: p.estado,
    stock: Number(p.stock) || 0,
  };
}

export const ProductoService = {
  getProductos: async (): Promise<Producto[]> => {
    const data = await AdminProductoService.getProductos();
    return data.map(mapProducto);
  },
};
