//=========================================
// REGISTRAR COMPRA
//=========================================

export interface CompraCompletaInsertDto {

    id_usuario: number;

    id_proveedor: number;

    fecha_compra: string;

    fecha_recepcion?: string | null;

    detalles: CompraDetalleInsertDto[];

}


//=========================================
// DETALLE PARA REGISTRAR COMPRA
//=========================================

export interface CompraDetalleInsertDto {

    id_producto: number;

    cantidad: number;

    costo_total: number;

    fecha_fabricacion?: string | null;

    fecha_vencimiento?: string | null;

}



//=========================================
// LISTA DE COMPRAS
//=========================================

export interface CompraListaDto {

    id_compra: number;

    id_usuario: number;

    usuario: string;

    id_proveedor: number;

    proveedor: string;

    fecha_compra: string;

    fecha_recepcion?: string | null;

    total_compra: number;

    estado: boolean;

}



//=========================================
// DETALLE DE COMPRA
//=========================================

export interface CompraDetalleSelectDto {

    id_detalle_compra: number;

    id_producto: number;

    codigo_producto: string;

    producto: string;

    cantidad: number;

    costo_total: number;

    costo_unitario: number;

    id_lote?: number | null;

    codigo_lote?: string | null;

    fecha_vencimiento?: string | null;

    stock_actual?: number | null;

}



//=========================================
// RESPUESTA REGISTRO
//=========================================

export interface CompraResponseDto {

    success: boolean;

    mensaje: string;

    idCompra: number;

}