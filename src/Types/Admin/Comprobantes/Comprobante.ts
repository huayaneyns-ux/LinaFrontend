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

export type ComprobanteEmitibleTipo = 'BOLETA' | 'FACTURA' | 'LIQUIDACION_COMPRA';
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
  | 'Otros conceptos';


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
  motivoDescripcion?: string;
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
// Guías de remisión: contrato local usado mientras el proyecto no expone API propia.

export type GuiaRemisionTipo =
  | 'GUIA_REMISION_REMITENTE'
  | 'GUIA_REMISION_TRANSPORTISTA';

export type MotivoTrasladoRemitente =
  | 'Venta'
  | 'Venta sujeta a confirmación'
  | 'Compra'
  | 'Devolución'
  | 'Consignación'
  | 'Traslado entre establecimientos de la misma empresa'
  | 'Traslado de bienes para transformación'
  | 'Recojo de bienes'
  | 'Traslado por emisor itinerante'
  | 'Venta con entrega a terceros'
  | 'Otros';

export type ModalidadTransporte =
  | 'TRANSPORTE_PRIVADO'
  | 'TRANSPORTE_PUBLICO';

export interface Ubicacion {
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  codigoEstablecimiento?: string;
  rucAsociado?: string;
}

export interface PersonaDocumento {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
}

export interface DatosTransportista {
  ruc?: string;
  razonSocial?: string;
  registroMTC?: string;
}

export interface DatosVehiculo {
  placa?: string;
  marca?: string;
  modelo?: string;
  numeroAutorizacion?: string;
  entidadEmisora?: string;
}

export interface DatosConductor {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  licenciaConducir?: string;
  apellidos?: string;
}

export interface DatosPersonaGuia {
  nombre: string;
  ruc: string;
}

export interface DatosAduanerosGuia {
  contenedores: Array<{
    numero: string;
    precinto: string;
  }>;
  tipoPuntoAduanero: 'PUERTO' | 'AEROPUERTO' | '';
  puntoAduanero: string;
  cantidadBultos?: number;
}

export interface BienTransportado {
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  pesoUnitario?: number;
  pesoTotal?: number;
}

export interface GuiaRemisionRemitenteFormData {
  tipo: 'GUIA_REMISION_REMITENTE';
  serie: string;
  numero: string;
  fechaEmision: string;
  fechaInicioTraslado: string;
  destinatario: PersonaDocumento;
  motivoTraslado: MotivoTrasladoRemitente;
  modalidadTransporte: ModalidadTransporte;
  puntoPartida: Ubicacion;
  puntoLlegada: Ubicacion;
  transportista?: DatosTransportista;
  vehiculos?: DatosVehiculo[];
  conductores?: DatosConductor[];
  retornoVehiculoVacio?: boolean;
  retornoEnvasesVacios?: boolean;
  transbordoProgramado?: boolean;
  vehiculosCategoriaM1L?: boolean;
  trasladoTotal?: boolean;
  datosTransportista?: boolean;
  proveedor?: DatosPersonaGuia;
  comprador?: DatosPersonaGuia;
  descripcionMotivo?: string;
  datosAduaneros?: DatosAduanerosGuia;
  bienes: BienTransportado[];
  pesoBrutoTotal: number;
  unidadMedidaPeso: string;
  observaciones?: string;
}

export interface GuiaRemisionTransportistaFormData {
  tipo: 'GUIA_REMISION_TRANSPORTISTA';
  serie: string;
  numero?: string;
  fechaEmision: string;
  fechaInicioTraslado: string;
  transportista: DatosTransportista;
  remitente: PersonaDocumento;
  destinatario: PersonaDocumento;
  guiaRemitenteRelacionada?: {
    id: number;
    serie: string;
    numero: string;
  };
  fletePagadoPor?: 'REMITENTE' | 'SUBCONTRATADOR' | 'TERCERO';
  terceroFlete?: PersonaDocumento;

  transporteSubcontratado?: boolean;
  retornoVehiculoVacio?: boolean,
  retornoEnvasesVacios?: boolean,
  transbordoProgramado?: boolean,
  trasladoTotalBienes?: boolean,

  empresaSubcontrata?: string;
  rucEmpresaSubcontrata?: string;
  puntoPartida: Ubicacion;
  puntoLlegada: Ubicacion;
  vehiculos: DatosVehiculo[];
  conductores: DatosConductor[];
  bienes: BienTransportado[];
  pesoBrutoTotal: number;
  unidadMedidaPeso: string;
  observaciones?: string;
}

export type GuiaRemisionFormData =
  | GuiaRemisionRemitenteFormData
  | GuiaRemisionTransportistaFormData;

export interface GuiaRemisionSelectDto {
  id: number;
  tipo: GuiaRemisionTipo;
  serie: string;
  numero: string;
  fechaEmision: string;
  fechaTraslado: string;
  remitente?: string;
  destinatario?: string;
  motivoTraslado?: string;
  puntoPartida?: string;
  puntoLlegada?: string;
  pesoTotal?: number;
  unidadMedidaPeso?: string;
  estado: ComprobanteEstado;
  estadoSunat: ComprobanteEstadoSunat;
  transportista?: string;
}

// ==========================================
// CONTRATO SUNAT - BOLETA Y FACTURA ELECTRÓNICA
// ==========================================

export interface SunatCbcText {
  _text: string | number;
}

export interface SunatCbcWithAttributes {
  _attributes: Record<string, string>;
  _text: string | number;
}

export interface SunatNoteItem {
  _text: string;
  _attributes: {
    languageLocaleID: string;
  };
}

export interface SunatPartyIdentification {
  'cbc:ID': {
    _attributes: {
      schemeID: string;
    };
    _text: string;
  };
}

export interface SunatPartyLegalEntity {
  'cbc:RegistrationName'?: {
    _text: string;
  };
  'cbc:CompanyID'?: {
    _text: string;
  };
  'cac:RegistrationAddress'?: {
    'cbc:AddressTypeCode'?: {
      _text: string;
    };
    'cac:AddressLine'?: {
      'cbc:Line': {
        _text: string;
      };
    };
  };
}

export interface SunatParty {
  'cac:PartyIdentification'?: SunatPartyIdentification;
  'cac:PartyName'?: {
    'cbc:Name': {
      _text: string;
    };
  };
  'cac:PartyLegalEntity': SunatPartyLegalEntity;
}

export interface SunatAccountingParty {
  'cac:Party': SunatParty;
}

export interface SunatTaxScheme {
  'cbc:ID': {
    _text: string;
  };
  'cbc:Name': {
    _text: string;
  };
  'cbc:TaxTypeCode': {
    _text: string;
  };
}

export interface SunatTaxCategory {
  'cbc:Percent'?: {
    _text: number;
  };
  'cbc:TaxExemptionReasonCode'?: {
    _text: string;
  };
  'cac:TaxScheme': SunatTaxScheme;
}

export interface SunatTaxSubtotal {
  'cbc:TaxableAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cbc:TaxAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cac:TaxCategory': SunatTaxCategory;
}

export interface SunatTaxTotal {
  'cbc:TaxAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cac:TaxSubtotal': SunatTaxSubtotal[];
}

export interface SunatLegalMonetaryTotal {
  'cbc:LineExtensionAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cbc:TaxInclusiveAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cbc:PayableAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
}

export interface SunatInvoiceLine {
  'cbc:ID': {
    _text: string;
  };
  'cbc:InvoicedQuantity': {
    _attributes: {
      unitCode: string;
    };
    _text: string;
  };
  'cbc:LineExtensionAmount': {
    _attributes: {
      currencyID: string;
    };
    _text: string;
  };
  'cac:PricingReference': {
    'cac:AlternativeConditionPrice': {
      'cbc:PriceAmount': {
        _attributes: {
          currencyID: string;
        };
        _text: string;
      };
      'cbc:PriceTypeCode': {
        _text: string;
      };
    };
  };
  'cac:TaxTotal': {
    'cbc:TaxAmount': {
      _attributes: {
        currencyID: string;
      };
      _text: string;
    };
    'cac:TaxSubtotal': Array<{
      'cbc:TaxableAmount': {
        _attributes: {
          currencyID: string;
        };
        _text: string;
      };
      'cbc:TaxAmount': {
        _attributes: {
          currencyID: string;
        };
        _text: string;
      };
      'cac:TaxCategory': {
        'cbc:Percent': {
          _text: number;
        };
        'cbc:TaxExemptionReasonCode': {
          _text: string;
        };
        'cac:TaxScheme': {
          'cbc:ID': {
            _text: string;
          };
          'cbc:Name': {
            _text: string;
          };
          'cbc:TaxTypeCode': {
            _text: string;
          };
        };
      };
    }>;
  };
  'cac:Item': {
    'cbc:Description': {
      _text: string;
    };
  };
  'cac:Price': {
    'cbc:PriceAmount': {
      _attributes: {
        currencyID: string;
      };
      _text: string;
    };
  };
}

export interface SunatInvoiceDocumentBody {
  'cbc:UBLVersionID': {
    _text: string;
  };
  'cbc:CustomizationID': {
    _text: string;
  };
  'cbc:ID': {
    _text: string;
  };
  'cbc:IssueDate': {
    _text: string;
  };
  'cbc:IssueTime': {
    _text: string;
  };
  'cbc:InvoiceTypeCode': {
    _attributes: {
      listID: string;
    };
    _text: '01' | '03';
  };
  'cbc:Note': SunatNoteItem[];
  'cbc:DocumentCurrencyCode': {
    _text: string;
  };
  'cac:AccountingSupplierParty': SunatAccountingParty;
  'cac:AccountingCustomerParty': SunatAccountingParty;
  'cac:TaxTotal': SunatTaxTotal;
  'cac:LegalMonetaryTotal': SunatLegalMonetaryTotal;
  'cac:InvoiceLine': SunatInvoiceLine[];
}

export interface SunatDocumentPayload {
  personaId: string;
  personaToken: string;
  fileName: string;
  documentBody: SunatInvoiceDocumentBody | Record<string, any>;
}

export interface SunatSendResult {
  success: boolean;
  status: ComprobanteEstadoSunat;
  codigoRespuestaSunat: string;
  mensajeSunat: string;
  responseTime: string;
  cdr?: {
    status?: string;
    responseCode?: string;
    description?: string;
    notes?: string[];
  };
  pdfUrl?: string;
  xmlUrl?: string;
  cdrUrl?: string;
  error?: string;
}