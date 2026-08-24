import { api } from '../../../Services/apiService';

import type {
  LoteSelectDto,
  LoteSelectListarDto,
  LoteInsertDto,
  MovimientoInsertDto
} from '../../../Types/Admin/Inventario/Lote';


export const LoteService = {

  //=========================================
  // LISTAR LOTES
  //=========================================
  getLotes: async (
    filtros?: {
      codigoLote?: string;
      idProducto?: number;
      idProveedor?: number;
      fechaIngresoDesde?: string;
      fechaIngresoHasta?: string;
      fechaVencimientoDesde?: string;
      fechaVencimientoHasta?: string;
    }
  ): Promise<LoteSelectListarDto[]> => {
    let url = '/Lote/Lista';

    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.codigoLote) params.append('codigoLote', filtros.codigoLote);
      if (filtros.idProducto) params.append('idProducto', filtros.idProducto.toString());
      if (filtros.idProveedor) params.append('idProveedor', filtros.idProveedor.toString());
      if (filtros.fechaIngresoDesde) params.append('fechaIngresoDesde', filtros.fechaIngresoDesde);
      if (filtros.fechaIngresoHasta) params.append('fechaIngresoHasta', filtros.fechaIngresoHasta);
      if (filtros.fechaVencimientoDesde) params.append('fechaVencimientoDesde', filtros.fechaVencimientoDesde);
      if (filtros.fechaVencimientoHasta) params.append('fechaVencimientoHasta', filtros.fechaVencimientoHasta);

      if (params.toString()) url += `?${params.toString()}`;
    }

    const rawData = await api.request<any[]>(url, { method: 'GET' });
    
    return rawData.map(item => ({
      idLote: item.id_lote ?? item.idLote,
      codigoLote: item.codigo_lote ?? item.codigoLote,
      idProducto: item.id_producto ?? item.idProducto,
      codigoProducto: item.codigo_producto ?? item.codigoProducto,
      producto: item.producto,
      idProveedor: item.id_proveedor ?? item.idProveedor,
      proveedor: item.proveedor,
      fechaIngreso: item.fecha_ingreso ?? item.fechaIngreso,
      fechaFabricacion: item.fecha_fabricacion ?? item.fechaFabricacion,
      fechaVencimiento: item.fecha_vencimiento ?? item.fechaVencimiento,
      cantidadIngresada: item.cantidad_ingresada ?? item.cantidadIngresada,
      costoUnitario: item.costo_unitario ?? item.costoUnitario,
      valorCompra: item.valorCompra,
      diasParaVencer: item.diasParaVencer,
      estadoLote: item.estadoLote
    }));
  },

  //=========================================
  // OBTENER LOTE
  //=========================================
  getLoteById: async (id: number): Promise<LoteSelectDto> => {
    const item = await api.request<any>(`/Lote/${id}`, { method: 'GET' });
    
    return {
      idLote: item.id_lote ?? item.idLote,
      codigoLote: item.codigo_lote ?? item.codigoLote,
      idProducto: item.id_producto ?? item.idProducto,
      codigoProducto: item.codigo_producto ?? item.codigoProducto,
      producto: item.producto,
      idProveedor: item.id_proveedor ?? item.idProveedor,
      proveedor: item.proveedor,
      fechaIngreso: item.fecha_ingreso ?? item.fechaIngreso,
      fechaFabricacion: item.fecha_fabricacion ?? item.fechaFabricacion,
      fechaVencimiento: item.fecha_vencimiento ?? item.fechaVencimiento,
      cantidadIngresada: item.cantidad_ingresada ?? item.cantidadIngresada,
      costoUnitario: item.costo_unitario ?? item.costoUnitario,
      valorCompra: item.valorCompra,
      stockActual: item.stockActual ?? item.stock_actual,
      diasParaVencer: item.diasParaVencer,
      estadoLote: item.estadoLote,
      movimientos: item.movimientos?.map((m: any) => ({
        id: m.id ?? m.id_movimiento,
        fecha: m.fecha,
        tipoMovimiento: m.tipoMovimiento ?? m.tipo_movimiento,
        cantidad: m.cantidad,
        motivo: m.motivo
      })) || []
    };
  },

  //=========================================
  // INSERTAR LOTE
  //=========================================
  createLote: async (data: LoteInsertDto): Promise<any> => {
    return api.request<any>('/Lote/Insertar', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  //=========================================
  // INSERTAR MOVIMIENTO
  //=========================================
  createMovimiento: async (data: MovimientoInsertDto): Promise<any> => {
    return api.request<any>('/Lote/InsertarMovimiento', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

};