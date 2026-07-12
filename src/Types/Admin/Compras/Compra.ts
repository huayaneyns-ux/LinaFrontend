export interface CompraSelectDto {
  id: number;
  codigo: string;
  idProveedor: number;
  proveedor: string;
  fecha: string;
  estado: string;
  total: number;
}

export interface CompraInsertDto {
  codigo: string;
  idProveedor: number;
  fecha: string;
  total: number;
}

export interface CompraUpdateDto {
  id: number;
  codigo: string;
  idProveedor: number;
  fecha: string;
  estado: string;
  total: number;
}
