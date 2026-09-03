import { api } from '../../apiService';
import type { SunatTransmissionItemDto } from '../../../Types/Admin/Comprobantes/Comprobante';
function normalizeTransmission(raw: Record<string, unknown>): SunatTransmissionItemDto {
  const createdAt = String(raw.createdAt ?? raw.CreatedAt ?? '');
  const respondedAt = raw.respondedAt ?? raw.RespondedAt;
  const respondedAtStr = respondedAt ? String(respondedAt) : null;

  let responseTimeMs: number | null = null;
  if (raw.responseTimeMs !== undefined && raw.responseTimeMs !== null) {
    const parsed = Number(raw.responseTimeMs);
    responseTimeMs = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  } else if (raw.ResponseTimeMs !== undefined && raw.ResponseTimeMs !== null) {
    const parsed = Number(raw.ResponseTimeMs);
    responseTimeMs = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  } else if (createdAt && respondedAtStr) {
    const diff = new Date(respondedAtStr).getTime() - new Date(createdAt).getTime();
    if (!Number.isNaN(diff) && diff >= 0) {
      responseTimeMs = diff;
    }
  }

  return {
    id: String(raw.id ?? raw.Id ?? ''),
    voucherId: String(raw.voucherId ?? raw.VoucherId ?? ''),
    attemptNumber: Number(raw.attemptNumber ?? raw.AttemptNumber ?? 1),
    operationType: String(raw.operationType ?? raw.OperationType ?? 'SEND'),
    transmissionStatus: String(raw.transmissionStatus ?? raw.TransmissionStatus ?? 'PENDING'),
    httpStatus: raw.httpStatus !== null && raw.httpStatus !== undefined
      ? Number(raw.httpStatus)
      : raw.HttpStatus !== null && raw.HttpStatus !== undefined
        ? Number(raw.HttpStatus)
        : null,
    sunatStatus: (raw.sunatStatus ?? raw.SunatStatus) as SunatTransmissionItemDto['sunatStatus'],
    sunatDocumentId: (raw.sunatDocumentId ?? raw.SunatDocumentId) ? String(raw.sunatDocumentId ?? raw.SunatDocumentId) : null,
    errorMessage: (raw.errorMessage ?? raw.ErrorMessage) ? String(raw.errorMessage ?? raw.ErrorMessage) : null,
    respondedAt: respondedAtStr,
    createdAt,
    responseTimeMs,
    voucherTypeCode: (raw.voucherTypeCode ?? raw.VoucherTypeCode) ? String(raw.voucherTypeCode ?? raw.VoucherTypeCode) : undefined,
    series: (raw.series ?? raw.Series) ? String(raw.series ?? raw.Series) : undefined,
    number: (raw.number ?? raw.Number) ? String(raw.number ?? raw.Number) : undefined,
    total: raw.total !== null && raw.total !== undefined
      ? Number(raw.total)
      : raw.Total !== null && raw.Total !== undefined
        ? Number(raw.Total)
        : undefined,
    customerName: (raw.customerName ?? raw.CustomerName) ? String(raw.customerName ?? raw.CustomerName) : undefined,
  };
}

export const SunatTransmissionService = {
  async getTransmisiones(): Promise<SunatTransmissionItemDto[]> {
    try {
      const data = await api.request<Record<string, unknown>[]>(
        '/facturacion/comprobantes/transmisiones-sunat',
        { method: 'GET' },
      );

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map(normalizeTransmission);
    } catch (error) {
      console.error('No se pudo cargar SunatTransmission desde la API/DB', error);
      return [];
    }
  },
};
