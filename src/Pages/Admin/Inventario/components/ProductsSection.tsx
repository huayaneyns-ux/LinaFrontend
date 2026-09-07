import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { CategoriaService } from '../../../../Services/Admin/Inventario/Categoria';
import { MarcaService } from '../../../../Services/Admin/Inventario/Marca';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import { UnidadMedidaService } from '../../../../Services/Admin/Inventario/UnidadMedida';
import type {
  ProductoSelectDto,
  ProductoInsertDto,
  ProductoUpdateDto,
} from '../../../../Types/Admin/Inventario/Producto';
import type { CategoriaSelectDto } from '../../../../Types/Admin/Inventario/Categoria';
import type { MarcaSelectDto } from '../../../../Types/Admin/Inventario/Marca';
import type { Proveedor } from '../../../../Types/Admin/Compras/Proveedor';
import type { UnidadMedidaSelectDto } from '../../../../Types/Admin/Inventario/UnidadMedida';

import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import ImageUpload, { type ImageUploadHandle } from '../../../../Components/ERP/ImageUpload';
import { resolveImageUrl, gestionarImagenAlGuardar } from '../../../../Utils/imageUtils';
import {
  FiBox,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
  FiDollarSign,
  FiInfo,
  FiTag,
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

export const ProductsSection = () => {
  const [products, setProducts] = useState<ProductoSelectDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaSelectDto[]>([]);
  const [marcas, setMarcas] = useState<MarcaSelectDto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedidaSelectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<ProductoSelectDto | null>(null);
  const [formState, setFormState] = useState<Partial<ProductoSelectDto>>(EMPTY_FORM);

  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const originalPublicIdRef = useRef<string>('');
  const originalRutaRef = useRef<string>('');

  const { dialogState, openDelete, closeDialog } = useDialog<ProductoSelectDto>();

  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [showDisabled, setShowDisabled] = useState(false);

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
        // Ignored
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

  const handleStartCreate = () => {
    const codigo = generarCodigoProducto();
    setFormState({
      ...EMPTY_FORM,
      codigo,
      idCategoria: categorias[0]?.id ?? 0,
      idMarca: marcas[0]?.id ?? 0,
      idProveedor: proveedores[0]?.id ?? 0,
      idUnidadMedida: unidades[0]?.id ?? 0,
    });
    originalPublicIdRef.current = '';
    originalRutaRef.current = '';
    setSelectedProduct(null);
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: ProductoSelectDto) => {
    setSelectedProduct(record);
    setFormMode('edit');
    setActiveTab('form');
    try {
      const detail = await ProductoService.getProductoById(record.id);
      setFormState(detail);
      originalPublicIdRef.current = detail.publicIdImagen || '';
      originalRutaRef.current = detail.rutaImagen || '';
    } catch {
      setFormState(record);
    }
  };

  const handleStartView = async (record: ProductoSelectDto) => {
    setSelectedProduct(record);
    setFormMode('view');
    setActiveTab('form');
    try {
      const detail = await ProductoService.getProductoById(record.id);
      setFormState(detail);
      originalPublicIdRef.current = detail.publicIdImagen || '';
      originalRutaRef.current = detail.rutaImagen || '';
    } catch {
      setFormState(record);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;
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
        esEdicion: formMode === 'edit',
      });

      if (formMode === 'create') {
        const payload: ProductoInsertDto = {
          codigo: formState.codigo || generarCodigoProducto(),
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
      } else if (formMode === 'edit' && selectedProduct) {
        const payload: ProductoUpdateDto = {
          id: selectedProduct.id,
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
      }

      imageUploadRef.current?.clearPending();
      await loadProducts();
      setActiveTab('list');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dialogState.record) return;
    setSaving(true);
    setError(null);
    try {
      await ProductoService.deleteProducto(dialogState.record.id);
      await loadProducts();
      closeDialog();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto');
    } finally {
      setSaving(false);
    }
  };

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
      width: '44px',
      render: (row: ProductoSelectDto) => {
        const src = resolveImageUrl(row.rutaImagen);
        return src ? (
          <img
            src={src}
            alt={row.nombre}
            style={{
              width: '26px',
              height: '26px',
              objectFit: 'cover',
              borderRadius: '0px',
              border: '1px solid var(--erp-border)',
            }}
          />
        ) : (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '0px',
              border: '1px solid var(--erp-border)',
              backgroundColor: 'var(--erp-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--erp-text-muted)',
            }}
          >
            <FiBox size={12} />
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
          <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{row.nombre}</div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--erp-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '260px',
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
      width: '120px',
    },
    {
      key: 'marca',
      header: 'Marca',
      sortable: true,
      width: '110px',
    },
    {
      key: 'razonSocial',
      header: 'Proveedor',
      sortable: true,
      width: '130px',
    },
    {
      key: 'precioVenta',
      header: 'Precio',
      sortable: true,
      align: 'right' as const,
      width: '85px',
      render: (row: ProductoSelectDto) => `S/ ${(row.precioVenta || 0).toFixed(2)}`,
    },
    {
      key: 'stockMinimo',
      header: 'Mín.',
      sortable: true,
      align: 'center' as const,
      width: '65px',
      render: (row: ProductoSelectDto) => (
        <span style={{ fontWeight: 600 }}>{row.stockMinimo}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: ProductoSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: ProductoSelectDto) => (
        <div className="erp-table-actions">
          <IconButton
            icon={<FiEye />}
            tooltip="Ver detalle"
            variant="primary"
            onClick={() => handleStartView(row)}
          />
          <IconButton
            icon={<FiEdit2 />}
            tooltip="Editar"
            variant="warning"
            onClick={() => handleStartEdit(row)}
          />
          <IconButton
            icon={<FiTrash2 />}
            tooltip="Eliminar"
            variant="danger"
            onClick={() => openDelete(row)}
          />
        </div>
      ),
    },
  ];

  const imgSrc = resolveImageUrl(formState.rutaImagen);

  return (
    <SubmoduleTwoTabsLayout
      title="Catálogo de Productos"
      subtitle="Visualiza, filtra y administra los artículos registrados en el inventario"
      entityName="Producto"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      formMode={formMode}
      onNew={handleStartCreate}
      extraHeaderActions={
        activeTab === 'list' && (
          <button
            type="button"
            className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
            onClick={() => setShowDisabled(prev => !prev)}
          >
            {showDisabled ? <FiEyeOff /> : <FiEye />}
            <span>{showDisabled ? 'Ocultar inactivos' : 'Mostrar inactivos'}</span>
          </button>
        )
      }
      listContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {error && (
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', border: '1px solid var(--erp-danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Indicadores Compactos */}
          <div className="erp-indicators-grid" style={{ marginBottom: 0 }}>
            <div className="erp-indicator-card">
              <div className="erp-indicator-icon"><FiBox /></div>
              <div className="erp-indicator-info">
                <span className="erp-indicator-value">{indicators.total}</span>
                <span className="erp-indicator-label">Total Productos</span>
              </div>
            </div>
            <div className="erp-indicator-card">
              <div className="erp-indicator-icon success"><FiCheckCircle /></div>
              <div className="erp-indicator-info">
                <span className="erp-indicator-value">{indicators.activos}</span>
                <span className="erp-indicator-label">Productos Activos</span>
              </div>
            </div>
            <div className="erp-indicator-card">
              <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
              <div className="erp-indicator-info">
                <span className="erp-indicator-value">{indicators.inactivos}</span>
                <span className="erp-indicator-label">Productos Inactivos</span>
              </div>
            </div>
          </div>

          {/* Filtros Toolbar */}
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar por código, nombre, marca o proveedor..."
            onNew={handleStartCreate}
            newLabel="Nuevo Producto"
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(prev => !prev)}
            filterCount={filterCount}
            onResetFilters={hasActiveFilters ? resetFilters : undefined}
            alwaysShowFilters={true}
            filterPanel={
              <>
                <div className="erp-filter-group">
                  <label className="erp-filter-label">Categoría</label>
                  <select
                    className="erp-filter-select"
                    value={filters.categoria}
                    onChange={e => setFilter('categoria', e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriaOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-filter-group">
                  <label className="erp-filter-label">Marca</label>
                  <select
                    className="erp-filter-select"
                    value={filters.marca}
                    onChange={e => setFilter('marca', e.target.value)}
                  >
                    <option value="">Todas las marcas</option>
                    {marcaOptions.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-filter-group">
                  <label className="erp-filter-label">Proveedor</label>
                  <select
                    className="erp-filter-select"
                    value={filters.proveedor}
                    onChange={e => setFilter('proveedor', e.target.value)}
                  >
                    <option value="">Todos los proveedores</option>
                    {proveedorOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.razonSocial}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-filter-group">
                  <label className="erp-filter-label">Estado</label>
                  <select
                    className="erp-filter-select"
                    value={filters.estado}
                    onChange={e => setFilter('estado', e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </>
            }
          />

          {/* Data Table */}
          <div className="erp-table-card">
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

          {/* Delete Confirmation Modal */}
          <CrudDialog
            isOpen={dialogState.isOpen && dialogState.mode === 'delete'}
            mode="delete"
            onClose={closeDialog}
            onConfirm={handleDeleteConfirm}
            loading={saving}
            title="Eliminar Producto"
            size="sm"
            deleteMessage={
              dialogState.record ? (
                <>
                  ¿Está seguro de eliminar el producto <strong>{dialogState.record.nombre}</strong> (
                  {dialogState.record.codigo})?
                </>
              ) : undefined
            }
          />
        </div>
      }
      formContent={
        <form onSubmit={handleSaveForm} className="erp-form">
          <div className="erp-form-section">
            <h3 className="erp-form-section-title">
              {formMode === 'create'
                ? 'Registro de Nuevo Producto'
                : formMode === 'edit'
                ? `Modificación de Producto: ${formState.codigo || ''}`
                : `Ficha Técnica de Producto: ${formState.codigo || ''}`}
            </h3>

          {error && (
            <div style={{ padding: '8px 12px', marginBottom: '14px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', border: '1px solid var(--erp-danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Section 1: Información General + foto */}
          <div className="erp-form-section-title" style={{ marginBottom: '8px' }}>
            <FiInfo /> Datos Principales
          </div>
          <div className="erp-form-with-photo">
            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Código (Generado)</label>
                  <input
                    type="text"
                    className="erp-input"
                    value={formState.codigo || ''}
                    onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="PROD-..."
                    disabled={formMode !== 'create'}
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Código SKU</label>
                  <input
                    type="text"
                    className="erp-input"
                    value={formState.sku || ''}
                    onChange={e => setFormState(prev => ({ ...prev, sku: e.target.value }))}
                    disabled={formMode === 'view'}
                    placeholder="Ej: SKU-001"
                  />
                </div>
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Nombre del Producto <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.nombre || ''}
                  onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Ej: Lapicero Azul Faber Castell"
                  required
                />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Descripción Detallada</label>
                <textarea
                  className="erp-input"
                  rows={2}
                  value={formState.descripcion || ''}
                  onChange={e => setFormState(prev => ({ ...prev, descripcion: e.target.value }))}
                  disabled={formMode === 'view'}
                  placeholder="Descripción, características o especificaciones..."
                />
              </div>
              {formMode === 'view' && formState.estado !== undefined && (
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado</label>
                  <div className="erp-form-status-value">
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
                  </div>
                </div>
              )}
            </div>

            <div className="erp-form-photo-col">
              <label className="erp-form-label">Imagen</label>
              {formMode === 'view' ? (
                imgSrc ? (
                  <div className="erp-form-photo-preview">
                    <img src={imgSrc} alt={formState.nombre} />
                  </div>
                ) : (
                  <div className="erp-form-photo-empty">
                    <span>Sin imagen registrada</span>
                  </div>
                )
              ) : (
                <ImageUpload
                  ref={imageUploadRef}
                  value={formState.rutaImagen}
                  onChange={ruta => setFormState(prev => ({ ...prev, rutaImagen: ruta }))}
                  folder="productos"
                  label="Fotografía del producto"
                  compact
                />
              )}
            </div>
          </div>
          </div>

          {/* Section 2: Clasificación y Relaciones */}
          <div className="erp-form-section">
            <div className="erp-form-section-title" style={{ marginBottom: '8px' }}>
              <FiTag /> Clasificación & Proveedor
            </div>
            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Categoría <span className="required-star">*</span></label>
                  <select
                    className="erp-input"
                    value={formState.idCategoria || ''}
                    onChange={e => setFormState(prev => ({ ...prev, idCategoria: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                    required
                  >
                    <option value="">Seleccione categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Marca <span className="required-star">*</span></label>
                  <select
                    className="erp-input"
                    value={formState.idMarca || ''}
                    onChange={e => setFormState(prev => ({ ...prev, idMarca: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                    required
                  >
                    <option value="">Seleccione marca</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Proveedor <span className="required-star">*</span></label>
                  <select
                    className="erp-input"
                    value={formState.idProveedor || ''}
                    onChange={e => setFormState(prev => ({ ...prev, idProveedor: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                    required
                  >
                    <option value="">Seleccione proveedor</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.razonSocial}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Unidad de Medida <span className="required-star">*</span></label>
                  <select
                    className="erp-input"
                    value={formState.idUnidadMedida || ''}
                    onChange={e => setFormState(prev => ({ ...prev, idUnidadMedida: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                    required
                  >
                    <option value="">Seleccione unidad</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Precios y Stock */}
          <div className="erp-form-section">
            <div className="erp-form-section-title" style={{ marginBottom: '8px' }}>
              <FiDollarSign /> Precios & Control de Stock
            </div>
            <div className="erp-form-fields">
              <div className="erp-form-row">
                <div className="erp-form-group">
                  <label className="erp-form-label">Precio de Venta (S/) <span className="required-star">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="erp-input"
                    value={formState.precioVenta ?? 0}
                    onChange={e => setFormState(prev => ({ ...prev, precioVenta: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                    required
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Factor de Conversión</label>
                  <input
                    type="number"
                    step="0.01"
                    className="erp-input"
                    value={formState.factorConversion ?? 1}
                    onChange={e => setFormState(prev => ({ ...prev, factorConversion: Number(e.target.value) }))}
                    disabled={formMode === 'view'}
                  />
                </div>
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Stock Mínimo</label>
                <input
                  type="number"
                  className="erp-input"
                  value={formState.stockMinimo ?? 0}
                  onChange={e => setFormState(prev => ({ ...prev, stockMinimo: Number(e.target.value) }))}
                  disabled={formMode === 'view'}
                />
              </div>
            </div>
          </div>

          {formMode !== 'view' && (
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
                <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Registrar Producto' : 'Guardar Cambios'}</span>
              </button>
            </div>
          )}
        </form>
      }
    />
  );
};

export default ProductsSection;
