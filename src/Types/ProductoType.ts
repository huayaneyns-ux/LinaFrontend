export interface ProductoType {
  id: number;
  codigo: string;
  nombre: string;
  idCategoria: number;
  categoria: string;
  descripcion: string;
  precio: number;
  url?: string;
  estado?: string;
  stock?: number;
}
