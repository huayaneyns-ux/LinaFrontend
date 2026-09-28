import { api } from '../../../Services/apiService';
import type { AuditoriaDto } from '../../../Types/Admin/Seguridad/Auditoria';

const pick = (raw: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
};

const normalize = (raw: Record<string, unknown>): AuditoriaDto => ({
  auditId: Number(pick(raw, 'auditId', 'AuditId') ?? 0),
  schemaName: String(pick(raw, 'schemaName', 'SchemaName') ?? ''),
  tableName: String(pick(raw, 'tableName', 'TableName') ?? ''),
  recordKey: String(pick(raw, 'recordKey', 'RecordKey') ?? ''),
  actionType: String(pick(raw, 'actionType', 'ActionType') ?? ''),
  changedAt: String(pick(raw, 'changedAt', 'ChangedAt') ?? ''),
  changedBy: (pick(raw, 'changedBy', 'ChangedBy') as string | null | undefined) ?? null,
  applicationName: (pick(raw, 'applicationName', 'ApplicationName') as string | null | undefined) ?? null,
  operationName: (pick(raw, 'operationName', 'OperationName') as string | null | undefined) ?? null,
  hostName: (pick(raw, 'hostName', 'HostName') as string | null | undefined) ?? null,
  transactionId: pick(raw, 'transactionId', 'TransactionId') as number | null | undefined,
  oldValues: (pick(raw, 'oldValues', 'OldValues') as string | null | undefined) ?? null,
  newValues: (pick(raw, 'newValues', 'NewValues') as string | null | undefined) ?? null,
});

export const AuditoriaService = {
  getAll: async (): Promise<AuditoriaDto[]> => {
    const raw = await api.request<unknown>('/Auditoria/Lista', { method: 'GET' });
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

    return list.map(item => normalize(item as Record<string, unknown>));
  },
};
