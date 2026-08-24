import { api } from '../../../Services/apiService';

import type { MovimientoSelectDto } from '../../../Types/Admin/Inventario/Movimiento';

const pick = (raw: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
};

const toNum = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeMovimiento(raw: Record<string, unknown>): MovimientoSelectDto {
  return {
    idMovimiento: toNum(pick(raw, 'idMovimiento', 'id_movimiento', 'IdMovimiento', 'id')),
    fecha: String(pick(raw, 'fecha', 'Fecha') ?? ''),
    idTipoMovimiento: toNum(
      pick(raw, 'idTipoMovimiento', 'id_tipo_movimiento', 'IdTipoMovimiento', 'tipo', 'Tipo')
    ),
    tipoMovimiento: String(
      pick(raw, 'tipoMovimiento', 'tipo_movimiento', 'TipoMovimiento', 'nombreTipo') ?? ''
    ),
    idProducto: toNum(pick(raw, 'idProducto', 'id_producto', 'IdProducto')),
    codigoProducto: String(pick(raw, 'codigoProducto', 'codigo_producto', 'CodigoProducto') ?? ''),
    producto: String(pick(raw, 'producto', 'Producto', 'nombreProducto') ?? ''),
    idLote: toNum(pick(raw, 'idLote', 'id_lote', 'IdLote')),
    codigoLote: String(pick(raw, 'codigoLote', 'codigo_lote', 'CodigoLote') ?? ''),
    idUsuario: toNum(pick(raw, 'idUsuario', 'id_usuario', 'IdUsuario')),
    usuario: String(pick(raw, 'usuario', 'Usuario', 'nombreUsuario') ?? ''),
    cantidad: toNum(pick(raw, 'cantidad', 'Cantidad')),
    motivo: (pick(raw, 'motivo', 'Motivo') as string | undefined) || undefined,
    stockActual: toNum(pick(raw, 'stockActual', 'stock_actual', 'StockActual')),
  };
}

export interface MovimientoFiltros {
  idProducto?: number;
  tipo?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const MovimientoService = {

  //=========================================
  // LISTAR MOVIMIENTOS
  // GET /Lote/Lista-movimiento
  //=========================================
  getMovimientos: async (
    filtros?: MovimientoFiltros
  ): Promise<MovimientoSelectDto[]> => {
    let url = '/Lote/Lista-movimiento';

    if (filtros) {
      const params = new URLSearchParams();

      if (filtros.idProducto) {
        params.append('idProducto', filtros.idProducto.toString());
      }
      if (filtros.tipo) {
        params.append('tipo', filtros.tipo.toString());
      }
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }

      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const raw = await api.request<unknown>(url, { method: 'GET' });

    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

    return list.map(item => normalizeMovimiento(item as Record<string, unknown>));
  },

};
