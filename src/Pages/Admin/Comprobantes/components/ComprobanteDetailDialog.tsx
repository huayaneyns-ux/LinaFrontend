import CrudDialog from '../../../../Components/ERP/CrudDialog';
import type { ComprobanteSelectDto } from '../../../../Types/Admin/Comprobantes/Comprobante';
import ComprobanteStatusBadge from './ComprobanteStatusBadge';

interface ComprobanteDetailDialogProps {
  comprobante: ComprobanteSelectDto | null;
  onClose: () => void;
  embedded?: boolean;
}

interface DetailFieldProps {
  label: string;
  value: string | number;
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <div className="erp-form-group">
    <label className="erp-form-label">{label}</label>
    <input className="erp-input" readOnly value={String(value)} />
  </div>
);

const TYPE_LABELS: Record<ComprobanteSelectDto['tipo'], string> = {
  BOLETA: 'Boleta de Venta',
  FACTURA: 'Factura',
  NOTA_CREDITO: 'Nota de Crédito',
  NOTA_DEBITO: 'Nota de Débito',
  LIQUIDACION_COMPRA: 'Liquidación de Compra',
  GUIA_REMISION_REMITENTE: 'Guía de Remisión - Remitente',
  GUIA_REMISION_TRANSPORTISTA: 'Guía de Remisión - Transportista',
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

const DetailBody = ({ comprobante }: { comprobante: ComprobanteSelectDto }) => {
  const isGuide =
    comprobante.tipo === 'GUIA_REMISION_REMITENTE' ||
    comprobante.tipo === 'GUIA_REMISION_TRANSPORTISTA';

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Datos del comprobante</h3>
        <div className="erp-form-grid">
          <DetailField label="Tipo" value={TYPE_LABELS[comprobante.tipo]} />
          <DetailField label="Serie / Número" value={`${comprobante.serie}-${comprobante.numero}`} />
          <DetailField label="Fecha de emisión" value={comprobante.fechaEmision} />
          <div className="erp-form-group">
            <label className="erp-form-label">Estado</label>
            <div className="erp-form-status-value">
              <ComprobanteStatusBadge status={comprobante.estado} showText />
            </div>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Estado SUNAT</label>
            <div className="erp-form-status-value">
              <ComprobanteStatusBadge status={comprobante.estadoSunat} showText />
            </div>
          </div>
        </div>
      </section>

      {isGuide ? (
        <section>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Datos del traslado</h3>
          <div className="erp-form-grid">
            <DetailField label="Remitente" value={comprobante.remitente ?? '—'} />
            <DetailField label="Destinatario" value={comprobante.destinatario ?? '—'} />
            <DetailField label="Motivo de traslado" value={comprobante.motivoTraslado ?? '—'} />
            <DetailField label="Fecha de traslado" value={comprobante.fechaTraslado ?? '—'} />
            <DetailField label="Punto de partida" value={comprobante.puntoPartida ?? '—'} />
            <DetailField label="Punto de llegada" value={comprobante.puntoLlegada ?? '—'} />
            <DetailField
              label="Peso total"
              value={`${comprobante.pesoTotal ?? 0} ${comprobante.unidadMedidaPeso ?? 'KGM'}`}
            />
            {comprobante.transportista && (
              <DetailField label="Transportista" value={comprobante.transportista} />
            )}
            {comprobante.rucTransportista && (
              <DetailField label="RUC transportista" value={comprobante.rucTransportista} />
            )}
            {comprobante.vehiculo && <DetailField label="Vehículo" value={comprobante.vehiculo} />}
            {comprobante.conductor && <DetailField label="Conductor" value={comprobante.conductor} />}
          </div>
          <div className="erp-form-group" style={{ marginTop: '10px' }}>
            <label className="erp-form-label">Bienes transportados</label>
            <input
              className="erp-input"
              readOnly
              value={comprobante.bienesTransportados?.join(', ') ?? '—'}
            />
          </div>
        </section>
      ) : (
        <section>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Datos del cliente</h3>
          <div className="erp-form-grid">
            <DetailField label="Tipo de documento" value={comprobante.tipoDocumentoCliente} />
            <DetailField label="Número" value={comprobante.documentoCliente} />
            <DetailField label="Nombre / Razón social" value={comprobante.cliente} />
            <DetailField label="Dirección" value={comprobante.direccionCliente} />
            <DetailField label="Correo" value={comprobante.correoCliente} />
            {comprobante.fechaVencimiento && (
              <DetailField label="Fecha de vencimiento" value={comprobante.fechaVencimiento} />
            )}
            {comprobante.pago && (
              <DetailField label="Forma de pago" value={comprobante.pago.formaPago} />
            )}
          </div>
          {comprobante.pago?.cuotas?.length ? (
            <div className="erp-form-group" style={{ marginTop: '10px' }}>
              <label className="erp-form-label">Cuotas</label>
              <input
                className="erp-input"
                readOnly
                value={comprobante.pago.cuotas
                  .map(
                    (cuota, index) =>
                      `Cuota ${index + 1}: ${formatAmount(cuota.monto)} vence ${cuota.fechaVencimiento}`,
                  )
                  .join(' · ')}
              />
            </div>
          ) : null}
        </section>
      )}

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Datos SUNAT</h3>
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Estado SUNAT</label>
            <div className="erp-form-status-value">
              <ComprobanteStatusBadge status={comprobante.estadoSunat} showText />
            </div>
          </div>
          <DetailField label="Código de respuesta" value={comprobante.codigoRespuestaSunat} />
          <DetailField label="Mensaje" value={comprobante.mensajeSunat} />
          <DetailField label="Fecha de consulta" value={comprobante.fechaConsultaSunat?.replace("T"," ")} />
          <DetailField label="Fecha de envío" value={comprobante.fechaEnvioSunat?.replace("T"," ")} />
        </div>
      </section>

      {!isGuide && (
        <section>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Datos monetarios</h3>
          <div className="erp-form-grid">
            <DetailField label="Subtotal" value={formatAmount(comprobante.subtotal)} />
            <DetailField label="IGV" value={formatAmount(comprobante.igv)} />
            <DetailField label="Total" value={formatAmount(comprobante.total)} />
          </div>
        </section>
      )}

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Detalle</h3>
        <div className="erp-table-wrapper">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Producto / Servicio</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>IGV</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {comprobante.detalle.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.productoServicio}</td>
                  <td>{item.codigo}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatAmount(item.precio)}</td>
                  <td>{formatAmount(item.igv)}</td>
                  <td>{formatAmount(item.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ComprobanteDetailDialog = ({
  comprobante,
  onClose,
  embedded = false,
}: ComprobanteDetailDialogProps) => {
  if (embedded) {
    if (!comprobante) return null;
    return (
      <div className="erp-form">
        <DetailBody comprobante={comprobante} />
      </div>
    );
  }

  return (
    <CrudDialog
      isOpen={comprobante !== null}
      mode="view"
      onClose={onClose}
      onConfirm={onClose}
      title="Detalle del comprobante"
      subtitle="Información de consulta"
      size="xl"
    >
      {comprobante && <DetailBody comprobante={comprobante} />}
    </CrudDialog>
  );
};

export default ComprobanteDetailDialog;
