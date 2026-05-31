export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  idCategoria: number;
  categoria: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  estado?: string;
  stock?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  estado: boolean;
  url: string;
}
