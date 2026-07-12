import type { Producto } from './Producto';
import type { Direccion } from './Cliente';

export interface Pedido {
  id: string;
  codigo: string;
  clienteId: string;
  fecha: string;
  estado: EstadoPedido;
  tipoEntrega: 'RECOJO_TIENDA' | 'ENVIO_DOMICILIO';
  direccionEnvio?: Direccion;
  detalles: DetallePedido[];
  subtotal: number;
  igv: number;
  total: number;
  pagoPendiente: number;
  tiempoEstimadoEntrega?: string;
}

export interface DetallePedido {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoPedido = 'PENDIENTE_PAGO' | 'PAGADO' | 'EN_PROCESO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
