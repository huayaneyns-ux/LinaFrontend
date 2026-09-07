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
import { formatDate } from '../../../../Utils/formatters';
import { isActivoEstado } from '../../../../Utils/imageUtils';
import { getNumericUserId } from '../../../../Utils/auth';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import IconButton from '../../../../Components/ERP/IconButton';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ERPEmptySelection from '../../../../Components/ERP/ERPEmptySelection';
import {
  FiShoppingCart,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiPlus,
  FiSave,
  FiX,
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

export const ComprasSection = () => {
  const { usuario } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCompra, setSelectedCompra] = useState<CompraListaDto | null>(null);

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
  const [showFilters, setShowFilters] = useState(true);

  // Borrador del registro
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
    setSelectedCompra(record);
    setFormMode('view');
    setActiveTab('form');
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
    setSelectedCompra(null);
    setFormMode('create');
    setActiveTab('form');
    const lista = proveedores.length > 0 ? proveedores : await loadCatalogos();
    if (!idProveedor && lista.length > 0) {
      setIdProveedor(lista[0].id);
    }
    setFilas([createEmptyRow()]);
    setFechaCompra(todayStr());
    setFechaRecepcion(todayStr());
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

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setActiveTab('list');
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
          <div className="compra-cell-main" style={{ fontWeight: 600 }}>{row.proveedor || '—'}</div>
          <div className="compra-cell-sub" style={{ fontSize: '11px', color: 'var(--erp-text-muted)' }}>Por: {row.usuario || 'Sistema'}</div>
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
      render: (row: CompraListaDto) => <strong>{fmt(row.total_compra)}</strong>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: CompraListaDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'PENDIENTE'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: CompraListaDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver comprobante"
            variant="primary"
            onClick={() => handleOpenView(row)}
          />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="erp-indicators-grid">
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
        newLabel="Nueva Compra"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Proveedor</label>
            <select
              className="erp-filter-select"
              value={filters.idProveedor}
              onChange={e => setFilters(prev => ({ ...prev, idProveedor: e.target.value }))}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>
                  {p.razonSocial || (p as unknown as { razon_social?: string }).razon_social}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-success-light)', color: 'var(--erp-success)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-success)' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando compras...</div>
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
  );

  const formContent = (
    <div className="erp-form">
      {formMode === 'create' ? (
        <form onSubmit={handleRegistrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">Nueva Orden de Compra</h3>

            {formError && (
              <div style={{ padding: '8px 12px', marginBottom: '14px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
                {formError}
              </div>
            )}

            <div className="compra-form-grid">
              <div className="erp-form-row">
                <div className="erp-form-group erp-form-span-2">
                  <label className="erp-form-label">Proveedor *</label>
                  <select
                    className="erp-input"
                    value={idProveedor}
                    onChange={e => handleChangeProveedor(Number(e.target.value))}
                    required
                  >
                    <option value={0}>Seleccione proveedor...</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>
                        {proveedorLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha compra *</label>
                  <input
                    type="date"
                    className="erp-input"
                    value={fechaCompra}
                    onChange={e => setFechaCompra(e.target.value)}
                    required
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha recepción</label>
                  <input
                    type="date"
                    className="erp-input"
                    value={fechaRecepcion}
                    onChange={e => setFechaRecepcion(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="erp-form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 className="erp-form-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Detalle de productos</h3>
              <div style={{ fontSize: '14px' }}>
                Total Orden: <strong style={{ color: 'var(--erp-primary)', fontSize: '16px' }}>{fmt(totalCompra)}</strong>
              </div>
            </div>

            <div className="compra-table-wrap" style={{ border: '1px solid var(--erp-border)', overflowX: 'auto' }}>
              <table className="compra-form-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--erp-bg-secondary)', borderBottom: '1px solid var(--erp-border)' }}>
                    <th style={{ width: '36px', padding: '6px 8px', fontSize: '11px' }}>#</th>
                    <th style={{ padding: '6px 8px', fontSize: '11px', textAlign: 'left' }}>Producto</th>
                    <th style={{ width: '80px', padding: '6px 8px', fontSize: '11px', textAlign: 'right' }}>Cant.</th>
                    <th style={{ width: '110px', padding: '6px 8px', fontSize: '11px', textAlign: 'right' }}>Costo total</th>
                    <th style={{ width: '130px', padding: '6px 8px', fontSize: '11px' }}>Fabricación</th>
                    <th style={{ width: '130px', padding: '6px 8px', fontSize: '11px' }}>Vencimiento</th>
                    <th style={{ width: '40px', padding: '6px 8px' }} />
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, index) => {
                    const opciones = productosDisponiblesPara(fila.idProducto);
                    return (
                      <tr key={fila.key} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                        <td className="compra-row-num" style={{ padding: '4px 8px', textAlign: 'center', fontSize: '12px' }}>{index + 1}</td>
                        <td style={{ padding: '4px 8px' }}>
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
                        <td style={{ padding: '4px 8px' }}>
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
                        <td style={{ padding: '4px 8px' }}>
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
                        <td style={{ padding: '4px 8px' }}>
                          <input
                            type="date"
                            className="erp-input"
                            value={fila.fechaFabricacion}
                            onChange={e => updateFila(fila.key, { fechaFabricacion: e.target.value })}
                          />
                        </td>
                        <td style={{ padding: '4px 8px' }}>
                          <input
                            type="date"
                            className="erp-input"
                            value={fila.fechaVencimiento}
                            onChange={e => updateFila(fila.key, { fechaVencimiento: e.target.value })}
                          />
                        </td>
                        <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="erp-btn erp-btn-sm erp-btn-danger"
                            onClick={() => handleRemoveFila(fila.key)}
                            title="Quitar"
                            aria-label="Quitar fila"
                            style={{ padding: '4px 6px' }}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="button" className="erp-btn erp-btn-secondary" onClick={handleAddFila}>
                <FiPlus size={14} /> <span>Agregar otra línea</span>
              </button>
            </div>
          </div>

          <div className="erp-form-actions">
            <button
              type="button"
              className="erp-btn erp-btn-secondary"
              onClick={() => setActiveTab('list')}
            >
              <FiX />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="erp-btn erp-btn-primary"
              disabled={saving}
            >
              <FiSave />
              <span>{saving ? 'Registrando...' : 'Registrar Compra'}</span>
            </button>
          </div>
        </form>
      ) : selectedCompra ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              Comprobante de Compra #{selectedCompra.id_compra}
            </h3>

            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Proveedor</label>
                  <input className="erp-input" readOnly value={selectedCompra.proveedor || '—'} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Registrado por</label>
                  <input className="erp-input" readOnly value={selectedCompra.usuario || '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Compra</label>
                  <input className="erp-input" readOnly value={formatDate(selectedCompra.fecha_compra)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Fecha Recepción</label>
                  <input className="erp-input" readOnly value={selectedCompra.fecha_recepcion ? formatDate(selectedCompra.fecha_recepcion) : '—'} />
                </div>
              </div>
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Total Invertido</label>
                  <input className="erp-input" readOnly value={fmt(selectedCompra.total_compra)} />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado</label>
                  <div className="erp-form-status-value">
                    <StatusBadge status={selectedCompra.estado ? 'ACTIVO' : 'PENDIENTE'} showText />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="erp-form-section">
            <h3 className="erp-form-section-title">Detalle de Artículos</h3>

            {loadingDetalle ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando detalle...</p>
            ) : (
              <div style={{ border: '1px solid var(--erp-border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--erp-bg-secondary)', borderBottom: '1px solid var(--erp-border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Código</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Producto</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cant.</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>C. Unit.</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>C. Total</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Lote</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Stock</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Sin artículos registrados</td>
                      </tr>
                    ) : (
                      detalleItems.map(det => (
                        <tr key={det.id_detalle_compra} style={{ borderBottom: '1px solid var(--erp-border)' }}>
                          <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{det.codigo_producto}</td>
                          <td style={{ padding: '6px 8px' }}>{det.producto}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{det.cantidad}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(det.costo_unitario)}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}><strong>{fmt(det.costo_total)}</strong></td>
                          <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{det.codigo_lote || '—'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{det.stock_actual ?? '—'}</td>
                          <td style={{ padding: '6px 8px' }}>
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
        </div>
      ) : (
        <ERPEmptySelection
          icon={<FiShoppingCart />}
          title="Ninguna orden de compra seleccionada"
          description="Seleccione una orden en la pestaña Registros para ver su detalle de lotes y costos, o cree una nueva orden."
          onBack={() => setActiveTab('list')}
          backLabel="Ir a Registros de Compras"
        />
      )}
    </div>
  );

  return (
    <SubmoduleTwoTabsLayout
      title="Órdenes de Compra & Abastecimiento"
      subtitle="Registra y monitorea las compras de mercadería a proveedores externos y lotes recibidos"
      entityName="Compra"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode={formMode}
      onNew={handleOpenCreate}
      listContent={listContent}
      formContent={formContent}
    />
  );
};

export default ComprasSection;
