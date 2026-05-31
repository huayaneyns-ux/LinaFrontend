export interface Usuario {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
  email: string;
  password?: string;
}

export type RolUsuario = 'CLIENTE' | 'TRABAJADOR' | 'ADMINISTRADOR';
