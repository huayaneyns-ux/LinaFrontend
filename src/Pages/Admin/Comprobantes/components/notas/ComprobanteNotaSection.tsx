import { useMemo, useState } from "react";

import type {
  ComprobanteEstado,
  ComprobanteSelectDto,
} from "../../../../../Types/Admin/Comprobantes/Comprobante";

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

import NewNotaDialog from "./NewComprobanteNotaDialog";

import { EMPRESA } from "../../../../../Constantes/Empresa";



interface NotaComprobanteFilters {

  estado: ComprobanteEstado | '';
  estadoSunat: 'PENDIENTE' | 'EXCEPCION' | 'ACEPTADO' | 'RECHAZADO' | '';
  tipo: 'NOTA_CREDITO' | 'NOTA_DEBITO' | '';
  fechaDesde: string;
  fechaHasta: string;

}

const DEFAULT_FILTERS: NotaComprobanteFilters = {
  estado: '',
  estadoSunat: '',
  tipo: '',
  fechaDesde: '',
  fechaHasta: '',

};


const formatAmount = (amount: number) =>
  `S/ ${amount.toFixed(2)}`;


export const ComprobanteNotaVentas = () => {

  const [filters, setFilters] =
    useState<NotaComprobanteFilters>(DEFAULT_FILTERS);

  const [showFilters, setShowFilters] =
    useState(false);

  const [newNotaOpen, setNewNotaOpen] =
    useState(false);

  const [previewNota, setPreviewNota] =
    useState<ComprobanteSelectDto | null>(null);

  const [detailNota, setDetailNota] =
    useState<ComprobanteSelectDto | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [voidReasonDialog, setVoidReasonDialog] = useState<{ open: boolean; comprobante: ComprobanteSelectDto | null }>({ open: false, comprobante: null });
  const [voidReason, setVoidReason] = useState('');

  const {
    comprobantes,
    productosDisponibles,
    loading,
    generating,
    updatingSunatId,
    error,
    successMessage,
    actualizarEstadoSunat,
    crearNota,
    getPDF,
    voidBill,
    clearSuccessMessage,
  } = useComprobantes();


  const filteredNotas = useMemo(() => {
    return comprobantes.filter(comprobante => {
      if (comprobante.tipo !== 'NOTA_CREDITO' && comprobante.tipo !== 'NOTA_DEBITO') {
        return false;
      }
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
  }, [comprobantes, filters]);


  const filterCount =
    Object.values(filters).filter(value => value !== '').length;

  const handleDownloadPDF = async (comprobante: ComprobanteSelectDto) => {
    try {
      setDownloadingId(comprobante.id);
      const fileName = `${comprobante.serie}-${comprobante.numero}`;
      await getPDF(String(comprobante.id), 'A4', fileName);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteDocument = (comprobante: ComprobanteSelectDto) => {
    setVoidReasonDialog({ open: true, comprobante });
  };

  const handleConfirmVoid = async () => {
    if (!voidReasonDialog.comprobante || !voidReason.trim()) {
      return;
    }

    try {
      setDeletingId(voidReasonDialog.comprobante.id);
      const voidRequest = {
        personaId: EMPRESA.sunatConfig.personaId,
        personaToken: EMPRESA.sunatConfig.personaToken || '',
        documentId: String(voidReasonDialog.comprobante.id),
        reason: voidReason,
      };
      await voidBill(voidRequest);
      setVoidReasonDialog({ open: false, comprobante: null });
      setVoidReason('');
    } finally {
      setDeletingId(null);
    }
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

    data: filteredNotas,

    searchKeys: [
      'serie',
      'numero',
      'cliente',
      'documentoCliente',
    ],

    defaultPageSize: 8,

  });


  /*
   * COLUMNAS COMUNES
   */

  const sharedColumns:
    ColumnDef<ComprobanteSelectDto>[] = [

      {

        key: 'tipo',

        header: 'Tipo',

        sortable: true,

        width: '150px',

        render: row => {
          const labels: Record<string, string> = {
            NOTA_CREDITO: 'Nota de Crédito',
            NOTA_DEBITO: 'Nota de Débito',
          };
          return labels[row.tipo] || row.tipo;
        },

      },

      {

        key: 'serie',

        header: 'Serie',

        sortable: true,

        width: '75px',

        render: row => (
          <strong>
            {row.serie}
          </strong>
        ),

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

        render: row => formatDate(row.fechaEmision),

      },

    ];


  /*
   * COLUMNAS DE ESTADO
   */

  const statusColumns:
    ColumnDef<ComprobanteSelectDto>[] = [

      {

        key: 'estado',

        header: 'Estado',

        sortable: true,

        width: '110px',

        render: row => (
          <ComprobanteStatusBadge
            status={row.estado}
          />
        ),

      },

      {

        key: 'estadoSunat',

        header: 'Estado SUNAT',

        sortable: true,

        width: '125px',

        render: row => (
          <ComprobanteStatusBadge
            status={row.estadoSunat}
          />
        ),

      },

      {

        key: 'actions',

        header: 'Acciones',

        align: 'right',

        width: '120px',

        render: row => (

          <ComprobanteActions

            comprobante={row}

            isUpdatingSunat={
              updatingSunatId === row.id
            }

            isDownloading={downloadingId === row.id}
            isDeleting={deletingId === row.id}

            onViewComprobante={
              setPreviewNota
            }

            onViewDetails={
              setDetailNota
            }

            onUpdateSunat={
              id => void actualizarEstadoSunat(id)
            }

            onDownloadPDF={handleDownloadPDF}
            onDeleteDocument={handleDeleteDocument}

          />

        ),

      },

    ];


  /*
   * COLUMNAS PRINCIPALES DE LAS NOTAS
   */

  const columns:
    ColumnDef<ComprobanteSelectDto>[] = [

      ...sharedColumns,

      {

        key: 'cliente',

        header: 'Cliente',

        sortable: true,

        render: row =>
          row.cliente,

      },

      {

        key: 'documentoCliente',

        header: 'Documento',

        sortable: true,

        width: '125px',

        render: row =>
          row.documentoCliente,

      },

      {
        key: 'total',
        header: 'Total',
        sortable: true,
        align: 'right',
        width: '110px',
        render: row =>
          formatAmount(row.total),
      },

      ...statusColumns,

    ];

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '0',
      }}
    >

      <div className="erp-tab-content">

        {error && (

          <div
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              backgroundColor:
                'var(--erp-danger-light)',
              color:
                'var(--erp-danger)',
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
              backgroundColor:
                'var(--erp-success-light)',
              color:
                'var(--erp-success)',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >

            <span>
              {successMessage}
            </span>

            <button
              type="button"
              className="erp-btn erp-btn-sm erp-btn-secondary"
              onClick={clearSuccessMessage}
            >
              Cerrar
            </button>

          </div>

        )}

        {voidReasonDialog.open && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              maxWidth: '500px', 
              width: '100%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                Anular Documento
              </h3>
              <p style={{ margin: '0 0 16px 0', color: '#666' }}>
                Está por anular el documento {voidReasonDialog.comprobante?.serie}-{voidReasonDialog.comprobante?.numero}. 
                Por favor, indique el motivo de la anulación (3-100 caracteres):
              </p>
              <div className="erp-form-group" style={{ marginBottom: '16px' }}>
                <label className="erp-form-label">Motivo de anulación</label>
                <textarea
                  className="erp-input"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Ingrese el motivo..."
                  rows={3}
                  maxLength={100}
                  style={{ width: '100%', resize: 'vertical' }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {voidReason.length}/100 caracteres
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={() => {
                    setVoidReasonDialog({ open: false, comprobante: null });
                    setVoidReason('');
                  }}
                  disabled={deletingId !== null}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="erp-btn erp-btn-danger"
                  onClick={handleConfirmVoid}
                  disabled={deletingId !== null || voidReason.trim().length < 3 || voidReason.trim().length > 100}
                >
                  {deletingId ? 'Anulando...' : 'Confirmar anulación'}
                </button>
              </div>
            </div>
          </div>
        )}


        <Toolbar

          searchValue={searchQuery}

          onSearchChange={setSearchQuery}

          searchPlaceholder={
            "Buscar por serie, número, cliente, documento o motivo..."
          }

          onNew={() =>
            setNewNotaOpen(true)
          }

          newLabel="Agregar nota"

          showFilters={showFilters}

          onToggleFilters={() =>
            setShowFilters(previous => !previous)
          }

          filterCount={filterCount}

          onResetFilters={
            filterCount > 0
              ? () => setFilters(DEFAULT_FILTERS)
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

              {/* TIPO */}

              <div className="erp-form-group">

                <label className="erp-form-label">
                  Tipo
                </label>

                <select
                  className="erp-input"
                  value={filters.tipo}
                  onChange={event =>
                    setFilters(previous => ({
                      ...previous,
                      tipo:
                        event.target.value as
                        NotaComprobanteFilters['tipo'],
                    }))
                  }
                >

                  <option value="">
                    Todos
                  </option>

                  <option value="NOTA_CREDITO">
                    Nota de Crédito
                  </option>

                  <option value="NOTA_DEBITO">
                    Nota de Débito
                  </option>

                </select>

              </div>


              {/* ESTADO */}

              <div className="erp-form-group">

                <label className="erp-form-label">
                  Estado
                </label>

                <select
                  className="erp-input"
                  value={filters.estado}
                  onChange={event =>
                    setFilters(previous => ({
                      ...previous,
                      estado:
                        event.target.value as
                        ComprobanteEstado | '',
                    }))
                  }
                >

                  <option value="">
                    Todos
                  </option>

                  <option value="BORRADOR">
                    Borrador
                  </option>

                  <option value="EMITIDO">
                    Emitido
                  </option>

                  <option value="ANULADO">
                    Anulado
                  </option>

                  <option value="RECHAZADO">
                    Rechazado
                  </option>

                </select>

              </div>


              {/* ESTADO SUNAT */}

              <div className="erp-form-group">

                <label className="erp-form-label">
                  Estado SUNAT
                </label>

                <select
                  className="erp-input"
                  value={filters.estadoSunat}
                  onChange={event =>
                    setFilters(previous => ({
                      ...previous,
                      estadoSunat:
                        event.target.value as
                        'PENDIENTE' | 'EXCEPCION' | 'ACEPTADO' | 'RECHAZADO' | '',
                    }))
                  }
                >

                  <option value="">
                    Todos
                  </option>

                  <option value="PENDIENTE">
                    Pendiente
                  </option>

                  <option value="EXCEPCION">
                    Excepción
                  </option>

                  <option value="ACEPTADO">
                    Aceptado
                  </option>

                  <option value="RECHAZADO">
                    Rechazado
                  </option>

                </select>

              </div>


              {/* FECHA DESDE */}

              <div className="erp-form-group">

                <label className="erp-form-label">
                  Fecha desde
                </label>

                <input
                  type="date"
                  className="erp-input"
                  value={filters.fechaDesde}
                  onChange={event =>
                    setFilters(previous => ({
                      ...previous,
                      fechaDesde:
                        event.target.value,
                    }))
                  }
                />

              </div>


              {/* FECHA HASTA */}

              <div className="erp-form-group">

                <label className="erp-form-label">
                  Fecha hasta
                </label>

                <input
                  type="date"
                  className="erp-input"
                  value={filters.fechaHasta}
                  onChange={event =>
                    setFilters(previous => ({
                      ...previous,
                      fechaHasta:
                        event.target.value,
                    }))
                  }
                />

              </div>

            </div>

          }

        />


        <div
          className="erp-table-card"
          style={{
            flex: 1,
            overflow: 'hidden',
          }}
        >

          <DataTable

            columns={columns}

            data={processedData}

            sortConfig={sortConfig}

            onSort={handleSort}

            rowKey={row => row.id}

            loading={loading}

            emptyMessage={
              "No se encontraron notas con los criterios seleccionados"
            }

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


        <ComprobantePreviewDialog

          comprobante={previewNota}

          onClose={() =>
            setPreviewNota(null)
          }

        />


        <ComprobanteDetailDialog

          comprobante={detailNota}

          onClose={() =>
            setDetailNota(null)
          }

        />

        {newNotaOpen && (

          <NewNotaDialog

            isOpen={newNotaOpen}

            comprobantes={comprobantes}

            productos={productosDisponibles}

            loading={generating}

            onClose={() =>
              setNewNotaOpen(false)
            }

            onGenerate={
              async form =>
                (await crearNota(form)) !== null
            }

          />

        )}

      </div>

    </div>

  );

};
