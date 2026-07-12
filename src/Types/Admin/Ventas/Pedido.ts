export interface PedidoSelectDto {
  id: number;
  codigo: string;
  clienteId: string;
  cliente?: string;
  fecha: string;
  estado: string;
  tipoEntrega: string;
  subtotal: number;
  igv: number;
  total: number;
  pagoPendiente: number;
}

export interface PedidoInsertDto {
  codigo: string;
  clienteId: string;
  tipoEntrega: string;
  subtotal: number;
  igv: number;
  total: number;
}

export interface PedidoUpdateDto {
  id: number;
  codigo: string;
  clienteId: string;
  estado: string;
  tipoEntrega: string;
  subtotal: number;
  igv: number;
  total: number;
  pagoPendiente: number;
}
