export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direcciones: Direccion[];
}

export interface Direccion {
  id: string;
  alias: string;
  direccion: string;
  referencia: string;
  esPredeterminada: boolean;
}
