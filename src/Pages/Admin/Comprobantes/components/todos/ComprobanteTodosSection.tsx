import { useState } from "react";
import type { ComprobanteEstado, ComprobanteEstadoSunat, ComprobanteSelectDto, ComprobanteTipo } from "../../../../../Types/Admin/Comprobantes/Comprobante";
import { useComprobantes } from "../../../../../Hooks/useComprobantes";
import type { ColumnDef } from "../../../../../Components/ERP/DataTable";
import { formatDate } from "../../../../../Utils/formatters";
import ComprobanteStatusBadge from "../ComprobanteStatusBadge";
import ComprobanteActions from "../ComprobanteActions";
import Toolbar from "../../../../../Components/ERP/Toolbar";
import DataTable from "../../../../../Components/ERP/DataTable";
import Pagination from "../../../../../Components/ERP/Pagination";
import ComprobantePreviewDialog from "../ComprobantePreviewDialog";
import ComprobanteDetailDialog from "../ComprobanteDetailDialog";
import { useDataTable } from "../../../../../Hooks/useDataTable";

interface ComprobanteTodosFilters {
    tipo: ComprobanteTipo | '';
    estado: ComprobanteEstado | '';
    estadoSunat: ComprobanteEstadoSunat | '';
    fechaDesde: string;
    fechaHasta: string;
}

const DEFAULT_FILTERS: ComprobanteTodosFilters = {
    tipo: '',
    estado: '',
    estadoSunat: '',
    fechaDesde: '',
    fechaHasta: '',
};

const TYPE_LABELS: Record<ComprobanteSelectDto['tipo'], string> = {
    BOLETA: 'Boleta',
    FACTURA: 'Factura',
    NOTA_CREDITO: 'Nota de Crédito',
    NOTA_DEBITO: 'Nota de Débito',
    LIQUIDACION_COMPRA: 'Liquidación de Compra',
    GUIA_REMISION_REMITENTE: 'Guía Remitente',
    GUIA_REMISION_TRANSPORTISTA: 'Guía Transportista',
};

const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

export const ComprobanteTodosSection = () => {

    const [filters, setFilters] = useState<ComprobanteTodosFilters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [previewComprobante, setPreviewComprobante] = useState<ComprobanteSelectDto | null>(null);
    const [detailComprobante, setDetailComprobante] = useState<ComprobanteSelectDto | null>(null);
    const {
        comprobantes,
        loading,
        updatingSunatId,
        error,
        actualizarEstadoSunat,
    } = useComprobantes();

    const filterCount = Object.values(filters).filter(value => value !== '').length;

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
        data: comprobantes,
        searchKeys: ['serie', 'numero', 'cliente', 'documentoCliente'],
        defaultPageSize: 8
    });

    const sharedColumns: ColumnDef<ComprobanteSelectDto>[] = [
        {
            key: 'tipo', header: 'Tipo', sortable: true, width: '170px',
            render: row => TYPE_LABELS[row.tipo],
        },
        {
            key: 'serie', header: 'Serie', sortable: true, width: '75px',
            render: row => <strong>{row.serie}</strong>,
        },
        { key: 'numero', header: 'Número', sortable: true, width: '110px' },
        {
            key: 'fechaEmision', header: 'Fecha', sortable: true, width: '115px',
            render: row => formatDate(row.fechaEmision),
        },
    ];

    const statusColumns: ColumnDef<ComprobanteSelectDto>[] = [
        {
            key: 'estado', header: 'Estado', sortable: true, width: '110px',
            render: row => <ComprobanteStatusBadge status={row.estado} />,
        },
        {
            key: 'estadoSunat', header: 'Estado SUNAT', sortable: true, width: '125px',
            render: row => <ComprobanteStatusBadge status={row.estadoSunat} />,
        },
        {
            key: 'actions', header: 'Acciones', align: 'right', width: '80px',
            render: row => (
                <ComprobanteActions
                    comprobante={row}
                    isUpdatingSunat={updatingSunatId === row.id}
                    onViewComprobante={setPreviewComprobante}
                    onViewDetails={setDetailComprobante}
                    onUpdateSunat={id => void actualizarEstadoSunat(id)}
                />
            ),
        },
    ];

    const columns: ColumnDef<ComprobanteSelectDto>[] =
        [   
            ...sharedColumns,
            { key: 'cliente', header: 'Cliente', sortable: true, render: row => row.cliente },
            { key: 'documentoCliente', header: 'Documento', sortable: true, width: '125px' },
            { key: 'total', header: 'Total', sortable: true, align: 'right', width: '110px', render: row => formatAmount(row.total) },
            ...statusColumns,
        ];

    const filteredTodos = processedData.filter(comprobante => {
        if (filters.tipo && comprobante.tipo !== filters.tipo) {
            return false;
        }
        if (filters.estado && comprobante.estado !== filters.estado) {
            return false;
        }
        if (filters.estadoSunat && comprobante.estadoSunat !== filters.estadoSunat) {
            return false;
        }
        if (filters.fechaDesde && comprobante.fechaEmision < filters.fechaDesde) {
            return false;
        }
        if (filters.fechaHasta && comprobante.fechaEmision > filters.fechaHasta) {
            return false;
        }
        return true;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
            <div className="erp-tab-content">
                {error && (
                    <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <Toolbar
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Buscar por serie, número, cliente o documento..."
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(previous => !previous)}
                    filterCount={filterCount}
                    onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
                    filterPanel={
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
                            <div className="erp-form-group">
                                <label className="erp-form-label">Tipo de Comprobante</label>
                                <select className="erp-input" value={filters.tipo} onChange={event => setFilters(previous => ({ ...previous, tipo: event.target.value as ComprobanteTipo | '' }))}>
                                    <option value="">Todos</option>
                                    <option value="BOLETA">Boleta</option>
                                    <option value="FACTURA">Factura</option>
                                    <option value="LIQUIDACION_COMPRA">Liquidación de Compra</option>
                                    <option value="NOTA_CREDITO">Nota de Crédito</option>
                                    <option value="NOTA_DEBITO">Nota de Débito</option>
                                    <option value="GUIA_REMISION_REMITENTE">Guía Remitente</option>
                                    <option value="GUIA_REMISION_TRANSPORTISTA">Guía Transportista</option>
                                </select>
                            </div>
                            <div className="erp-form-group">
                                <label className="erp-form-label">Estado</label>
                                <select className="erp-input" value={filters.estado} onChange={event => setFilters(previous => ({ ...previous, estado: event.target.value as ComprobanteEstado | '' }))}>
                                    <option value="">Todos</option>
                                    <option value="BORRADOR">Borrador</option>
                                    <option value="EMITIDO">Emitido</option>
                                    <option value="ANULADO">Anulado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </select>
                            </div>
                            <div className="erp-form-group">
                                <label className="erp-form-label">Estado SUNAT</label>
                                <select className="erp-input" value={filters.estadoSunat} onChange={event => setFilters(previous => ({ ...previous, estadoSunat: event.target.value as ComprobanteEstadoSunat | '' }))}>
                                    <option value="">Todos</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="ENVIADO">Enviado</option>
                                    <option value="ACEPTADO">Aceptado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                    <option value="OBSERVADO">Observado</option>
                                </select>
                            </div>
                            <div className="erp-form-group">
                                <label className="erp-form-label">Fecha desde</label>
                                <input type="date" className="erp-input" value={filters.fechaDesde} onChange={event => setFilters(previous => ({ ...previous, fechaDesde: event.target.value }))} />
                            </div>
                            <div className="erp-form-group">
                                <label className="erp-form-label">Fecha hasta</label>
                                <input type="date" className="erp-input" value={filters.fechaHasta} onChange={event => setFilters(previous => ({ ...previous, fechaHasta: event.target.value }))} />
                            </div>
                        </div>
                    }
                />

                <div className="erp-table-card" style={{ flex: 1, overflow: 'hidden' }}>
                    <DataTable
                        columns={columns}
                        data={filteredTodos}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        rowKey={row => row.id}
                        loading={loading}
                        emptyMessage="No se encontraron comprobantes con los criterios seleccionados"
                    />
                    {!loading && (
                        <Pagination
                            page={pagination.page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pagination.pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}
                </div>
            </div>

            <ComprobantePreviewDialog comprobante={previewComprobante} onClose={() => setPreviewComprobante(null)} />
            
            <ComprobanteDetailDialog comprobante={detailComprobante} onClose={() => setDetailComprobante(null)} />

        </div>

    );
}
