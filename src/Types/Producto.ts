export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  idCategoria: number;
  categoria: string;
  idMarca?: number;
  marca?: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  url?: string;
  rutaImagen?: string;
  estado?: string | boolean | number;
  stock?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  estado: boolean;
  urlImagen?: string;
  url?: string;
  publicIdImagen?: string;
}
