import { useState, useCallback, useMemo, useEffect } from 'react';

import { MovimientoService } from '../../../../Services/Admin/Inventario/Movimiento';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import type {
  MovimientoSelectDto,
  MovimientoInsertDto,
} from '../../../../Types/Admin/Inventario/Movimiento';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { formatDateTime } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiActivity, FiArrowUpRight, FiArrowDownLeft, FiEye } from 'react-icons/fi';

interface MovimientoFilters {
  tipo: string;
  usuario: string;
}

const DEFAULT_FILTERS: MovimientoFilters = { tipo: '', usuario: '' };

const EMPTY_FORM: Partial<MovimientoSelectDto> = {
  tipo: 'INGRESO',
  idProducto: 0,
  cantidad: 10,
  motivo: 'Reabastecimiento local',
};

const movimientoCrudService = {
  getAll: () => MovimientoService.getMovimientos(),
  getById: (id: number) => MovimientoService.getMovimientoById(id),
  create: (data: MovimientoInsertDto) => MovimientoService.createMovimiento(data),
  update: (data: never) => MovimientoService.updateMovimiento(data),
  delete: (id: number) => MovimientoService.deleteMovimiento(id),
};

const MovementsSection = () => {
  const { items: movements, loading, saving, error, fetchById, createItem } =
    useAdminCrud<MovimientoSelectDto, MovimientoInsertDto, never>(movimientoCrudService);

  const { dialogState, openCreate, openView, closeDialog } = useDialog<MovimientoSelectDto>();

  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [filters, setFilters] = useState<MovimientoFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [formState, setFormState] = useState<Partial<MovimientoSelectDto>>(EMPTY_FORM);

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
    (mov: MovimientoSelectDto) => {
      if (filters.tipo && mov.tipo !== filters.tipo) return false;
      if (filters.usuario && !mov.usuario.toLowerCase().includes(filters.usuario.toLowerCase())) {
        return false;
      }
      return true;
    },
    [filters]
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
  } = useDataTable<MovimientoSelectDto>({
    data: movements,
    searchKeys: ['id', 'productoNombre', 'motivo', 'usuario'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = movements.length;
    const ingresos = movements.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.cantidad, 0);
    const salidas = movements.filter(m => m.tipo === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0);
    return { total, ingresos, salidas };
  }, [movements]);

  const handleOpenDialog = async (mode: 'create' | 'view', record?: MovimientoSelectDto) => {
    if (record && mode === 'view') {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail });
      openView(record);
    } else {
      const defaultProductoId = productos[0]?.id ?? 0;
      setFormState({
        ...EMPTY_FORM,
        idProducto: defaultProductoId,
      });
      openCreate();
    }
  };

  const handleConfirm = async () => {
    try {
      if (dialogState.mode === 'create') {
        const payload: MovimientoInsertDto = {
          tipo: formState.tipo || 'INGRESO',
          idProducto: Number(formState.idProducto) || productos[0]?.id || 0,
          cantidad: Number(formState.cantidad) || 0,
          motivo: formState.motivo || '',
        };
        await createItem(payload);
      }
      closeDialog();
    } catch {
      // error shown via hook
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Kardex ID',
      sortable: true,
      width: '100px',
      render: (row: MovimientoSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>#{row.id}</strong>
      ),
    },
    {
      key: 'tipo',
      header: 'Operación',
      sortable: true,
      width: '120px',
      render: (row: MovimientoSelectDto) => {
        const isIngreso = row.tipo === 'INGRESO';
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: isIngreso ? 'var(--erp-success-light)' : 'rgba(239, 68, 68, 0.08)',
            color: isIngreso ? 'var(--erp-success)' : '#ef4444'
          }}>
            {isIngreso ? <FiArrowDownLeft /> : <FiArrowUpRight />}
            {row.tipo}
          </span>
        );
      },
    },
    {
      key: 'productoNombre',
      header: 'Producto / Ítem',
      sortable: true,
      render: (row: MovimientoSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productoNombre}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>{row.motivo}</div>
        </div>
      ),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: MovimientoSelectDto) => (
        <span style={{ fontWeight: 700, color: row.tipo === 'INGRESO' ? 'var(--erp-success)' : '#ef4444' }}>
          {row.tipo === 'INGRESO' ? '+' : '-'}{row.cantidad}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha y Hora',
      sortable: true,
      width: '160px',
      render: (row: MovimientoSelectDto) => formatDateTime(row.fecha),
    },
    {
      key: 'usuario',
      header: 'Registrado por',
      sortable: true,
      width: '140px',
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '60px',
      render: (row: MovimientoSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton icon={<FiEye />} tooltip="Ver detalles" variant="primary" onClick={() => handleOpenDialog('view', row)} />
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
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Movimientos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiArrowDownLeft /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">+{indicators.ingresos} und</span>
            <span className="erp-indicator-label">Ingresos Registrados</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiArrowUpRight /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">-{indicators.salidas} und</span>
            <span className="erp-indicator-label">Salidas Registradas</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por kardex ID, producto o motivo..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Registrar Movimiento"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Tipo de Movimiento</label>
              <select className="erp-input" value={filters.tipo} onChange={e => setFilters(prev => ({ ...prev, tipo: e.target.value }))}>
                <option value="">Todos</option>
                <option value="INGRESO">Ingresos (Ingreso físico)</option>
                <option value="SALIDA">Salidas (Despacho / Consumo)</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Usuario</label>
              <input
                type="text"
                className="erp-input"
                placeholder="Nombre de usuario..."
                value={filters.usuario}
                onChange={e => setFilters(prev => ({ ...prev, usuario: e.target.value }))}
              />
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando movimientos...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron movimientos en la bitácora" />
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
        title={dialogState.mode === 'create' ? 'Registrar Transacción Física' : 'Detalles de Transacción'}
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Tipo de Transacción</label>
            <select
              className="erp-input"
              value={formState.tipo || 'INGRESO'}
              onChange={e => setFormState(prev => ({ ...prev, tipo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="INGRESO">INGRESO (Sumar al stock)</option>
              <option value="SALIDA">SALIDA (Restar del stock)</option>
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Producto</label>
            {dialogState.mode === 'create' ? (
              <select
                className="erp-input"
                value={formState.idProducto ?? 0}
                onChange={e => setFormState(prev => ({ ...prev, idProducto: Number(e.target.value) }))}
              >
                {productos.length === 0 && <option value={0}>Sin productos disponibles</option>}
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                ))}
              </select>
            ) : (
              <input type="text" className="erp-input" value={formState.productoNombre || ''} disabled />
            )}
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Cantidad</label>
            <input
              type="number"
              className="erp-input"
              value={formState.cantidad ?? 0}
              onChange={e => setFormState(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          {dialogState.mode === 'view' && (
            <>
              <div className="erp-form-group">
                <label className="erp-form-label">Responsable</label>
                <input type="text" className="erp-input" value={formState.usuario || ''} disabled />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Fecha y Hora</label>
                <input type="text" className="erp-input" value={formState.fecha ? formatDateTime(formState.fecha) : ''} disabled />
              </div>
            </>
          )}
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Motivo o Justificación</label>
            <input
              type="text"
              className="erp-input"
              value={formState.motivo || ''}
              onChange={e => setFormState(prev => ({ ...prev, motivo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: Inventario cíclico trimestral"
            />
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default MovementsSection;
