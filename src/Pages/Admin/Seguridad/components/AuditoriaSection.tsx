import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import { useDataTable, type SortConfig, type SortDirection } from '../../../../Hooks/useDataTable';
import { AuditoriaService, type AuditoriaPage } from '../../../../Services/Admin/Seguridad/Auditoria';
import type { AuditoriaDto } from '../../../../Types/Admin/Seguridad/Auditoria';
import { IntegracionService } from '../../../../Services/Admin/Integracion';
import type { IntegracionAuditoria } from '../../../../Types/Admin/Integracion';
import '../../../../Components/ERP/AdminModuleLayout.css';
import './AuditoriaSection.css';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PE');
};

const formatJson = (value?: string | null) => {
  if (!value) return 'Sin datos';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const actionStatus = (action: string) => {
  if (action === 'INSERT') return 'ACTIVO';
  if (action === 'DELETE') return 'INACTIVO';
  return 'PENDIENTE';
};

const AuditoriaSection = () => {
  const [items, setItems] = useState<AuditoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | undefined>();
  const [integracionAudit, setIntegracionAudit] = useState<IntegracionAuditoria[]>([]);
  const [auditPage, setAuditPage] = useState({ page: 1, pageSize: 10 });
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSort, setAuditSort] = useState<SortConfig<AuditoriaDto>>({ key: null, direction: null });
  const [auditTotals, setAuditTotals] = useState<Pick<AuditoriaPage, 'totalItems' | 'totalPages'>>({ totalItems: 0, totalPages: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [general, integration] = await Promise.all([
        AuditoriaService.getPage({
          ...auditPage,
          search: auditSearch,
          sortBy: auditSort.key ? String(auditSort.key) : undefined,
          sortDirection: auditSort.direction,
        }),
        IntegracionService.getAudit(),
      ]);
      setItems(general.items);
      setAuditTotals({ totalItems: general.totalItems, totalPages: general.totalPages });
      setIntegracionAudit(integration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la auditoría.');
    } finally {
      setLoading(false);
    }
  }, [auditPage, auditSearch, auditSort]);

  useEffect(() => { void load(); }, [load]);

  const handleAuditSearch = useCallback((value: string) => {
    setAuditSearch(value);
    setAuditPage(current => ({ ...current, page: 1 }));
  }, []);

  const handleAuditSort = useCallback((key: keyof AuditoriaDto) => {
    setAuditSort(current => {
      if (current.key !== key) return { key, direction: 'asc' };
      const next: SortDirection = current.direction === 'asc' ? 'desc' : null;
      return { key: next ? key : null, direction: next };
    });
    setAuditPage(current => ({ ...current, page: 1 }));
  }, []);

  const integrationTable = useDataTable<IntegracionAuditoria>({
    data: integracionAudit,
    searchKeys: ['empresa', 'empresaOrigen', 'empresaDestino', 'operacion', 'estado', 'ipOrigen'],
    defaultPageSize: 10,
  });

  const integrationColumns = useMemo(() => [
    { key: 'empresaOrigen', header: 'Empresa origen', sortable: true, minWidth: '180px' },
    { key: 'empresaDestino', header: 'Empresa destino', sortable: true, minWidth: '180px' },
    { key: 'operacion', header: 'Operación', sortable: true, minWidth: '190px' },
    { key: 'fechaInicio', header: 'Inicio', sortable: true, minWidth: '175px', render: (row: IntegracionAuditoria) => formatDate(row.fechaInicio) },
    { key: 'fechaFin', header: 'Finalización', sortable: true, minWidth: '175px', render: (row: IntegracionAuditoria) => formatDate(row.fechaFin ?? '') },
    { key: 'duracionMs', header: 'Demora', sortable: true, minWidth: '105px', render: (row: IntegracionAuditoria) => row.duracionMs == null ? '—' : `${row.duracionMs} ms` },
    { key: 'registrosEnviados', header: 'Registros', sortable: true, minWidth: '100px' },
    { key: 'estado', header: 'Estado', sortable: true, minWidth: '125px', render: (row: IntegracionAuditoria) => <StatusBadge status={row.estado === 'EXITOSO' ? 'ACTIVO' : 'PENDIENTE'} label={row.estado} showText /> },
  ], []);

  const columns = useMemo(() => [
    { key: 'auditId', header: 'ID', sortable: true, width: '80px' },
    { key: 'changedAt', header: 'Fecha', sortable: true, width: '170px', render: (row: AuditoriaDto) => formatDate(row.changedAt) },
    { key: 'tableName', header: 'Tabla', sortable: true, width: '150px', render: (row: AuditoriaDto) => <strong>{row.schemaName}.{row.tableName}</strong> },
    { key: 'recordKey', header: 'Registro', sortable: true, width: '130px' },
    { key: 'actionType', header: 'Acción', sortable: true, width: '110px', align: 'center' as const, render: (row: AuditoriaDto) => <StatusBadge status={actionStatus(row.actionType)} label={row.actionType} showText /> },
    { key: 'changedBy', header: 'Usuario', sortable: true, width: '190px', render: (row: AuditoriaDto) => row.changedBy || '—' },
    { key: 'operationName', header: 'Operación', sortable: true, render: (row: AuditoriaDto) => row.operationName || '—' },
    { key: 'actions', header: '', width: '54px', align: 'center' as const, render: (row: AuditoriaDto) => expandedId === row.auditId ? <FiChevronDown /> : <FiChevronRight /> },
  ], [expandedId]);

  return (
    <div className="erp-module-page">
      <div className="erp-page-header">
        <div className="erp-page-header-heading">
          <div className="erp-page-header-title-wrap">
            <h1 className="erp-page-header-title">Auditoría</h1>
            <p className="erp-page-header-subtitle">Consulta los cambios internos y las peticiones recibidas desde sistemas externos.</p>
          </div>
          <div className="erp-page-header-actions">
            <button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => void load()} disabled={loading}>
              <FiRefreshCw /> Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="erp-form-card audit-card">
        <Toolbar
          searchValue={auditSearch}
          onSearchChange={handleAuditSearch}
          searchPlaceholder="Buscar tabla, registro, usuario..."
          showFilters={false}
          alwaysShowFilters={true}
        />
        {error && <div className="erp-alert erp-alert-error">{error}</div>}
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          sortConfig={auditSort}
          onSort={handleAuditSort}
          rowKey={row => row.auditId}
          expandedRowKey={expandedId}
          onRowClick={row => setExpandedId(current => current === row.auditId ? undefined : row.auditId)}
          renderExpanded={row => (
            <div className="audit-detail-grid">
              <div><strong>Aplicación</strong><span>{row.applicationName || '—'}</span></div>
              <div><strong>Host</strong><span>{row.hostName || '—'}</span></div>
              <div><strong>Transacción</strong><span>{row.transactionId ?? '—'}</span></div>
              <div><strong>Valores anteriores</strong><pre>{formatJson(row.oldValues)}</pre></div>
              <div><strong>Valores nuevos</strong><pre>{formatJson(row.newValues)}</pre></div>
            </div>
          )}
          emptyMessage="No se encontraron registros de auditoría"
        />
        <Pagination
          page={auditPage.page}
          totalPages={auditTotals.totalPages}
          pageSize={auditPage.pageSize}
          totalItems={auditTotals.totalItems}
          onPageChange={page => setAuditPage(current => ({ ...current, page }))}
          onPageSizeChange={pageSize => setAuditPage({ page: 1, pageSize })}
        />
      </div>

      <div className="erp-form-card audit-card">
        <div className="erp-page-header-heading">
          <div className="erp-page-header-title-wrap">
            <h2 className="erp-page-header-title">Auditoría de integraciones</h2>
            <p className="erp-page-header-subtitle">Peticiones realizadas por empresas externas, con fechas, operación y tiempo de respuesta.</p>
          </div>
        </div>
        <DataTable
          columns={integrationColumns}
          data={integrationTable.processedData}
          loading={loading}
          sortConfig={integrationTable.sortConfig}
          onSort={integrationTable.handleSort}
          rowKey={row => row.id}
          emptyMessage="No hay auditoría de integración"
        />
        <Pagination
          page={integrationTable.pagination.page}
          totalPages={integrationTable.totalPages}
          pageSize={integrationTable.pagination.pageSize}
          totalItems={integrationTable.totalItems}
          onPageChange={integrationTable.setPage}
          onPageSizeChange={integrationTable.setPageSize}
        />
      </div>
    </div>
  );
};

export default AuditoriaSection;
