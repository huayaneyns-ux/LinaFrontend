export type ComprobanteSection =
  | 'todos'
  | 'comprobantes'
  | 'guias'
  | 'notas';

export interface ComprobanteSectionDefinition {
  id: ComprobanteSection;
  label: string;
}

export type ComprobanteTipo =
  | 'BOLETA'
  | 'FACTURA'
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO'
  | 'LIQUIDACION_COMPRA'
  | 'GUIA_REMISION_REMITENTE'
  | 'GUIA_REMISION_TRANSPORTISTA';

export type ComprobanteEstado = 'BORRADOR' | 'EMITIDO' | 'ANULADO' | 'RECHAZADO';

export type ComprobanteEstadoSunat =
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'OBSERVADO';

export interface ComprobanteDetalleItem {
  productoServicio: string;
  codigo: string;
  cantidad: number;
  precio: number;
  igv: number;
  importe: number;
}

export type ComprobanteEmitibleTipo = 'BOLETA' | 'FACTURA';
export type ComprobanteOrigen = 'VENTA' | 'MANUAL';

export interface ComprobanteClienteData {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  direccion: string;
  correo: string;
}

export interface ComprobanteFormItem {
  productoId: number | null;
  codigo: string;
  productoServicio: string;
  cantidad: number;
  precio: number;
  igv: number;
  importe: number;
}

export interface ComprobanteFormData {
  tipo: ComprobanteEmitibleTipo;
  origen: ComprobanteOrigen;
  ventaOrigenId: string;
  cliente: ComprobanteClienteData;
  detalle: ComprobanteFormItem[];
  fechaEmision: string;
  fechaVencimiento: string;
  observaciones: string;
}

export interface VentaOrigenComprobanteDto {
  id: string;
  codigo: string;
  fecha: string;
  cliente: ComprobanteClienteData;
  detalle: ComprobanteFormItem[];
  subtotal: number;
  igv: number;
  total: number;
}

export interface ProductoComprobanteMockDto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
}

export interface ComprobanteSelectDto {
  id: number;
  tipo: ComprobanteTipo;
  serie: string;
  numero: string;
  fechaEmision: string;
  cliente: string;
  documentoCliente: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: ComprobanteEstado;
  estadoSunat: ComprobanteEstadoSunat;
  remitente?: string;
  destinatario?: string;
  motivoTraslado?: string;
  tipoDocumentoCliente: string;
  direccionCliente: string;
  correoCliente: string;
  codigoRespuestaSunat: string;
  mensajeSunat: string;
  fechaConsultaSunat: string;
  fechaEnvioSunat: string;
  detalle: ComprobanteDetalleItem[];
  pdfUrl?: string;
  fechaTraslado?: string;
  puntoPartida?: string;
  puntoLlegada?: string;
  pesoTotal?: number;
  unidadMedidaPeso?: string;
  bienesTransportados?: string[];
  transportista?: string;
  rucTransportista?: string;
  vehiculo?: string;
  conductor?: string;
  ventaOrigenId?: string;
  fechaVencimiento?: string;
  observaciones?: string;
}

export type TipoNota =
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO';


export type TipoNotaCredito =
  | 'Anulación de la operación'
  | 'Anulación por error en el RUC'
  | 'Corrección por error en la descripción'
  | 'Descuento global o por ítem'
  | 'Devolución total o por ítem'
  | 'Bonificaciones'
  | 'Disminución en el valor';


export type TipoNotaDebito =
  | 'Intereses por mora'
  | 'Aumento en el valor'
  | 'Penalidades'
  | 'Otros conceptos'
  | 'Ajustes de operaciones de exportación';


export interface NotaComprobanteSelectDto {

  id: number;

  serie: string,

  numero: string,

  tipo: TipoNota;

  status: ComprobanteEstadoSunat;

  responseTime: string;

  issueTime: string;

  nombreCliente: string;

  tipoDocumentoCliente: string;

  documentoCliente: string;

  direccionCliente: string;

  correoCliente: string;

  subtotal: number;

  igv: number;

  total: number;

  estado: ComprobanteEstado;

  estadoSunat: ComprobanteEstadoSunat;

  mensajeSunat: string;

  comprobanteRelacionado: {

    id: number;

    tipo: ComprobanteTipo;

    serie: string;

    numero: string;

    fechaEmision: string;

  };

  motivoDescripcion: string;

  detalle: ComprobanteDetalleItem[];

  observaciones?: string;

  fileName: string;

  faults: string[];

  notes: string[];

  reference: string;
}

export interface NotaComprobanteBaseCreateDto {

  serie: string;

  numero: string;

  fechaEmision: string;

  nombreCliente?: string;

  tipoDocumentoCliente?: string;

  documentoCliente?: string;

  direccionCliente?: string;

  correoCliente?: string;

  subtotal: number;

  igv: number;

  total: number;

  comprobanteRelacionado: {

    id: number;

    tipo: ComprobanteTipo;

    serie: string;

    numero: string;

  };

  detalle: ComprobanteDetalleItem[];

}

export interface NotaCreditoCreateDto extends NotaComprobanteBaseCreateDto {

  tipo: 'NOTA_CREDITO';

  motivo: TipoNotaCredito;
}

export interface NotaDebitoCreateDto extends NotaComprobanteBaseCreateDto {

  tipo: 'NOTA_DEBITO';

  motivo: TipoNotaDebito;
}

export type NotaComprobanteCreateDto = | NotaCreditoCreateDto | NotaDebitoCreateDto;


export const motivosNotaCredito: TipoNotaCredito[] = [

  'Anulación de la operación',

  'Anulación por error en el RUC',

  'Corrección por error en la descripción',

  'Descuento global o por ítem',

  'Devolución total o por ítem',

  'Bonificaciones',

  'Disminución en el valor',

];

export const motivosNotaDebito: TipoNotaDebito[] = [

  'Intereses por mora',

  'Aumento en el valor',

  'Penalidades',

  'Otros conceptos',

  'Ajustes de operaciones de exportación',

];

// Tipos para el formulario de notas
export interface NotaFormItem {
  productoId: number | null;
  codigo: string;
  productoServicio: string;
  cantidad: number;
  precio: number;
  igv: number;
  importe: number;
}

export interface NotaFormData {
  tipo: TipoNota;
  motivo: TipoNotaCredito | TipoNotaDebito;
  comprobanteRelacionado: {
    id: number;
    tipo: ComprobanteTipo;
    serie: string;
    numero: string;
  };
  cliente: {
    tipoDocumento?: string;
    documento?: string;
    nombre?: string;
    direccion?: string;
    correo?: string;
  };
  detalle: NotaFormItem[];
  fechaEmision: string;
  observaciones?: string;
}