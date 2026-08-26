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

// Guías de remisión: contrato local usado mientras el proyecto no expone API propia.
export type GuiaRemisionTipo = 'GUIA_REMISION_REMITENTE' | 'GUIA_REMISION_TRANSPORTISTA';
export type MotivoTrasladoRemitente = 'Venta' | 'Venta sujeta a confirmación' | 'Compra' | 'Devolución' | 'Consignación' | 'Traslado entre establecimientos de la misma empresa' | 'Traslado de bienes para transformación' | 'Recojo de bienes' | 'Traslado por emisor itinerante' | 'Traslado a zona primaria' | 'Venta con entrega a terceros' | 'Importación' | 'Exportación' | 'Otros';
export type ModalidadTransporte = 'TRANSPORTE_PRIVADO' | 'TRANSPORTE_PUBLICO';
export interface Ubicacion { departamento: string; provincia: string; distrito: string; direccion: string; codigoEstablecimiento?: string; rucAsociado?: string }
export interface PersonaDocumento { tipoDocumento: string; numeroDocumento: string; nombre: string }
export interface DatosTransportista { ruc?: string; razonSocial?: string; registroMTC?: string }
export interface DatosVehiculo { placa?: string; marca?: string; modelo?: string; numeroAutorizacion?: string; entidadEmisora?: string }
export interface DatosConductor { tipoDocumento: string; numeroDocumento: string; nombre: string; licenciaConducir?: string; apellidos?: string }
export interface DatosPersonaGuia { nombre: string; ruc: string }
export interface DatosAduanerosGuia { contenedores: Array<{ numero: string; precinto: string }>; tipoPuntoAduanero: 'PUERTO' | 'AEROPUERTO' | ''; puntoAduanero: string; cantidadBultos?: number }
export interface BienTransportado { descripcion: string; cantidad: number; unidadMedida: string; pesoUnitario?: number; pesoTotal?: number }
export interface GuiaRemisionRemitenteFormData { tipo: 'GUIA_REMISION_REMITENTE'; serie: string; numero: string; fechaEmision: string; fechaInicioTraslado: string; destinatario: PersonaDocumento; motivoTraslado: MotivoTrasladoRemitente; modalidadTransporte: ModalidadTransporte; puntoPartida: Ubicacion; puntoLlegada: Ubicacion; transportista?: DatosTransportista; vehiculos?: DatosVehiculo[]; conductores?: DatosConductor[]; retornoVehiculoVacio?: boolean; retornoEnvasesVacios?: boolean; transbordoProgramado?: boolean; vehiculosCategoriaM1L?: boolean; trasladoTotal?: boolean; datosTransportista?: boolean; proveedor?: DatosPersonaGuia; comprador?: DatosPersonaGuia; descripcionMotivo?: string; datosAduaneros?: DatosAduanerosGuia; bienes: BienTransportado[]; pesoBrutoTotal: number; unidadMedidaPeso: string; observaciones?: string }
export interface GuiaRemisionTransportistaFormData { tipo: 'GUIA_REMISION_TRANSPORTISTA'; serie: string; numero: string; fechaEmision: string; fechaInicioTraslado: string; transportista: DatosTransportista; remitente: PersonaDocumento; destinatario: PersonaDocumento; guiaRemitenteRelacionada?: { id: number; serie: string; numero: string }; puntoPartida: Ubicacion; puntoLlegada: Ubicacion; vehiculos: DatosVehiculo[]; conductores: DatosConductor[]; bienes: BienTransportado[]; pesoBrutoTotal: number; unidadMedidaPeso: string; observaciones?: string }
export type GuiaRemisionFormData = GuiaRemisionRemitenteFormData | GuiaRemisionTransportistaFormData;
export interface GuiaRemisionSelectDto { id: number; tipo: GuiaRemisionTipo; serie: string; numero: string; fechaEmision: string; fechaTraslado: string; remitente?: string; destinatario?: string; motivoTraslado?: string; puntoPartida?: string; puntoLlegada?: string; pesoTotal?: number; unidadMedidaPeso?: string; estado: ComprobanteEstado; estadoSunat: ComprobanteEstadoSunat; transportista?: string }
