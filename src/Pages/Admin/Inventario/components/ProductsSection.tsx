import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { CategoriaService } from '../../../../Services/Admin/Inventario/Categoria';
import { MarcaService } from '../../../../Services/Admin/Inventario/Marca';
import { UnidadMedidaService } from '../../../../Services/Admin/Inventario/UnidadMedida';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import type {
  ProductoSelectDto,
  ProductoInsertDto,
  ProductoUpdateDto,
} from '../../../../Types/Admin/Inventario/Producto';
import type { CategoriaSelectDto } from '../../../../Types/Admin/Inventario/Categoria';
import type { MarcaSelectDto } from '../../../../Types/Admin/Inventario/Marca';
import type { UnidadMedidaSelectDto } from '../../../../Types/Admin/Inventario/UnidadMedida';
import type { Proveedor } from '../../../../Types/Admin/Compras/Proveedor';
import ImageUpload, { type ImageUploadHandle } from '../../../../Components/ERP/ImageUpload';

import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import {
  FiBox,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiImage,
  FiHash,
} from 'react-icons/fi';

interface ProductFilters {
  categoria: string;
  marca: string;
  proveedor: string;
  estado: string;
}

const DEFAULT_FILTERS: ProductFilters = {
  categoria: '',
  marca: '',
  proveedor: '',
  estado: '',
};

const EMPTY_FORM: Partial<ProductoSelectDto> = {
  codigo: '',
  sku: '',
  nombre: '',
  descripcion: '',
  precioVenta: 0,
  factorConversion: 1,
  stockMinimo: 0,
  rutaImagen: '',
  publicIdImagen: '',
  idCategoria: 0,
  idProveedor: 0,
  idMarca: 0,
  idUnidadMedida: 0,
};

// ─── Generar código automático PROD-DDMMYYHHMMSSMM ────────────────────────────
function generarCodigoProducto(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yy = String(now.getFullYear()).slice(-2);
  const HH = pad(now.getHours());
  const MM = pad(now.getMinutes());
  const SS = pad(now.getSeconds());
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `PROD-${dd}${mm}${yy}${HH}${MM}${SS}${ms}`;
}

import { resolveImageUrl, gestionarImagenAlGuardar } from '../../../../Utils/imageUtils';

const ProductsSection = () => {
  const [products, setProducts] = useState<ProductoSelectDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaSelectDto[]>([]);
  const [marcas, setMarcas] = useState<MarcaSelectDto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedidaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Código generado al abrir el modal de creación
  const [codigoGenerado, setCodigoGenerado] = useState('');

  // Ref para acceder al archivo pendiente del ImageUpload al momento de guardar
  const imageUploadRef = useRef<ImageUploadHandle>(null);
  // publicIdImagen original al abrir edición (para eliminar en Cloudinary si quita la foto)
  const originalPublicIdRef = useRef<string>('');
  const originalRutaRef = useRef<string>('');

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<ProductoSelectDto>();

  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);

  const [formState, setFormState] = useState<Partial<ProductoSelectDto>>(EMPTY_FORM);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductoService.getProductos();
      setProducts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [cats, marcs, provs, unis] = await Promise.all([
          CategoriaService.getCategorias(),
          MarcaService.getMarcas(),
          ProveedorService.getProveedores(),
          UnidadMedidaService.getUnidades(),
        ]);
        setCategorias(cats.filter(c => c.estado !== false));
        setMarcas(marcs.filter(m => m.estado !== false));
        setProveedores(provs.filter(p => p.estado));
        setUnidades(unis.filter(u => u.estado));
      } catch {
        // Los catálogos se pueden derivar de los productos si falla la carga
      }
    };
    loadCatalogs();
  }, []);

  const setFilter = useCallback(<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const categoriaOptions = useMemo(() => {
    const map = new Map<number, string>();
    categorias.forEach(c => map.set(c.id, c.nombre));
    products.forEach(p => map.set(p.idCategoria, p.categoria));
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [categorias, products]);

  const marcaOptions = useMemo(() => {
    const map = new Map<number, string>();
    marcas.forEach(m => map.set(m.id, m.nombre));
    products.forEach(p => map.set(p.idMarca, p.marca));
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [marcas, products]);

  const proveedorOptions = useMemo(() => {
    const map = new Map<number, string>();
    proveedores.forEach(p => map.set(p.id, p.razonSocial));
    products.forEach(p => map.set(p.idProveedor, p.razonSocial));
    return Array.from(map.entries())
      .map(([id, razonSocial]) => ({ id, razonSocial }))
      .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
  }, [proveedores, products]);

  const unidadOptions = useMemo(() => {
    const map = new Map<number, { nombre: string; abreviatura: string }>();
    unidades.forEach(u => map.set(u.id, { nombre: u.nombre, abreviatura: u.abreviatura }));
    products.forEach(p =>
      map.set(p.idUnidadMedida, { nombre: p.unidadMedida, abreviatura: p.abreviatura })
    );
    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [unidades, products]);

  const externalFilter = useCallback(
    (prod: ProductoSelectDto) => {
      if (!showDisabled && !prod.estado) return false;
      if (filters.categoria && prod.idCategoria !== Number(filters.categoria)) return false;
      if (filters.marca && prod.idMarca !== Number(filters.marca)) return false;
      if (filters.proveedor && prod.idProveedor !== Number(filters.proveedor)) return false;
      if (filters.estado) {
        const isActive = prod.estado;
        if (filters.estado === 'ACTIVO' && !isActive) return false;
        if (filters.estado === 'INACTIVO' && isActive) return false;
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
  } = useDataTable<ProductoSelectDto>({
    data: products,
    searchKeys: ['codigo', 'sku', 'nombre', 'categoria', 'marca', 'razonSocial', 'descripcion'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = products.length;
    const activos = products.filter(p => p.estado).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [products]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: ProductoSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      try {
        const detail = await ProductoService.getProductoById(record.id);
        setFormState({ ...detail });
        originalPublicIdRef.current = detail.publicIdImagen || '';
        originalRutaRef.current = detail.rutaImagen || '';
      } catch {
        setFormState({ ...record });
        originalPublicIdRef.current = record.publicIdImagen || '';
        originalRutaRef.current = record.rutaImagen || '';
      }
    } else if (mode === 'delete' && record) {
      setFormState({ ...record });
    } else {
      originalPublicIdRef.current = '';
      originalRutaRef.current = '';
      // Crear: generar código automático
      const codigo = generarCodigoProducto();
      setCodigoGenerado(codigo);
      setFormState({
        ...EMPTY_FORM,
        codigo,
        idCategoria: categoriaOptions[0]?.id ?? 0,
        idMarca: marcaOptions[0]?.id ?? 0,
        idProveedor: proveedorOptions[0]?.id ?? 0,
        idUnidadMedida: unidadOptions[0]?.id ?? 0,
      });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);

    try {
      const pending = imageUploadRef.current?.getPendingFile();
      const { ruta: rutaImagen, publicId: publicIdImagen } = await gestionarImagenAlGuardar({
        pendingFile: pending?.file ?? null,
        rutaFormulario: formState.rutaImagen,
        publicIdFormulario: formState.publicIdImagen,
        rutaOriginal: originalRutaRef.current,
        publicIdOriginal: originalPublicIdRef.current,
        esEdicion: dialogState.mode === 'edit',
      });

      if (dialogState.mode === 'create') {
        const payload: ProductoInsertDto = {
          codigo: formState.codigo || codigoGenerado,
          sku: formState.sku || '',
          nombre: formState.nombre || '',
          descripcion: formState.descripcion,
          precioVenta: Number(formState.precioVenta) || 0,
          factorConversion: Number(formState.factorConversion) || 1,
          stockMinimo: Number(formState.stockMinimo) || 0,
          rutaImagen: rutaImagen || undefined,
          publicIdImagen: publicIdImagen || undefined,
          idCategoria: Number(formState.idCategoria),
          idProveedor: Number(formState.idProveedor),
          idMarca: Number(formState.idMarca),
          idUnidadMedida: Number(formState.idUnidadMedida),
        };
        await ProductoService.createProducto(payload);
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        const payload: ProductoUpdateDto = {
          id: dialogState.record.id,
          codigo: formState.codigo || '',
          sku: formState.sku || '',
          nombre: formState.nombre || '',
          descripcion: formState.descripcion,
          precioVenta: Number(formState.precioVenta) || 0,
          factorConversion: Number(formState.factorConversion) || 1,
          stockMinimo: Number(formState.stockMinimo) || 0,
          rutaImagen: rutaImagen || undefined,
          publicIdImagen: publicIdImagen || undefined,
          idCategoria: Number(formState.idCategoria),
          idProveedor: Number(formState.idProveedor),
          idMarca: Number(formState.idMarca),
          idUnidadMedida: Number(formState.idUnidadMedida),
        };
        await ProductoService.updateProducto(payload);
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        await ProductoService.deleteProducto(dialogState.record.id);
      }

      // ── 4. Limpiar y recargar ────────────────────────────────────────────────
      imageUploadRef.current?.clearPending();
      await loadProducts();
      closeDialog();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar los cambios';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Columnas de la tabla ───────────────────────────────────────────────────
  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true,
      width: '110px',
      render: (row: ProductoSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)', fontSize: '12px' }}>{row.codigo}</strong>
      ),
    },
    {
      key: 'rutaImagen',
      header: 'Img',
      width: '48px',
      render: (row: ProductoSelectDto) => {
        const src = resolveImageUrl(row.rutaImagen);
        return src ? (
          <img
            src={src}
            alt={row.nombre}
            style={{
              width: '28px',
              height: '28px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid var(--erp-border)',
            }}
          />
        ) : (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: '1px solid var(--erp-border)',
              backgroundColor: 'var(--erp-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--erp-text-muted)',
            }}
          >
            <FiBox size={13} />
          </div>
        );
      },
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (row: ProductoSelectDto) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.nombre}</div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--erp-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '280px',
            }}
          >
            {row.descripcion}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      sortable: true,
      width: '130px',
    },
    {
      key: 'marca',
      header: 'Marca',
      sortable: true,
      width: '120px',
    },
    {
      key: 'razonSocial',
      header: 'Proveedor',
      sortable: true,
      width: '140px',
    },
    {
      key: 'precioVenta',
      header: 'Precio',
      sortable: true,
      align: 'right' as const,
      width: '90px',
      render: (row: ProductoSelectDto) => `S/ ${(row.precioVenta || 0).toFixed(2)}`,
    },
    {
      key: 'stockMinimo',
      header: 'Stock mín.',
      sortable: true,
      align: 'center' as const,
      width: '80px',
      render: (row: ProductoSelectDto) => (
        <span style={{ fontWeight: 600 }}>{row.stockMinimo}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '100px',
      render: (row: ProductoSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: ProductoSelectDto) => (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <IconButton
            icon={<FiEye />}
            tooltip="Ver detalle"
            variant="primary"
            onClick={() => handleOpenDialog('view', row)}
          />
          <IconButton
            icon={<FiEdit2 />}
            tooltip="Editar"
            variant="warning"
            onClick={() => handleOpenDialog('edit', row)}
          />
          <IconButton
            icon={<FiTrash2 />}
            tooltip="Eliminar"
            variant="danger"
            onClick={() => handleOpenDialog('delete', row)}
          />
        </div>
      ),
    },
  ];

  // Código a mostrar en el dialog (generado o existente)
  const codigoEnForm =
    dialogState.mode === 'create'
      ? codigoGenerado
      : formState.codigo || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
      {error && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '8px',
            backgroundColor: 'var(--erp-danger-light)',
            color: 'var(--erp-danger)',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon">
            <FiBox />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Productos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success">
            <FiCheckCircle />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Productos Activos</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger">
            <FiMinusCircle />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Productos Inactivos</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código, nombre, marca o proveedor..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Producto"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        extraActions={
          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
            onClick={() => setShowDisabled(prev => !prev)}
            title={
              showDisabled
                ? 'Ocultar productos deshabilitados'
                : 'Incluir productos deshabilitados en la lista'
            }
          >
            {showDisabled ? <FiEyeOff /> : <FiEye />}
            {showDisabled ? 'Ocultar deshabilitados' : 'Mostrar deshabilitados'}
          </button>
        }
        filterPanel={
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              width: '100%',
            }}
          >
            <div className="erp-form-group">
              <label className="erp-form-label">Categoría</label>
              <select
                className="erp-input"
                value={filters.categoria}
                onChange={e => setFilter('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categoriaOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Marca</label>
              <select
                className="erp-input"
                value={filters.marca}
                onChange={e => setFilter('marca', e.target.value)}
              >
                <option value="">Todas las marcas</option>
                {marcaOptions.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Proveedor</label>
              <select
                className="erp-input"
                value={filters.proveedor}
                onChange={e => setFilter('proveedor', e.target.value)}
              >
                <option value="">Todos los proveedores</option>
                {proveedorOptions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.razonSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado}
                onChange={e => setFilter('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
        }
      />

      <div
        className="erp-table-card"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
            Cargando productos...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={processedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              rowKey={row => row.id}
              emptyMessage="No se encontraron productos en el almacén"
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

      {/* ── Dialog ── */}
      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={saving}
        title={
          dialogState.mode === 'create'
            ? 'Agregar Producto'
            : dialogState.mode === 'edit'
              ? 'Editar Producto'
              : dialogState.mode === 'view'
                ? 'Detalle de Producto'
                : 'Eliminar Producto'
        }
        size="xl"
        deleteMessage={
          dialogState.record ? (
            <>
              ¿Está seguro de eliminar el producto <strong>{dialogState.record.nombre}</strong> (
              {dialogState.record.codigo})?
            </>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-dialog-split">
            {/* Columna izquierda: datos (3/5) */}
            <div className="erp-dialog-split-fields">
              <div className="erp-form-group span-2" style={{ gridColumn: 'span 2' }}>
                <label className="erp-form-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.nombre || ''}
                  onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={dialogState.mode === 'view'}
                  placeholder="Ej: Lapicero de tinta gel"
                />
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">SKU</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.sku || ''}
                  onChange={e => setFormState(prev => ({ ...prev, sku: e.target.value }))}
                  disabled={dialogState.mode === 'view'}
                  placeholder="Ej: SKU-001"
                />
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Precio de venta (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  className="erp-input"
                  value={formState.precioVenta ?? 0}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, precioVenta: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                />
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Categoría</label>
                <select
                  className="erp-input"
                  value={formState.idCategoria || ''}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, idCategoria: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                >
                  {categoriaOptions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Marca</label>
                <select
                  className="erp-input"
                  value={formState.idMarca || ''}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, idMarca: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                >
                  {marcaOptions.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Proveedor</label>
                <select
                  className="erp-input"
                  value={formState.idProveedor || ''}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, idProveedor: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                >
                  {proveedorOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.razonSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Unidad de medida</label>
                <select
                  className="erp-input"
                  value={formState.idUnidadMedida || ''}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, idUnidadMedida: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                >
                  {unidadOptions.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.abreviatura})
                    </option>
                  ))}
                </select>
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Stock mínimo</label>
                <input
                  type="number"
                  className="erp-input"
                  value={formState.stockMinimo ?? 0}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, stockMinimo: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                />
              </div>

              <div className="erp-form-group">
                <label className="erp-form-label">Factor de conversión</label>
                <input
                  type="number"
                  step="0.01"
                  className="erp-input"
                  value={formState.factorConversion ?? 1}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, factorConversion: Number(e.target.value) }))
                  }
                  disabled={dialogState.mode === 'view'}
                />
              </div>

              {dialogState.mode === 'view' && (
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado</label>
                  <div style={{ paddingTop: '4px' }}>
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} />
                  </div>
                </div>
              )}

              <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="erp-form-label">Descripción</label>
                <textarea
                  className="erp-input"
                  rows={2}
                  value={formState.descripcion || ''}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, descripcion: e.target.value }))
                  }
                  disabled={dialogState.mode === 'view'}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            {/* Columna derecha: código + imagen (2/5) */}
            <div className="erp-dialog-split-side">
              <div>
                <label className="erp-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <FiHash size={11} />
                  Código de Producto
                </label>
                <div className="erp-code-badge">{codigoEnForm || '—'}</div>
                <p className="erp-code-hint">
                  {dialogState.mode === 'create'
                    ? 'Generado automáticamente'
                    : 'Código del producto'}
                </p>
              </div>

              <div>
                <label className="erp-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <FiImage size={11} />
                  Imagen
                </label>
                {dialogState.mode === 'view' ? (
                  (() => {
                    const imgSrc = resolveImageUrl(formState.rutaImagen);
                    return imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={formState.nombre}
                        style={{
                          width: '100%',
                          maxHeight: '160px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid var(--erp-border)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100px',
                          borderRadius: '8px',
                          border: '1px dashed var(--erp-border)',
                          backgroundColor: 'var(--erp-bg-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: 'var(--erp-text-muted)',
                        }}
                      >
                        <FiBox size={24} />
                        <span style={{ fontSize: '11px' }}>Sin imagen</span>
                      </div>
                    );
                  })()
                ) : (
                  <ImageUpload
                    ref={imageUploadRef}
                    value={formState.rutaImagen}
                    onChange={ruta => setFormState(prev => ({ ...prev, rutaImagen: ruta }))}
                    folder="productos"
                    compact
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default ProductsSection;
