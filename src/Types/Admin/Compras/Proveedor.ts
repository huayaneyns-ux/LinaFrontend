export interface Proveedor {
  id: number;

  ruc: string;
  razonSocial: string;
  nombreContacto: string;
  telefono: string;

  estado: boolean;

  idDireccion: number;

  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

export interface ProveedorInsert {
  ruc: string;
  razonSocial: string;
  nombreContacto: string;
  telefono: string;
  idDireccion: number;
}

export interface ProveedorUpdate {
  id: number;

  ruc: string;
  razonSocial: string;
  nombreContacto: string;
  telefono: string;

  idDireccion: number;
  estado: boolean;
}

export interface ProductoProveedorAlert {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ProveedorDeleteResponse {
  mensaje: string;
  tieneProductos: boolean;
  productos: ProductoProveedorAlert[];
}

