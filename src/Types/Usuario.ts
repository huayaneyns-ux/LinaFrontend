export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'PENDIENTE';
export type RolUsuario = 'CLIENTE' | 'TRABAJADOR' | 'ADMINISTRADOR' | 'SUPERVISOR' | 'CAJERO';

export interface Usuario {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
  email: string;
  password?: string;
  estado: EstadoUsuario;
  sucursal: string;
  telefono?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioFormData {
  username: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
  email: string;
  password?: string;
  estado: EstadoUsuario;
  sucursal: string;
  telefono?: string;
}
