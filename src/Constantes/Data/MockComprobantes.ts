import { mockProductos, mockVentas } from './MockData';
import type {
  ComprobanteSelectDto,
  ProductoComprobanteMockDto,
  VentaOrigenComprobanteDto,
} from '../../Types/Admin/Comprobantes/Comprobante';

const mockClientesVenta = [
  { tipoDocumento: 'DNI', documento: '74125896', nombre: 'Juan Pérez', direccion: 'Jr. Los Olivos 225, Lima', correo: 'juan.perez@correo-demo.pe' },
  { tipoDocumento: 'DNI', documento: '46829317', nombre: 'Ana María Solís', direccion: 'Av. Brasil 720, Lima', correo: 'ana.solis@correo-demo.pe' },
  { tipoDocumento: 'DNI', documento: '70983452', nombre: 'Diego Cáceres', direccion: 'Calle Las Palmeras 180, Lima', correo: 'diego.caceres@correo-demo.pe' },
  { tipoDocumento: 'DNI', documento: '72261983', nombre: 'Sofía Benavides', direccion: 'Av. La Marina 430, Lima', correo: 'sofia.benavides@correo-demo.pe' },
] as const;

export const mockProductosComprobante: readonly ProductoComprobanteMockDto[] = mockProductos.map(producto => ({
  id: producto.id,
  codigo: producto.codigo,
  nombre: producto.nombre,
  precio: producto.precio,
}));

export const mockVentasDisponibles: readonly VentaOrigenComprobanteDto[] = mockVentas.map((venta, index) => {
  const cliente = mockClientesVenta[index];
  const subtotal = Number((venta.total / 1.18).toFixed(2));
  const igv = Number((venta.total - subtotal).toFixed(2));
  const producto = mockProductosComprobante[index];

  return {
    id: venta.id,
    codigo: venta.codigo,
    fecha: venta.fecha,
    cliente,
    subtotal,
    igv,
    total: venta.total,
    detalle: [{
      productoId: producto.id,
      codigo: producto.codigo,
      productoServicio: producto.nombre,
      cantidad: 1,
      precio: subtotal,
      igv,
      importe: venta.total,
    }],
  };
});

type MockComprobanteInput = Omit<ComprobanteSelectDto,
  | 'tipoDocumentoCliente'
  | 'direccionCliente'
  | 'correoCliente'
  | 'codigoRespuestaSunat'
  | 'mensajeSunat'
  | 'fechaConsultaSunat'
  | 'fechaEnvioSunat'
  | 'detalle'
  | 'pdfUrl'
  | 'fechaTraslado'
  | 'puntoPartida'
  | 'puntoLlegada'
  | 'pesoTotal'
  | 'unidadMedidaPeso'
  | 'bienesTransportados'
  | 'transportista'
  | 'rucTransportista'
  | 'vehiculo'
  | 'conductor'
> & Partial<Pick<ComprobanteSelectDto,
  | 'tipoDocumentoCliente'
  | 'direccionCliente'
  | 'correoCliente'
  | 'codigoRespuestaSunat'
  | 'mensajeSunat'
  | 'fechaConsultaSunat'
  | 'fechaEnvioSunat'
  | 'detalle'
  | 'pdfUrl'
  | 'fechaTraslado'
  | 'puntoPartida'
  | 'puntoLlegada'
  | 'pesoTotal'
  | 'unidadMedidaPeso'
  | 'bienesTransportados'
  | 'transportista'
  | 'rucTransportista'
  | 'vehiculo'
  | 'conductor'
>>;

const createComprobante = (input: MockComprobanteInput): ComprobanteSelectDto => {
  const isGuide = input.tipo === 'GUIA_REMISION_REMITENTE' || input.tipo === 'GUIA_REMISION_TRANSPORTISTA';
  const sunatAccepted = input.estadoSunat === 'ACEPTADO';

  return {
    ...input,
    tipoDocumentoCliente: input.tipoDocumentoCliente ?? (input.documentoCliente.length === 8 ? 'DNI' : 'RUC'),
    direccionCliente: input.direccionCliente ?? 'Av. Javier Prado 1250, Lima',
    correoCliente: input.correoCliente ?? `contacto${input.id}@correo-demo.pe`,
    codigoRespuestaSunat: input.codigoRespuestaSunat ?? (sunatAccepted ? '0' : input.estadoSunat === 'RECHAZADO' ? '2011' : '98'),
    mensajeSunat: input.mensajeSunat ?? (sunatAccepted ? 'Comprobante aceptado por SUNAT.' : 'Estado de consulta simulado.'),
    fechaConsultaSunat: input.fechaConsultaSunat ?? `${input.fechaEmision}T14:30:00`,
    fechaEnvioSunat: input.fechaEnvioSunat ?? `${input.fechaEmision}T14:00:00`,
    detalle: input.detalle ?? [{
      productoServicio: isGuide ? 'Mercadería para traslado' : 'Útiles de oficina y papelería',
      codigo: `PROD-${String(input.id).padStart(4, '0')}`,
      cantidad: isGuide ? 12 : 1,
      precio: input.subtotal,
      igv: input.igv,
      importe: input.total,
    }],
    fechaTraslado: input.fechaTraslado ?? input.fechaEmision,
    puntoPartida: input.puntoPartida ?? 'Av. Argentina 1450, Callao',
    puntoLlegada: input.puntoLlegada ?? 'Av. Arequipa 850, Lima',
    pesoTotal: input.pesoTotal ?? (isGuide ? 48.5 : undefined),
    unidadMedidaPeso: input.unidadMedidaPeso ?? (isGuide ? 'KGM' : undefined),
    bienesTransportados: input.bienesTransportados ?? (isGuide ? ['Cajas de cuadernos', 'Material de escritorio'] : undefined),
    transportista: input.transportista ?? (input.tipo === 'GUIA_REMISION_TRANSPORTISTA' ? 'Transportes Rápidos del Perú S.A.C.' : undefined),
    rucTransportista: input.rucTransportista ?? (input.tipo === 'GUIA_REMISION_TRANSPORTISTA' ? '20601239876' : undefined),
    vehiculo: input.vehiculo ?? (input.tipo === 'GUIA_REMISION_TRANSPORTISTA' ? 'ABC-123' : undefined),
    conductor: input.conductor ?? (input.tipo === 'GUIA_REMISION_TRANSPORTISTA' ? 'Jorge Ramírez Soto' : undefined),
  };
};

const documentos: MockComprobanteInput[] = [
  { id: 1, tipo: 'BOLETA', serie: 'B001', numero: '00004581', fechaEmision: '2026-08-02', cliente: 'María Fernanda Torres', documentoCliente: '74125896', subtotal: 84.75, igv: 15.25, total: 100, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 2, tipo: 'FACTURA', serie: 'F001', numero: '00001342', fechaEmision: '2026-08-03', cliente: 'Distribuciones El Lapicero S.A.C.', documentoCliente: '20604578123', subtotal: 1250, igv: 225, total: 1475, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 3, tipo: 'BOLETA', serie: 'B001', numero: '00004582', fechaEmision: '2026-08-04', cliente: 'Carlos Alarcón Paredes', documentoCliente: '46829317', subtotal: 41.53, igv: 7.47, total: 49, estado: 'EMITIDO', estadoSunat: 'ENVIADO' },
  { id: 4, tipo: 'NOTA_CREDITO', serie: 'FC01', numero: '00000118', fechaEmision: '2026-08-05', cliente: 'Papelería Horizonte E.I.R.L.', documentoCliente: '20541896721', subtotal: 180, igv: 32.4, total: 212.4, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 5, tipo: 'FACTURA', serie: 'F001', numero: '00001343', fechaEmision: '2026-08-06', cliente: 'Oficina Creativa del Perú S.A.C.', documentoCliente: '20607894561', subtotal: 720, igv: 129.6, total: 849.6, estado: 'BORRADOR', estadoSunat: 'PENDIENTE' },
  { id: 6, tipo: 'GUIA_REMISION_REMITENTE', serie: 'T001', numero: '00000891', fechaEmision: '2026-08-07', cliente: 'Librería San Marcos', documentoCliente: '20587412369', subtotal: 0, igv: 0, total: 0, estado: 'EMITIDO', estadoSunat: 'ACEPTADO', remitente: 'Comercial Lina S.A.C.', destinatario: 'Librería San Marcos', motivoTraslado: 'Venta de mercadería' },
  { id: 7, tipo: 'BOLETA', serie: 'B001', numero: '00004583', fechaEmision: '2026-08-08', cliente: 'Andrea Rojas Cárdenas', documentoCliente: '70983452', subtotal: 67.8, igv: 12.2, total: 80, estado: 'ANULADO', estadoSunat: 'ACEPTADO' },
  { id: 8, tipo: 'LIQUIDACION_COMPRA', serie: 'L001', numero: '00000046', fechaEmision: '2026-08-09', cliente: 'Juan Huamán Quispe', documentoCliente: '28641975', subtotal: 950, igv: 171, total: 1121, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 9, tipo: 'NOTA_DEBITO', serie: 'FD01', numero: '00000027', fechaEmision: '2026-08-10', cliente: 'Importadora Norte Verde S.A.C.', documentoCliente: '20456781239', subtotal: 75, igv: 13.5, total: 88.5, estado: 'EMITIDO', estadoSunat: 'OBSERVADO' },
  { id: 10, tipo: 'FACTURA', serie: 'F001', numero: '00001344', fechaEmision: '2026-08-11', cliente: 'Grupo Educativo Andino S.R.L.', documentoCliente: '20566987412', subtotal: 2140, igv: 385.2, total: 2525.2, estado: 'RECHAZADO', estadoSunat: 'RECHAZADO' },
  { id: 11, tipo: 'GUIA_REMISION_TRANSPORTISTA', serie: 'T002', numero: '00000315', fechaEmision: '2026-08-12', cliente: 'Comercial Ríos S.A.C.', documentoCliente: '20601478523', subtotal: 0, igv: 0, total: 0, estado: 'EMITIDO', estadoSunat: 'ENVIADO', remitente: 'Comercial Lina S.A.C.', destinatario: 'Comercial Ríos S.A.C.', motivoTraslado: 'Traslado entre almacenes' },
  { id: 12, tipo: 'BOLETA', serie: 'B001', numero: '00004584', fechaEmision: '2026-08-13', cliente: 'Luis Alberto Gómez', documentoCliente: '40218765', subtotal: 25.42, igv: 4.58, total: 30, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 13, tipo: 'LIQUIDACION_COMPRA', serie: 'L001', numero: '00000047', fechaEmision: '2026-08-14', cliente: 'Rosa Medina Salazar', documentoCliente: '31874529', subtotal: 600, igv: 108, total: 708, estado: 'BORRADOR', estadoSunat: 'PENDIENTE' },
  { id: 14, tipo: 'NOTA_CREDITO', serie: 'BC01', numero: '00000082', fechaEmision: '2026-08-15', cliente: 'Valeria Campos Díaz', documentoCliente: '72261983', subtotal: 42.37, igv: 7.63, total: 50, estado: 'EMITIDO', estadoSunat: 'ENVIADO' },
  { id: 15, tipo: 'FACTURA', serie: 'F001', numero: '00001345', fechaEmision: '2026-08-16', cliente: 'Corporación Escolar Moderna S.A.C.', documentoCliente: '20609874125', subtotal: 3600, igv: 648, total: 4248, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 16, tipo: 'GUIA_REMISION_REMITENTE', serie: 'T001', numero: '00000892', fechaEmision: '2026-08-17', cliente: 'Distribuidora Las Flores S.A.C.', documentoCliente: '20534876192', subtotal: 0, igv: 0, total: 0, estado: 'EMITIDO', estadoSunat: 'ACEPTADO', remitente: 'Comercial Lina S.A.C.', destinatario: 'Distribuidora Las Flores S.A.C.', motivoTraslado: 'Entrega a cliente' },
  { id: 17, tipo: 'NOTA_DEBITO', serie: 'BD01', numero: '00000019', fechaEmision: '2026-08-18', cliente: 'Marco Antonio León', documentoCliente: '45692178', subtotal: 35, igv: 6.3, total: 41.3, estado: 'ANULADO', estadoSunat: 'ACEPTADO' },
  { id: 18, tipo: 'BOLETA', serie: 'B001', numero: '00004585', fechaEmision: '2026-08-19', cliente: 'Sofía Cabrera Núñez', documentoCliente: '73846125', subtotal: 127.12, igv: 22.88, total: 150, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
  { id: 19, tipo: 'GUIA_REMISION_TRANSPORTISTA', serie: 'T002', numero: '00000316', fechaEmision: '2026-08-20', cliente: 'Almacenes Pacífico S.A.C.', documentoCliente: '20491827365', subtotal: 0, igv: 0, total: 0, estado: 'EMITIDO', estadoSunat: 'OBSERVADO', remitente: 'Comercial Lina S.A.C.', destinatario: 'Almacenes Pacífico S.A.C.', motivoTraslado: 'Traslado para distribución' },
  { id: 20, tipo: 'FACTURA', serie: 'F001', numero: '00001346', fechaEmision: '2026-08-21', cliente: 'Servicios Gráficos del Sur S.A.C.', documentoCliente: '20613245789', subtotal: 480, igv: 86.4, total: 566.4, estado: 'EMITIDO', estadoSunat: 'ACEPTADO' },
];

export const mockComprobantes: readonly ComprobanteSelectDto[] = documentos.map(createComprobante);
