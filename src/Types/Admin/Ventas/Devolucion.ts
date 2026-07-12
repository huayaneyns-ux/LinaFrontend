export interface DevolucionSelectDto {
  id: number;
  codigo: string;
  ventaCodigo: string;
  cliente: string;
  fecha: string;
  motivo: string;
  total: number;
  estado: string;
}

export interface DevolucionInsertDto {
  codigo: string;
  ventaCodigo: string;
  cliente: string;
  motivo: string;
  total: number;
}

export interface DevolucionUpdateDto {
  id: number;
  codigo: string;
  ventaCodigo: string;
  cliente: string;
  motivo: string;
  total: number;
  estado: string;
}
