import { useMemo, useState, type ReactNode } from 'react';

import type {
  ComprobanteEstado,
  ComprobanteEstadoSunat,
  GuiaRemisionFormData,
  GuiaRemisionSelectDto,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

import Toolbar from '../../../../../Components/ERP/Toolbar';
import DataTable, {
  type ColumnDef,
} from '../../../../../Components/ERP/DataTable';
import Pagination from '../../../../../Components/ERP/Pagination';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';

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
  const [guias, setGuias] = useState<GuiaRemisionSelectDto[]>([]);
  const [filters, setFilters] = useState<GuiaFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [newGuiaOpen, setNewGuiaOpen] = useState(false);

  const filteredGuias = useMemo(
    () =>
      guias.filter(
        (guia) =>
          (!filters.tipo || guia.tipo === filters.tipo) &&
          (!filters.estado || guia.estado === filters.estado) &&
          (!filters.estadoSunat ||
            guia.estadoSunat === filters.estadoSunat) &&
          (!filters.fechaDesde ||
            guia.fechaEmision >= filters.fechaDesde) &&
          (!filters.fechaHasta || guia.fechaEmision <= filters.fechaHasta),
      ),
    [filters, guias],
  );

  const table = useDataTable<GuiaRemisionSelectDto>({
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

  const createGuia = (form: GuiaRemisionFormData) =>
    setGuias((previous) => [
      {
        id: Date.now(),
        tipo: form.tipo,
        serie: form.serie,
        numero: form.numero,
        fechaEmision: form.fechaEmision,
        fechaTraslado: form.fechaInicioTraslado,

        remitente:
          form.tipo === 'GUIA_REMISION_TRANSPORTISTA'
            ? form.remitente.nombre
            : 'Comercial Lina S.A.C.',

        destinatario: form.destinatario.nombre,

        motivoTraslado:
          form.tipo === 'GUIA_REMISION_REMITENTE'
            ? form.motivoTraslado
            : undefined,

        puntoPartida: form.puntoPartida.direccion,
        puntoLlegada: form.puntoLlegada.direccion,
        pesoTotal: form.pesoBrutoTotal,
        unidadMedidaPeso: form.unidadMedidaPeso,
        transportista: form.transportista?.razonSocial,

        estado: 'EMITIDO',
        estadoSunat: 'PENDIENTE',
      },
      ...previous,
    ]);

  const columns: ColumnDef<GuiaRemisionSelectDto>[] = [
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

        <DataTable
          columns={columns}
          data={table.processedData}
          loading={false}
          sortConfig={table.sortConfig}
          onSort={table.handleSort}
          emptyMessage="No hay guías de remisión registradas"
        />

        <Pagination
          page={table.pagination.page}
          totalPages={table.totalPages}
          pageSize={table.pagination.pageSize}
          totalItems={table.totalItems}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </div>

      <NewGuiaDialog
        isOpen={newGuiaOpen}
        onClose={() => setNewGuiaOpen(false)}
        onGenerate={createGuia}
        guias={guias}
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