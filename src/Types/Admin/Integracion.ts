export interface IntegracionConfiguracion {
  id: number;
  nombreEmpresa: string;
  descripcion?: string | null;
  apiKey: string;
  estado: boolean;
}

export interface IntegracionAuditoria {
  id: number;
  empresa: string;
  operacion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  duracionMs?: number | null;
  estado: string;
  registrosEnviados: number;
  detalle?: string | null;
  ipOrigen?: string | null;
}
