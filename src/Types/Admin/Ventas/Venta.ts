export interface VentaRealizadaSelectDto {
  id: number;
  cliente: string;
  vendedor: string;
  fecha: string;
  cantidadProductos: number;
  total: number;
  estado: string;
  igv: number;
}


export interface VentaRealizadaDetalleDto {
  id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}


export interface VentaRealizadaPagoDto {
  id: number;
  metodoPago: string;
  monto: number;
  fecha: string;
  codigoOperacion: string;
}