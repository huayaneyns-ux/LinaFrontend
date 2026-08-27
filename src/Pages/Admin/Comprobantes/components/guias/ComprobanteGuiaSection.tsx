import { useMemo, useState, type ReactNode } from 'react';

import type {
  ComprobanteEstado,
  ComprobanteEstadoSunat,
  ComprobanteSelectDto,
  GuiaRemisionFormData,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

import Toolbar from '../../../../../Components/ERP/Toolbar';
import DataTable, {
  type ColumnDef,
} from '../../../../../Components/ERP/DataTable';
import Pagination from '../../../../../Components/ERP/Pagination';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';
import ComprobanteActions from '../ComprobanteActions';
import ComprobantePreviewDialog from '../ComprobantePreviewDialog';
import ComprobanteDetailDialog from '../ComprobanteDetailDialog';

import { useComprobantes } from '../../../../../Hooks/useComprobantes';
import { useDataTable } from '../../../../../Hooks/useDataTable';
import { formatDate } from '../../../../../Utils/formatters';

import NewGuiaDialog from './NewGuiaDialog';

interface GuiaFilters {
  tipo:
    | ''
    | 'GUIA_REMISION_REMITENTE'
    | 'GUIA_REMISION_TRANSPORTISTA';
  estado: ComprobanteEstado | '';
  estadoSunat: ComprobanteEstadoSunat | '';
  fechaDesde: string;
  fechaHasta: string;
}

const INITIAL_FILTERS: GuiaFilters = {
  tipo: '',
  estado: '',
  estadoSunat: '',
  fechaDesde: '',
  fechaHasta: '',
};

export const ComprobanteGuiaSection = () => {
  const [filters, setFilters] = useState<GuiaFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [newGuiaOpen, setNewGuiaOpen] = useState(false);
  const [previewComprobante, setPreviewComprobante] = useState<ComprobanteSelectDto | null>(null);
  const [detailComprobante, setDetailComprobante] = useState<ComprobanteSelectDto | null>(null);

  const {
    comprobantes,
    loading,
    generating,
    updatingSunatId,
    error,
    successMessage,
    actualizarEstadoSunat,
    crearGuia,
    clearSuccessMessage,
  } = useComprobantes();

  const filteredGuias = useMemo(() => {
    return comprobantes.filter((comprobante) => {
      if (
        comprobante.tipo !== 'GUIA_REMISION_REMITENTE' &&
        comprobante.tipo !== 'GUIA_REMISION_TRANSPORTISTA'
      ) {
        return false;
      }
      if (filters.tipo && comprobante.tipo !== filters.tipo) {
        return false;
      }
      if (filters.estado && comprobante.estado !== filters.estado) {
        return false;
      }
      if (
        filters.estadoSunat &&
        comprobante.estadoSunat !== filters.estadoSunat
      ) {
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
  }, [comprobantes, filters]);

  const table = useDataTable<ComprobanteSelectDto>({
    data: filteredGuias,
    searchKeys: [
      'serie',
      'numero',
      'remitente',
      'destinatario',
      'transportista',
    ],
    defaultPageSize: 8,
  });

  const filterCount = Object.values(filters).filter(
    (value) => value !== '',
  ).length;

  const handleCreateGuia = async (form: GuiaRemisionFormData) => {
    await crearGuia(form);
  };

  const columns: ColumnDef<ComprobanteSelectDto>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      width: '170px',
      render: (row) =>
        row.tipo === 'GUIA_REMISION_REMITENTE'
          ? 'Guía Remitente'
          : 'Guía Transportista',
    },
    {
      key: 'serie',
      header: 'Serie',
      sortable: true,
      width: '75px',
      render: (row) => <strong>{row.serie}</strong>,
    },
    {
      key: 'numero',
      header: 'Número',
      sortable: true,
      width: '110px',
    },
    {
      key: 'fechaEmision',
      header: 'Fecha',
      sortable: true,
      width: '115px',
      render: (row) => formatDate(row.fechaEmision),
    },
    {
      key: 'remitente',
      header: 'Remitente',
      sortable: true,
      render: (row) => row.remitente || '—',
    },
    {
      key: 'destinatario',
      header: 'Destinatario',
      sortable: true,
      render: (row) => row.destinatario || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row) => (
        <ComprobanteStatusBadge status={row.estado} />
      ),
    },
    {
      key: 'estadoSunat',
      header: 'Estado SUNAT',
      sortable: true,
      width: '125px',
      render: (row) => (
        <ComprobanteStatusBadge status={row.estadoSunat} />
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      width: '80px',
      render: (row) => (
        <ComprobanteActions
          comprobante={row}
          isUpdatingSunat={updatingSunatId === row.id}
          onViewComprobante={setPreviewComprobante}
          onViewDetails={setDetailComprobante}
          onUpdateSunat={(id) => void actualizarEstadoSunat(id)}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 0,
      }}
    >
      <div className="erp-tab-content">
        {error && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              backgroundColor: 'var(--erp-danger-light, #fee2e2)',
              color: 'var(--erp-danger, #dc2626)',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              backgroundColor: 'var(--erp-success-light, #dcfce7)',
              color: 'var(--erp-success, #16a34a)',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={clearSuccessMessage}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </div>
        )}

        <Toolbar
          searchValue={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          searchPlaceholder="Buscar por serie, número, remitente o destinatario..."
          onNew={() => setNewGuiaOpen(true)}
          newLabel="Agregar guía"
          showFilters={showFilters}
          onToggleFilters={() =>
            setShowFilters((value) => !value)
          }
          filterCount={filterCount}
          onResetFilters={
            filterCount
              ? () => setFilters(INITIAL_FILTERS)
              : undefined
          }
          filterPanel={
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px',
                width: '100%',
              }}
            >
              <FilterField
                label="Tipo de guía"
                value={filters.tipo}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    tipo: value as GuiaFilters['tipo'],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="GUIA_REMISION_REMITENTE">
                  Guía Remitente
                </option>
                <option value="GUIA_REMISION_TRANSPORTISTA">
                  Guía Transportista
                </option>
              </FilterField>

              <FilterField
                label="Estado"
                value={filters.estado}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    estado: value as GuiaFilters['estado'],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="BORRADOR">Borrador</option>
                <option value="EMITIDO">Emitido</option>
                <option value="ANULADO">Anulado</option>
                <option value="RECHAZADO">Rechazado</option>
              </FilterField>

              <FilterField
                label="Estado SUNAT"
                value={filters.estadoSunat}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    estadoSunat:
                      value as GuiaFilters['estadoSunat'],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ACEPTADO">Aceptado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="OBSERVADO">Observado</option>
              </FilterField>

              <DateFilter
                label="Fecha desde"
                value={filters.fechaDesde}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    fechaDesde: value,
                  }))
                }
              />

              <DateFilter
                label="Fecha hasta"
                value={filters.fechaHasta}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    fechaHasta: value,
                  }))
                }
              />
            </div>
          }
        />

        <div className="erp-table-card" style={{ flex: 1, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={table.processedData}
            loading={loading}
            sortConfig={table.sortConfig}
            onSort={table.handleSort}
            rowKey={(row) => row.id}
            emptyMessage="No hay guías de remisión registradas"
          />
          {!loading && (
            <Pagination
              page={table.pagination.page}
              totalPages={table.totalPages}
              pageSize={table.pagination.pageSize}
              totalItems={table.totalItems}
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          )}
        </div>
      </div>

      <NewGuiaDialog
        isOpen={newGuiaOpen}
        onClose={() => setNewGuiaOpen(false)}
        onGenerate={handleCreateGuia}
        loading={generating}
        guias={comprobantes
          .filter(
            (c) =>
              c.tipo === 'GUIA_REMISION_REMITENTE' ||
              c.tipo === 'GUIA_REMISION_TRANSPORTISTA',
          )
          .map((c) => ({
            id: c.id,
            tipo: c.tipo as any,
            serie: c.serie,
            numero: c.numero,
            fechaEmision: c.fechaEmision,
            fechaTraslado: c.fechaTraslado || c.fechaEmision,
            remitente: c.remitente,
            destinatario: c.destinatario,
            estado: c.estado,
            estadoSunat: c.estadoSunat,
          }))}
      />

      <ComprobantePreviewDialog
        comprobante={previewComprobante}
        onClose={() => setPreviewComprobante(null)}
      />

      <ComprobanteDetailDialog
        comprobante={detailComprobante}
        onClose={() => setDetailComprobante(null)}
      />
    </div>
  );
};

const FilterField = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) => (
  <div className="erp-form-group">
    <label className="erp-form-label">{label}</label>

    <select
      className="erp-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  </div>
);

const DateFilter = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="erp-form-group">
    <label className="erp-form-label">{label}</label>

    <input
      type="date"
      className="erp-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);