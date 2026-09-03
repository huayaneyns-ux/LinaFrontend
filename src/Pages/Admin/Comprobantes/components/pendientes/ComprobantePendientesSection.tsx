import { useMemo, useState } from 'react';
import type { ComprobanteSelectDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { useComprobantes } from '../../../../../Hooks/useComprobantes';
import type { ColumnDef } from '../../../../../Components/ERP/DataTable';
import { formatDate } from '../../../../../Utils/formatters';
import DataTable from '../../../../../Components/ERP/DataTable';
import Pagination from '../../../../../Components/ERP/Pagination';
import Toolbar from '../../../../../Components/ERP/Toolbar';
import { useDataTable } from '../../../../../Hooks/useDataTable';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';
import ComprobanteActions from '../ComprobanteActions';
import ComprobantePreviewDialog from '../ComprobantePreviewDialog';
import ComprobanteDetailDialog from '../ComprobanteDetailDialog';

const PENDING_SUNAT = new Set(['PENDIENTE', 'EXCEPCION', 'NO_ENVIADO']);

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

export const ComprobantePendientesSection = () => {
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
    actualizarEstadoSunat,
    reenviarSunat,
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
    { key: 'estado', header: 'Estado', sortable: true, width: '110px', render: (row) => <ComprobanteStatusBadge status={row.estado} /> },
    { key: 'estadoSunat', header: 'Estado SUNAT', sortable: true, width: '125px', render: (row) => <ComprobanteStatusBadge status={row.estadoSunat} /> },
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
          onViewDetails={setDetail}
          onUpdateSunat={(id) => void actualizarEstadoSunat(id)}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
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
          newLabel="Refrescar"
          onNew={() => void loadComprobantes()}
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

        <ComprobantePreviewDialog comprobante={preview} onClose={() => setPreview(null)} />
        <ComprobanteDetailDialog comprobante={detail} onClose={() => setDetail(null)} />
      </div>
    </div>
  );
};

export default ComprobantePendientesSection;
