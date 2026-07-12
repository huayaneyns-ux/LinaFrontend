import { useState, useCallback, useMemo, useEffect } from 'react';

import { LoteService } from '../../../../Services/Admin/Inventario/Lote';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import type {
  LoteSelectDto,
  LoteInsertDto,
  LoteUpdateDto,
} from '../../../../Types/Admin/Inventario/Lote';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiLayers,
  FiAlertCircle,
  FiCheckSquare,
  FiCalendar,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
} from 'react-icons/fi';

interface LoteFilters {
  producto: string;
  estado: string;
}

const DEFAULT_FILTERS: LoteFilters = { producto: '', estado: '' };

const EMPTY_FORM: Partial<LoteSelectDto> = {
  idProducto: 0,
  cantidadInicial: 100,
  cantidadActual: 100,
  fechaIngreso: new Date().toISOString(),
  fechaVencimiento: '',
  estado: true,
};

const loteCrudService = {
  getAll: () => LoteService.getLotes(),
  getById: (id: number) => LoteService.getLoteById(id),
  create: (data: LoteInsertDto) => LoteService.createLote(data),
  update: (data: LoteUpdateDto) => LoteService.updateLote(data),
  delete: (id: number) => LoteService.deleteLote(id),
};

const LotsSection = () => {
  const { items: lots, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<LoteSelectDto, LoteInsertDto, LoteUpdateDto>(loteCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<LoteSelectDto>();

  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [filters, setFilters] = useState<LoteFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<LoteSelectDto>>(EMPTY_FORM);

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const data = await ProductoService.getProductos();
        setProductos(data.filter(p => p.estado));
      } catch {
        // dropdown vacío si falla la carga
      }
    };
    loadProductos();
  }, []);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (lote: LoteSelectDto) => {
      if (!showDisabled && !lote.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !lote.estado) return false;
        if (filters.estado === 'INACTIVO' && lote.estado) return false;
      }
      if (filters.producto && !lote.productoNombre.toLowerCase().includes(filters.producto.toLowerCase())) {
        return false;
      }
      return true;
    },
    [filters, showDisabled]
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
  } = useDataTable<LoteSelectDto>({
    data: lots,
    searchKeys: ['id', 'productoNombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = lots.length;
    const stockTotal = lots.reduce((sum, l) => sum + l.cantidadActual, 0);
    const lotesActivos = lots.filter(l => l.estado).length;
    const proximosVencer = lots.filter(l => {
      if (!l.fechaVencimiento) return false;
      const days = (new Date(l.fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 90;
    }).length;
    return { total, stockTotal, lotesActivos, proximosVencer };
  }, [lots]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: LoteSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail });
    } else if (mode === 'delete' && record) {
      setFormState({ ...record });
    } else {
      const defaultProductoId = productos[0]?.id ?? 0;
      setFormState({
        ...EMPTY_FORM,
        idProducto: defaultProductoId,
        fechaIngreso: new Date().toISOString(),
      });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = async () => {
    try {
      if (dialogState.mode === 'create') {
        const payload: LoteInsertDto = {
          idProducto: Number(formState.idProducto) || productos[0]?.id || 0,
          cantidadInicial: Number(formState.cantidadInicial) || 0,
          fechaIngreso: formState.fechaIngreso || new Date().toISOString(),
          fechaVencimiento: formState.fechaVencimiento || undefined,
        };
        await createItem(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: LoteUpdateDto = {
          id: dialogState.record.id,
          idProducto: Number(formState.idProducto) || 0,
          cantidadInicial: Number(formState.cantidadInicial) || 0,
          cantidadActual: Number(formState.cantidadActual) || 0,
          fechaIngreso: formState.fechaIngreso || new Date().toISOString(),
          fechaVencimiento: formState.fechaVencimiento || undefined,
          estado: formState.estado !== false,
        };
        await updateItem(payload);
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        await deleteItem(dialogState.record.id);
      }
      closeDialog();
    } catch {
      // error shown via hook
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Lote ID',
      sortable: true,
      width: '100px',
      render: (row: LoteSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>#{row.id}</strong>
      ),
    },
    {
      key: 'productoNombre',
      header: 'Producto',
      sortable: true,
      render: (row: LoteSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productoNombre}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>ID Prod: #{row.idProducto}</div>
        </div>
      ),
    },
    {
      key: 'cantidadActual',
      header: 'Cant. Actual',
      sortable: true,
      align: 'center' as const,
      width: '120px',
      render: (row: LoteSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cantidadActual}</div>
          <div style={{ fontSize: '10px', color: 'var(--erp-text-muted)' }}>Inicial: {row.cantidadInicial}</div>
        </div>
      ),
    },
    {
      key: 'fechaIngreso',
      header: 'Ingreso',
      sortable: true,
      width: '110px',
      render: (row: LoteSelectDto) => formatDate(row.fechaIngreso),
    },
    {
      key: 'fechaVencimiento',
      header: 'Vencimiento',
      sortable: true,
      width: '110px',
      render: (row: LoteSelectDto) =>
        row.fechaVencimiento ? formatDate(row.fechaVencimiento) : (
          <span style={{ color: 'var(--erp-text-muted)' }}>—</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: LoteSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: LoteSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleOpenDialog('view', row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleOpenDialog('edit', row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => handleOpenDialog('delete', row)} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
      {error && (
        <div style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '6px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiLayers /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Lotes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckSquare /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.stockTotal} und</span>
            <span className="erp-indicator-label">Stock en Lotes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiCalendar /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.proximosVencer}</span>
            <span className="erp-indicator-label">Próximos a vencer</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiAlertCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.lotesActivos}</span>
            <span className="erp-indicator-label">Lotes Activos</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por Lote ID o producto..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Lote"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        extraActions={
          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
            onClick={() => setShowDisabled(prev => !prev)}
          >
            {showDisabled ? <FiEyeOff /> : <FiEye />}
            {showDisabled ? 'Ocultar deshabilitados' : 'Mostrar deshabilitados'}
          </button>
        }
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Producto (Filtro rápido)</label>
              <input
                type="text"
                className="erp-input"
                placeholder="Nombre del producto..."
                value={filters.producto}
                onChange={e => setFilters(prev => ({ ...prev, producto: e.target.value }))}
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando lotes...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron lotes registrados" />
            <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>

      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={saving}
        title={
          dialogState.mode === 'create' ? 'Registrar Lote' :
          dialogState.mode === 'edit' ? 'Editar Lote' :
          dialogState.mode === 'view' ? 'Detalle de Lote' : 'Eliminar Lote'
        }
        size="lg"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar el lote <strong>#{dialogState.record.id}</strong> ({dialogState.record.productoNombre})?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-form-grid">
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">ID del Lote</label>
                <input type="text" className="erp-input" value={formState.id ?? ''} disabled />
              </div>
            )}
            <div className="erp-form-group">
              <label className="erp-form-label">Producto Asignado</label>
              <select
                className="erp-input"
                value={formState.idProducto ?? 0}
                onChange={e => setFormState(prev => ({ ...prev, idProducto: Number(e.target.value) }))}
                disabled={dialogState.mode === 'view'}
              >
                {productos.length === 0 && <option value={0}>Sin productos disponibles</option>}
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Cantidad Inicial</label>
              <input
                type="number"
                className="erp-input"
                value={formState.cantidadInicial ?? 0}
                onChange={e => setFormState(prev => ({ ...prev, cantidadInicial: Number(e.target.value) }))}
                disabled={dialogState.mode === 'view'}
              />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Cantidad Actual</label>
                <input
                  type="number"
                  className="erp-input"
                  value={formState.cantidadActual ?? 0}
                  onChange={e => setFormState(prev => ({ ...prev, cantidadActual: Number(e.target.value) }))}
                  disabled={dialogState.mode === 'view'}
                />
              </div>
            )}
            <div className="erp-form-group">
              <label className="erp-form-label">Fecha de Ingreso</label>
              <input
                type="date"
                className="erp-input"
                value={formState.fechaIngreso ? formState.fechaIngreso.slice(0, 10) : ''}
                onChange={e => setFormState(prev => ({ ...prev, fechaIngreso: new Date(e.target.value).toISOString() }))}
                disabled={dialogState.mode === 'view'}
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Fecha de Vencimiento (Opcional)</label>
              <input
                type="date"
                className="erp-input"
                value={formState.fechaVencimiento ? formState.fechaVencimiento.slice(0, 10) : ''}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  fechaVencimiento: e.target.value ? new Date(e.target.value).toISOString() : '',
                }))}
                disabled={dialogState.mode === 'view'}
              />
            </div>
            {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
              <div className="erp-form-group col-span-2">
                <label className="erp-form-label">Estado de lote</label>
                {dialogState.mode === 'view' ? (
                  <div style={{ paddingTop: '6px' }}>
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} />
                  </div>
                ) : (
                  <select
                    className="erp-input"
                    value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'}
                    onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                  >
                    <option value="ACTIVO">Activo (Disponible)</option>
                    <option value="INACTIVO">Inactivo (Retirado / Agotado)</option>
                  </select>
                )}
              </div>
            )}
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default LotsSection;
