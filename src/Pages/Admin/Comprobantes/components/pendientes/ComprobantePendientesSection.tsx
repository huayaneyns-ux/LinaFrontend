import { useMemo, useState } from 'react';
import type { ComprobanteSelectDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { useComprobantes } from '../../../../../Hooks/useComprobantes';
import type { ColumnDef } from '../../../../../Components/ERP/DataTable';
import { formatDate } from '../../../../../Utils/formatters';
import DataTable from '../../../../../Components/ERP/DataTable';
import Pagination from '../../../../../Components/ERP/Pagination';
import Toolbar from '../../../../../Components/ERP/Toolbar';
import SubmoduleTwoTabsLayout from '../../../../../Components/ERP/SubmoduleTwoTabsLayout';
import { useDataTable } from '../../../../../Hooks/useDataTable';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';
import ComprobanteActions from '../ComprobanteActions';
import ComprobantePreviewDialog from '../ComprobantePreviewDialog';
import ComprobanteDetailDialog from '../ComprobanteDetailDialog';

const PENDING_SUNAT = new Set(['PENDIENTE', 'EXCEPCION', 'NO_ENVIADO']);

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

export const ComprobantePendientesSection = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'view'>('view');
  const [preview, setPreview] = useState<ComprobanteSelectDto | null>(null);
  const [detail, setDetail] = useState<ComprobanteSelectDto | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

  const {
    comprobantes,
    loading,
    updatingSunatId,
    resendingSunatId,
    error,
    successMessage,
    reenviarSunat,
    reenviarTodos,
    loadComprobantes,
    getPDF,
    clearSuccessMessage,
  } = useComprobantes();

  const pendingData = useMemo(
    () => comprobantes.filter((comprobante) => {
      if (comprobante.estado === 'ANULADO') return false;
      return PENDING_SUNAT.has(comprobante.estadoSunat);
    }),
    [comprobantes],
  );

  const resendableIds = useMemo(
    () => pendingData
      .filter((comprobante) => comprobante.estado === 'RECHAZADO' && comprobante.estadoSunat === 'PENDIENTE')
      .map((comprobante) => comprobante.id),
    [pendingData],
  );

  const handleViewDetails = (comprobante: ComprobanteSelectDto) => {
    setDetail(comprobante);
    setFormMode('view');
    setActiveTab('form');
  };

  const {
    processedData,
    totalItems,
    totalPages,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    pagination,
    setPage,
    setPageSize,
  } = useDataTable<ComprobanteSelectDto>({
    data: pendingData,
    searchKeys: ['serie', 'numero', 'cliente', 'documentoCliente', 'mensajeSunat'],
    defaultPageSize: 8,
  });

  const columns: ColumnDef<ComprobanteSelectDto>[] = [
    { key: 'serie', header: 'Serie', sortable: true, width: '90px', render: (row) => <strong>{row.serie}</strong> },
    { key: 'numero', header: 'Número', sortable: true, width: '120px' },
    { key: 'fechaEmision', header: 'Fecha', sortable: true, width: '120px', render: (row) => formatDate(row.fechaEmision) },
    { key: 'tipo', header: 'Tipo', sortable: true, width: '150px' },
    { key: 'cliente', header: 'Cliente', sortable: true },
    { key: 'total', header: 'Total', sortable: true, width: '110px', align: 'right', render: (row) => formatAmount(row.total) },
    { key: 'estado', header: 'Estado', sortable: true, width: '56px', align: 'center', className: 'col-status', render: (row) => <ComprobanteStatusBadge status={row.estado} /> },
    { key: 'estadoSunat', header: 'SUNAT', sortable: true, width: '56px', align: 'center', className: 'col-status', render: (row) => <ComprobanteStatusBadge status={row.estadoSunat} /> },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      width: '130px',
      render: (row) => (
        <ComprobanteActions
          comprobante={row}
          isUpdatingSunat={updatingSunatId === row.id}
          isResendingSunat={resendingSunatId === row.id}
          isDownloading={downloadingId === row.id}
          onViewComprobante={setPreview}
          onViewDetails={handleViewDetails}
          onResendSunat={(id) => void reenviarSunat(id)}
          hideUpdateSunat
          hideDeleteDocument
          onDownloadPDF={async (comprobante) => {
            try {
              setDownloadingId(comprobante.id);
              await getPDF(String(comprobante.id), 'A4', `${comprobante.serie}-${comprobante.numero}`);
            } finally {
              setDownloadingId(null);
            }
          }}
        />
      ),
    },
  ];

  const listContent = (
    <div className="erp-tab-content">
      {error && (
        <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>
          {error}
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-success-light)', color: 'var(--erp-success)', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span>{successMessage}</span>
          <button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={clearSuccessMessage}>Cerrar</button>
        </div>
      )}

      <Toolbar
        searchPlaceholder="Buscar por serie, número, cliente o mensaje..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={false}
        onToggleFilters={() => undefined}
        filterCount={0}
        onResetFilters={undefined}
        extraActions={(
          <>
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-secondary"
              onClick={() => void loadComprobantes()}
            >
              Refrescar
            </button>
            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-primary"
              disabled={resendableIds.length === 0 || resendingSunatId !== null}
              onClick={() => void reenviarTodos(resendableIds)}
            >
              Enviar rechazados pendientes ({resendableIds.length})
            </button>
          </>
        )}
      />

      <DataTable
        columns={columns}
        data={processedData}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyMessage="No hay documentos pendientes de SUNAT."
      />

      <Pagination
        page={pagination.page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pagination.pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );

  const formContent = detail ? (
    <ComprobanteDetailDialog
      embedded
      comprobante={detail}
      onClose={() => setActiveTab('list')}
    />
  ) : null;

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Pendientes SUNAT"
        subtitle="Documentos con envío o respuesta pendiente"
        entityName="Comprobante"
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'form' && !detail) return;
          setActiveTab(tab);
        }}
        formMode={formMode}
        listContent={listContent}
        formContent={formContent}
      />
      <ComprobantePreviewDialog comprobante={preview} onClose={() => setPreview(null)} />
    </>
  );
};

export default ComprobantePendientesSection;
