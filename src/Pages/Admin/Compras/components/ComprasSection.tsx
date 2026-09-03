import { useState, useEffect, useMemo, useCallback } from 'react';
import { CompraService } from '../../../../Services/Admin/Compras/Compra';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { useAuth } from '../../../../Context/AuthContext';
import type {
  CompraListaDto,
  CompraDetalleSelectDto,
  CompraCompletaInsertDto,
} from '../../../../Types/Admin/Compras/Compra';
import type { Proveedor } from '../../../../Types/Admin/Compras/Proveedor';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { formatDate } from '../../../../Utils/formatters';
import { isActivoEstado } from '../../../../Utils/imageUtils';
import { getNumericUserId } from '../../../../Utils/auth';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import IconButton from '../../../../Components/ERP/IconButton';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import {
  FiShoppingCart,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiPlus,
} from 'react-icons/fi';
import './ComprasSection.css';

interface CompraFilters {
  idProveedor: string;
}

interface DetalleRow {
  key: string;
  idProducto: number;
  cantidad: number;
  costoTotal: string;
  fechaFabricacion: string;
  fechaVencimiento: string;
}

const DEFAULT_FILTERS: CompraFilters = { idProveedor: '' };
const todayStr = () => new Date().toISOString().split('T')[0];
const fmt = (n?: number | null) => `S/ ${(n ?? 0).toFixed(2)}`;
const newRowKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createEmptyRow = (): DetalleRow => ({
  key: newRowKey(),
  idProducto: 0,
  cantidad: 1,
  costoTotal: '',
  fechaFabricacion: todayStr(),
  fechaVencimiento: '',
});

const proveedorLabel = (p: Proveedor) => {
  const nombre = p.razonSocial || (p as unknown as { razon_social?: string }).razon_social || 'Sin nombre';
  return p.ruc ? `${nombre} — ${p.ruc}` : nombre;
};

const ComprasSection = () => {
  const { usuario } = useAuth();
  const { dialogState, openCreate, openView, closeDialog } = useDialog<CompraListaDto>();

  const [compras, setCompras] = useState<CompraListaDto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [detalleItems, setDetalleItems] = useState<CompraDetalleSelectDto[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [filters, setFilters] = useState<CompraFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Borrador del registro (se conserva al cerrar el diálogo)
  const [filas, setFilas] = useState<DetalleRow[]>([createEmptyRow()]);
  const [idProveedor, setIdProveedor] = useState(0);
  const [fechaCompra, setFechaCompra] = useState(todayStr());
  const [fechaRecepcion, setFechaRecepcion] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const loadCompras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CompraService.getCompras();
      setCompras(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalogos = useCallback(async (): Promise<Proveedor[]> => {
    try {
      const [provs, prods] = await Promise.all([
        ProveedorService.getProveedores(),
        ProductoService.getProductos(),
      ]);

      const listaProv = Array.isArray(provs) ? provs : [];
      const activos = listaProv.filter(p => isActivoEstado(p.estado));
      const proveedoresFinal = activos.length > 0 ? activos : listaProv;
      setProveedores(proveedoresFinal);

      const listaProd = Array.isArray(prods) ? prods : [];
      setProductos(listaProd.filter(p => isActivoEstado(p.estado)));
      return proveedoresFinal;
    } catch {
      setProveedores([]);
      setProductos([]);
      return [];
    }
  }, []);

  useEffect(() => {
    loadCompras();
    loadCatalogos();
  }, [loadCompras, loadCatalogos]);

  const handleOpenView = async (record: CompraListaDto) => {
    openView(record);
    setDetalleItems([]);
    setLoadingDetalle(true);
    setError(null);
    try {
      const details = await CompraService.getCompraDetalle(record.id_compra);
      setDetalleItems(details);
    } catch (err: unknown) {
      setDetalleItems([]);
      setError(err instanceof Error ? err.message : 'Error al cargar el detalle de la compra');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleOpenCreate = async () => {
    setSuccessMsg(null);
    setFormError(null);
    const lista = proveedores.length > 0 ? proveedores : await loadCatalogos();
    // Solo asigna proveedor por defecto si aún no hay uno guardado en el borrador
    if (!idProveedor && lista.length > 0) {
      setIdProveedor(lista[0].id);
    }
    openCreate();
  };

  const handleCloseCreate = () => {
    // Conserva el borrador; solo cierra el diálogo
    setFormError(null);
    closeDialog();
  };

  const resetCreateForm = useCallback(() => {
    setFilas([createEmptyRow()]);
    setFechaCompra(todayStr());
    setFechaRecepcion(todayStr());
    setIdProveedor(proveedores[0]?.id || 0);
    setFormError(null);
  }, [proveedores]);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (compra: CompraListaDto) => {
      if (filters.idProveedor && compra.id_proveedor.toString() !== filters.idProveedor) return false;
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
  } = useDataTable<CompraListaDto>({
    data: compras,
    searchKeys: ['id_compra', 'proveedor', 'usuario'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = compras.length;
    const montoTotal = compras.reduce((sum, c) => sum + (c.total_compra || 0), 0);
    return { total, montoTotal };
  }, [compras]);

  const productosDelProveedor = useMemo(() => {
    if (!idProveedor) return [];
    return productos.filter(p => p.idProveedor === idProveedor);
  }, [productos, idProveedor]);

  const selectedProductIds = useMemo(
    () => new Set(filas.map(f => f.idProducto).filter(id => id > 0)),
    [filas]
  );

  const productosDisponiblesPara = useCallback(
    (currentId: number) =>
      productosDelProveedor.filter(p => p.id === currentId || !selectedProductIds.has(p.id)),
    [productosDelProveedor, selectedProductIds]
  );

  const totalCompra = useMemo(
    () => filas.reduce((sum, f) => sum + (parseFloat(f.costoTotal) || 0), 0),
    [filas]
  );

  const handleChangeProveedor = (nextId: number) => {
    setIdProveedor(nextId);
    // Limpia productos que no pertenecen al nuevo proveedor
    setFilas(prev =>
      prev.map(f => {
        if (!f.idProducto) return f;
        const prod = productos.find(p => p.id === f.idProducto);
        if (prod && prod.idProveedor === nextId) return f;
        return { ...f, idProducto: 0 };
      })
    );
  };

  const updateFila = (key: string, patch: Partial<DetalleRow>) => {
    setFilas(prev => prev.map(f => (f.key === key ? { ...f, ...patch } : f)));
  };

  const handleAddFila = () => {
    setFilas(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveFila = (key: string) => {
    setFilas(prev => (prev.length <= 1 ? [createEmptyRow()] : prev.filter(f => f.key !== key)));
  };

  const handleRegistrar = async () => {
    if (!idProveedor) {
      setFormError('Seleccione un proveedor.');
      return;
    }
    if (!fechaCompra) {
      setFormError('Ingrese la fecha de compra.');
      return;
    }

    const validas = filas.filter(f => f.idProducto > 0);
    if (validas.length === 0) {
      setFormError('Agregue al menos un producto.');
      return;
    }

    const invalid = validas.find(
      f =>
        f.cantidad <= 0 ||
        !f.costoTotal ||
        isNaN(parseFloat(f.costoTotal)) ||
        parseFloat(f.costoTotal) <= 0
    );
    if (invalid) {
      const prod = productos.find(p => p.id === invalid.idProducto);
      setFormError(`Revise cantidad y costo total de: ${prod?.nombre || 'producto'}`);
      return;
    }

    const idUsuario = getNumericUserId(usuario);
    if (!idUsuario) {
      setFormError('Sesión inválida. Vuelva a iniciar sesión.');
      return;
    }

    const payload: CompraCompletaInsertDto = {
      id_usuario: idUsuario,
      id_proveedor: idProveedor,
      fecha_compra: new Date(fechaCompra).toISOString(),
      fecha_recepcion: fechaRecepcion ? new Date(fechaRecepcion).toISOString() : null,
      detalles: validas.map(f => ({
        id_producto: f.idProducto,
        cantidad: f.cantidad,
        costo_total: parseFloat(f.costoTotal),
        fecha_fabricacion: f.fechaFabricacion ? new Date(f.fechaFabricacion).toISOString() : null,
        fecha_vencimiento: f.fechaVencimiento ? new Date(f.fechaVencimiento).toISOString() : null,
      })),
    };

    setSaving(true);
    setFormError(null);
    try {
      const res = await CompraService.createCompra(payload);
      if (res.success) {
        setSuccessMsg(res.mensaje || `Compra #${res.idCompra} registrada correctamente.`);
        resetCreateForm();
        closeDialog();
        await loadCompras();
      } else {
        setFormError(res.mensaje || 'No se pudo registrar la compra.');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al registrar la compra');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'id_compra',
      header: 'Orden',
      sortable: true,
      width: '100px',
      render: (row: CompraListaDto) => <strong>#{row.id_compra}</strong>,
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      sortable: true,
      render: (row: CompraListaDto) => (
        <div>
          <div className="compra-cell-main">{row.proveedor || '—'}</div>
          <div className="compra-cell-sub">Por: {row.usuario || 'Sistema'}</div>
        </div>
      ),
    },
    {
      key: 'fecha_compra',
      header: 'Fecha',
      sortable: true,
      width: '140px',
      render: (row: CompraListaDto) => formatDate(row.fecha_compra),
    },
    {
      key: 'fecha_recepcion',
      header: 'Recepción',
      sortable: true,
      width: '130px',
      render: (row: CompraListaDto) =>
        row.fecha_recepcion ? formatDate(row.fecha_recepcion) : (
          <span style={{ color: 'var(--erp-text-muted)' }}>—</span>
        ),
    },
    {
      key: 'total_compra',
      header: 'Total',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: CompraListaDto) => fmt(row.total_compra),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: CompraListaDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'PENDIENTE'} showDot />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '60px',
      render: (row: CompraListaDto) => (
        <IconButton
          icon={<FiEye />}
          tooltip="Ver comprobante"
          variant="primary"
          onClick={() => handleOpenView(row)}
        />
      ),
    },
  ];

  const isCreateOpen = dialogState.isOpen && dialogState.mode === 'create';
  const isViewOpen = dialogState.isOpen && dialogState.mode === 'view';

  return (
    <div className="compras-section">
      {error && !isViewOpen && <div className="compras-alert compras-alert-error">{error}</div>}
      {successMsg && <div className="compras-alert compras-alert-success">{successMsg}</div>}

      <div className="erp-indicators-grid" style={{ marginBottom: '12px' }}>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiShoppingCart /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Órdenes</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{fmt(indicators.montoTotal)}</span>
            <span className="erp-indicator-label">Total Invertido</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por ID, proveedor o registrador..."
        onNew={handleOpenCreate}
        newLabel="Registrar Compra"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        filterPanel={
          <div className="compras-filter-panel">
            <div className="erp-form-group" style={{ margin: 0 }}>
              <label className="erp-form-label">Proveedor</label>
              <select
                className="erp-input"
                value={filters.idProveedor}
                onChange={e => setFilters(prev => ({ ...prev, idProveedor: e.target.value }))}
              >
                <option value="">Todos</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.razonSocial || (p as unknown as { razon_social?: string }).razon_social}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card compras-table-card">
        {loading ? (
          <div className="compras-loading">Cargando compras...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={processedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              rowKey={row => row.id_compra}
              emptyMessage="No se encontraron compras registradas"
            />
            <Pagination
              page={pagination.page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pagination.pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      {/* Dialog: Registrar compra */}
      <CrudDialog
        isOpen={isCreateOpen}
        mode="create"
        onClose={handleCloseCreate}
        onConfirm={handleRegistrar}
        title="Registrar compra"
        subtitle="Los datos se conservan si cierra el diálogo por accidente"
        size="xl"
        confirmLabel={saving ? 'Registrando...' : 'Registrar'}
        cancelLabel="Cerrar"
        loading={saving}
      >
        <div className="compra-form">
          {formError && <div className="compras-alert compras-alert-error">{formError}</div>}

          <div className="compra-form-grid">
            <div className="compra-form-group compra-form-span-2">
              <label>Proveedor *</label>
              <select
                className="erp-input"
                value={idProveedor}
                onChange={e => handleChangeProveedor(Number(e.target.value))}
              >
                <option value={0}>Seleccione proveedor...</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>
                    {proveedorLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="compra-form-group">
              <label>Fecha compra *</label>
              <input
                type="date"
                className="erp-input"
                value={fechaCompra}
                onChange={e => setFechaCompra(e.target.value)}
              />
            </div>
            <div className="compra-form-group">
              <label>Fecha recepción</label>
              <input
                type="date"
                className="erp-input"
                value={fechaRecepcion}
                onChange={e => setFechaRecepcion(e.target.value)}
              />
            </div>
          </div>

          <div className="compra-detalle-head">
            <span>Detalle de productos</span>
            <strong>{fmt(totalCompra)}</strong>
          </div>

          <div className="compra-table-wrap">
            <table className="compra-form-table">
              <thead>
                <tr>
                  <th style={{ width: '36px' }}>#</th>
                  <th>Producto</th>
                  <th style={{ width: '80px' }}>Cant.</th>
                  <th style={{ width: '110px' }}>Costo total</th>
                  <th style={{ width: '130px' }}>Fabricación</th>
                  <th style={{ width: '130px' }}>Vencimiento</th>
                  <th style={{ width: '40px' }} />
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => {
                  const opciones = productosDisponiblesPara(fila.idProducto);
                  return (
                    <tr key={fila.key}>
                      <td className="compra-row-num">{index + 1}</td>
                      <td>
                        <select
                          className="erp-input"
                          value={fila.idProducto}
                          disabled={!idProveedor}
                          onChange={e => updateFila(fila.key, { idProducto: Number(e.target.value) })}
                        >
                          <option value={0}>
                            {!idProveedor
                              ? 'Seleccione proveedor primero...'
                              : opciones.length === 0 && !fila.idProducto
                                ? 'Sin productos de este proveedor'
                                : 'Seleccione producto...'}
                          </option>
                          {opciones.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.codigo} — {p.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="erp-input"
                          min={1}
                          value={fila.cantidad}
                          onChange={e =>
                            updateFila(fila.key, { cantidad: Math.max(1, Number(e.target.value) || 1) })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="erp-input"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={fila.costoTotal}
                          onChange={e => updateFila(fila.key, { costoTotal: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="erp-input"
                          value={fila.fechaFabricacion}
                          onChange={e => updateFila(fila.key, { fechaFabricacion: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="erp-input"
                          value={fila.fechaVencimiento}
                          onChange={e => updateFila(fila.key, { fechaVencimiento: e.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="compra-row-remove"
                          onClick={() => handleRemoveFila(fila.key)}
                          title="Quitar"
                          aria-label="Quitar fila"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button type="button" className="compra-add-row" onClick={handleAddFila}>
            <FiPlus size={14} /> Agregar otra línea
          </button>
        </div>
      </CrudDialog>

      {/* Dialog: Ver comprobante */}
      <CrudDialog
        isOpen={isViewOpen}
        mode="view"
        onClose={closeDialog}
        onConfirm={closeDialog}
        title={`Comprobante de compra #${dialogState.record?.id_compra ?? ''}`}
        subtitle="Cabecera y detalle de artículos ingresados"
        size="lg"
        confirmLabel="Cerrar"
      >
        {dialogState.record && (
          <div className="compra-dialog-body">
            <div className="compra-dialog-header-card">
              <div><span>Proveedor</span><strong>{dialogState.record.proveedor || '—'}</strong></div>
              <div><span>Registrado por</span><strong>{dialogState.record.usuario || '—'}</strong></div>
              <div><span>Fecha compra</span><strong>{formatDate(dialogState.record.fecha_compra)}</strong></div>
              <div>
                <span>Fecha recepción</span>
                <strong>
                  {dialogState.record.fecha_recepcion
                    ? formatDate(dialogState.record.fecha_recepcion)
                    : '—'}
                </strong>
              </div>
              <div><span>Total</span><strong>{fmt(dialogState.record.total_compra)}</strong></div>
              <div>
                <span>Estado</span>
                <strong>{dialogState.record.estado ? 'Activo' : 'Pendiente'}</strong>
              </div>
            </div>

            <h4 className="compra-dialog-detail-title">Detalle de artículos</h4>

            {loadingDetalle ? (
              <p className="compra-empty">Cargando detalle...</p>
            ) : (
              <div className="compra-dialog-table-wrap">
                <table className="compra-detail-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-right">C. Unit.</th>
                      <th className="text-right">C. Total</th>
                      <th>Lote</th>
                      <th>Stock</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="compra-empty-row">Sin artículos registrados</td>
                      </tr>
                    ) : (
                      detalleItems.map(det => (
                        <tr key={det.id_detalle_compra}>
                          <td className="mono">{det.codigo_producto}</td>
                          <td>{det.producto}</td>
                          <td className="text-center">{det.cantidad}</td>
                          <td className="text-right">{fmt(det.costo_unitario)}</td>
                          <td className="text-right"><strong>{fmt(det.costo_total)}</strong></td>
                          <td className="mono">{det.codigo_lote || '—'}</td>
                          <td className="text-center">{det.stock_actual ?? '—'}</td>
                          <td>
                            {det.fecha_vencimiento
                              ? formatDate(det.fecha_vencimiento)
                              : <span style={{ color: 'var(--erp-text-muted)' }}>—</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default ComprasSection;
