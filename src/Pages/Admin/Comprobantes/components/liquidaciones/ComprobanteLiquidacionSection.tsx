import { useMemo, useState } from 'react';
import type { ComprobanteEstado, ComprobanteSelectDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import FormField from '../../../../../Components/ERP/FormField';
import type { ColumnDef } from '../../../../../Components/ERP/DataTable';
import DataTable from '../../../../../Components/ERP/DataTable';
import Pagination from '../../../../../Components/ERP/Pagination';
import Toolbar from '../../../../../Components/ERP/Toolbar';
import { useComprobantes } from '../../../../../Hooks/useComprobantes';
import { useDataTable } from '../../../../../Hooks/useDataTable';
import { formatDate } from '../../../../../Utils/formatters';
import ComprobanteActions from '../ComprobanteActions';
import ComprobanteDetailDialog from '../ComprobanteDetailDialog';
import ComprobantePreviewDialog from '../ComprobantePreviewDialog';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';
import NewComprobanteLiquidacionDialog from './NewComprobanteLiquidacionDialog';

interface Filters {
  estado: ComprobanteEstado | '';
  estadoSunat: 'PENDIENTE' | 'EXCEPCION' | 'ACEPTADO' | 'RECHAZADO' | '';
  fechaDesde: string;
  fechaHasta: string;
}

const DEFAULT_FILTERS: Filters = {
  estado: '',
  estadoSunat: '',
  fechaDesde: '',
  fechaHasta: '',
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

export const ComprobanteLiquidacionSection = () => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [preview, setPreview] = useState<ComprobanteSelectDto | null>(null);
  const [detail, setDetail] = useState<ComprobanteSelectDto | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [voidReasonDialog, setVoidReasonDialog] = useState<{ open: boolean; comprobante: ComprobanteSelectDto | null }>({ open: false, comprobante: null });
  const [voidReason, setVoidReason] = useState('');

  const {
    comprobantes,
    comprasDisponibles,
    loading,
    generating,
    updatingSunatId,
    error,
    successMessage,
    actualizarEstadoSunat,
    crearLiquidacion,
    getPDF,
    voidBill,
    clearSuccessMessage,
  } = useComprobantes();

  const filteredData = useMemo(() => comprobantes.filter((comprobante) => {
    if (comprobante.tipo !== 'LIQUIDACION_COMPRA') return false;
    if (filters.estado && comprobante.estado !== filters.estado) return false;
    if (filters.estadoSunat && comprobante.estadoSunat !== filters.estadoSunat) return false;
    if (filters.fechaDesde && comprobante.fechaEmision < filters.fechaDesde) return false;
    if (filters.fechaHasta && comprobante.fechaEmision > filters.fechaHasta) return false;
    return true;
  }), [comprobantes, filters]);

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
    data: filteredData,
    searchKeys: ['serie', 'numero', 'cliente', 'documentoCliente'],
    defaultPageSize: 8,
  });

  const columns: ColumnDef<ComprobanteSelectDto>[] = [
    { key: 'serie', header: 'Serie', sortable: true, width: '90px', render: (row) => <strong>{row.serie}</strong> },
    { key: 'numero', header: 'Número', sortable: true, width: '120px' },
    { key: 'fechaEmision', header: 'Fecha', sortable: true, width: '120px', render: (row) => formatDate(row.fechaEmision) },
    { key: 'cliente', header: 'Vendedor', sortable: true },
    { key: 'documentoCliente', header: 'Documento', sortable: true, width: '130px' },
    { key: 'total', header: 'Total', sortable: true, width: '110px', align: 'right', render: (row) => formatAmount(row.total) },
    { key: 'estado', header: 'Estado', sortable: true, width: '110px', render: (row) => <ComprobanteStatusBadge status={row.estado} /> },
    { key: 'estadoSunat', header: 'Estado SUNAT', sortable: true, width: '125px', render: (row) => <ComprobanteStatusBadge status={row.estadoSunat} /> },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      width: '120px',
      render: (row) => (
        <ComprobanteActions
          comprobante={row}
          isUpdatingSunat={updatingSunatId === row.id}
          isDownloading={downloadingId === row.id}
          isDeleting={deletingId === row.id}
          onViewComprobante={setPreview}
          onViewDetails={setDetail}
          onUpdateSunat={(id) => void actualizarEstadoSunat(id)}
          onDownloadPDF={async (comprobante) => {
            try {
              setDownloadingId(comprobante.id);
              await getPDF(String(comprobante.id), 'A4', `${comprobante.serie}-${comprobante.numero}`);
            } finally {
              setDownloadingId(null);
            }
          }}
          onDeleteDocument={(comprobante) => setVoidReasonDialog({ open: true, comprobante })}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
      <div className="erp-tab-content">
        {error && <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}
        {successMessage && (
          <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-success-light)', color: 'var(--erp-success)', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>{successMessage}</span>
            <button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={clearSuccessMessage}>Cerrar</button>
          </div>
        )}

        <Toolbar
          searchPlaceholder="Buscar por serie, número, vendedor o documento..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onNew={() => setNewOpen(true)}
          newLabel="Nueva liquidación"
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          filterCount={Object.values(filters).filter((value) => value !== '').length}
          onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          filterPanel={(
            <div className="erp-form-grid">
              <FormField label="Estado">
                <select className="erp-input" value={filters.estado} onChange={(event) => setFilters((prev) => ({ ...prev, estado: event.target.value as Filters['estado'] }))}>
                  <option value="">Todos</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="EMITIDO">Emitido</option>
                  <option value="ANULADO">Anulado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </FormField>
              <FormField label="Estado SUNAT">
                <select className="erp-input" value={filters.estadoSunat} onChange={(event) => setFilters((prev) => ({ ...prev, estadoSunat: event.target.value as Filters['estadoSunat'] }))}>
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EXCEPCION">Excepción</option>
                  <option value="ACEPTADO">Aceptado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </FormField>
              <FormField label="Desde">
                <input className="erp-input" type="date" value={filters.fechaDesde} onChange={(event) => setFilters((prev) => ({ ...prev, fechaDesde: event.target.value }))} />
              </FormField>
              <FormField label="Hasta">
                <input className="erp-input" type="date" value={filters.fechaHasta} onChange={(event) => setFilters((prev) => ({ ...prev, fechaHasta: event.target.value }))} />
              </FormField>
            </div>
          )}
        />

        <DataTable
          columns={columns}
          data={processedData}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="No hay liquidaciones registradas."
        />
        <Pagination currentPage={pagination.page} totalPages={totalPages} pageSize={pagination.pageSize} totalItems={totalItems} onPageChange={setPage} onPageSizeChange={setPageSize} />

        <ComprobantePreviewDialog comprobante={preview} onClose={() => setPreview(null)} />
        <ComprobanteDetailDialog comprobante={detail} onClose={() => setDetail(null)} />

        {voidReasonDialog.open && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Anular documento</h3>
              <textarea className="erp-input" rows={3} value={voidReason} onChange={(event) => setVoidReason(event.target.value)} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => { setVoidReasonDialog({ open: false, comprobante: null }); setVoidReason(''); }}>Cancelar</button>
                <button
                  type="button"
                  className="erp-btn erp-btn-danger"
                  disabled={deletingId !== null || !voidReason.trim()}
                  onClick={async () => {
                    if (!voidReasonDialog.comprobante) return;
                    try {
                      setDeletingId(voidReasonDialog.comprobante.id);
                      await voidBill({ documentId: String(voidReasonDialog.comprobante.id), reason: voidReason });
                      setVoidReasonDialog({ open: false, comprobante: null });
                      setVoidReason('');
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {newOpen && (
          <NewComprobanteLiquidacionDialog
            isOpen={newOpen}
            comprasDisponibles={comprasDisponibles}
            loading={generating}
            onClose={() => setNewOpen(false)}
            onGenerate={crearLiquidacion}
          />
        )}
      </div>
    </div>
  );
};
