export interface RolSelectDto {
  id: number;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  estado: boolean;
}

export interface RolInsertDto {
  nombre: string;
  descripcion: string;
}

export interface RolUpdateDto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}
