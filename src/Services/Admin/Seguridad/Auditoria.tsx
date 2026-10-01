import { api } from '../../../Services/apiService';
import type { AuditoriaDto } from '../../../Types/Admin/Seguridad/Auditoria';

export interface AuditoriaPage {
  items: AuditoriaDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

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
  getPage: async (params: { page: number; pageSize: number; search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' | null }): Promise<AuditoriaPage> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.sortBy && params.sortDirection) {
      query.set('sortBy', params.sortBy);
      query.set('sortDirection', params.sortDirection);
    }
    const raw = await api.request<Record<string, unknown>>(`/Auditoria/Lista?${query.toString()}`, { method: 'GET' });
    const items = Array.isArray(raw.items) ? raw.items : [];
    return {
      items: items.map(item => normalize(item as Record<string, unknown>)),
      page: Number(raw.page ?? params.page),
      pageSize: Number(raw.pageSize ?? params.pageSize),
      totalItems: Number(raw.totalItems ?? 0),
      totalPages: Number(raw.totalPages ?? 1),
    };
  },
};
