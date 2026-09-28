export interface AuditoriaDto {
  auditId: number;
  schemaName: string;
  tableName: string;
  recordKey: string;
  actionType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  changedAt: string;
  changedBy?: string | null;
  applicationName?: string | null;
  operationName?: string | null;
  hostName?: string | null;
  transactionId?: number | null;
  oldValues?: string | null;
  newValues?: string | null;
}
