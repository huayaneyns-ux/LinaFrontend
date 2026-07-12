export interface UsuarioSelectDto {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
  email: string;
  estado: boolean;
  sucursal: string;
  telefono: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioInsertDto {
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
  email: string;
  sucursal: string;
  telefono: string;
  password: string;
}

export interface UsuarioUpdateDto {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
  email: string;
  estado: boolean;
  sucursal: string;
  telefono: string;
}
