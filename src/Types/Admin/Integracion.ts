export interface IntegracionConfiguracion {
  id: number;
  nombreEmpresa: string;
  descripcion?: string | null;
  apiKey: string;
  estado: boolean;
  dominioEndpoint?: string | null;
  apiKeyExterna?: string | null;
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

export interface IntegracionProductoAdmin { id: number; codigo?: string | null; sku?: string | null; nombre?: string | null; empresaOrigen?: string | null; seleccionado: boolean; entregado: boolean; }
export interface IntegracionProveedorAdmin { id: number; ruc?: string | null; razonSocial?: string | null; empresaOrigen?: string | null; seleccionado: boolean; entregado: boolean; }
export interface IntegracionCatalogoAdmin { productos: IntegracionProductoAdmin[]; proveedores: IntegracionProveedorAdmin[]; }

export interface IntegracionConsultaExterna {
  tipo: string;
  productos: IntegracionProductoAdmin[];
  proveedores: IntegracionProveedorAdmin[];
  clientes?: unknown[];
  guardados?: number;
  insertados?: number;
  actualizados?: number;
  sinCambios?: number;
}
