import { useState, useCallback, useMemo } from 'react';
import { mockProductos, mockCategorias } from '../../../../Constantes/Data/MockData';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { useFilters } from '../../../../Hooks/useFilters';
import { generateId } from '../../../../Utils/formatters';
import type { Producto } from '../../../../Types/Producto';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import { FiBox, FiAlertTriangle, FiCheckCircle, FiMinusCircle, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProductsSection = () => {
  const [products, setProducts] = useState<Producto[]>(mockProductos);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Producto>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  // Dialog Form State
  const [formState, setFormState] = useState<Partial<Producto>>({});

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (prod: Producto) => {
      if (filters.categoria && prod.categoria !== filters.categoria) return false;
      if (filters.stockStatus) {
        const stock = prod.stock ?? 0;
        if (filters.stockStatus === 'BAJO' && stock > 20) return false;
        if (filters.stockStatus === 'OK' && stock <= 20) return false;
      }
      if (filters.estado && prod.estado !== filters.estado) return false;
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
  } = useDataTable<Producto>({
    data: products,
    searchKeys: ['codigo', 'nombre', 'categoria', 'descripcion'],
    defaultPageSize: 8,
    externalFilter,
  });

  // Indicators values
  const indicators = useMemo(() => {
    const total = products.length;
    const activos = products.filter(p => p.estado === 'ACTIVO').length;
    const bajoStock = products.filter(p => (p.stock ?? 0) <= 20).length;
    const inactivos = total - activos;
    return { total, activos, bajoStock, inactivos };
  }, [products]);

  // CRUD Handlers
  const handleOpenDialog = (mode: typeof dialogState.mode, record?: Producto) => {
    setFormState(record ? { ...record } : { codigo: '', nombre: '', idCategoria: 1, categoria: 'Útiles Escolares', descripcion: '', precio: 0, stock: 0, estado: 'ACTIVO', imagenUrl: '' });
    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = () => {
    if (dialogState.mode === 'create') {
      const selectedCat = mockCategorias.find(c => c.id === Number(formState.idCategoria));
      const newProduct: Producto = {
        id: Number(generateId().replace(/\D/g, '').slice(0, 6)),
        codigo: formState.codigo || 'PROD-' + Date.now().toString().slice(-4),
        nombre: formState.nombre || '',
        idCategoria: Number(formState.idCategoria) || 1,
        categoria: selectedCat?.nombre || 'Útiles Escolares',
        descripcion: formState.descripcion || '',
        precio: Number(formState.precio) || 0,
        stock: Number(formState.stock) || 0,
        estado: formState.estado || 'ACTIVO',
        imagenUrl: formState.imagenUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=80&q=80',
      };
      setProducts(prev => [newProduct, ...prev]);
    } else if (dialogState.mode === 'edit' && dialogState.record) {
      const selectedCat = mockCategorias.find(c => c.id === Number(formState.idCategoria));
      setProducts(prev =>
        prev.map(p =>
          p.id === dialogState.record!.id
            ? { ...p, ...formState, categoria: selectedCat?.nombre || p.categoria } as Producto
            : p
        )
      );
    } else if (dialogState.mode === 'delete' && dialogState.record) {
      setProducts(prev => prev.filter(p => p.id !== dialogState.record!.id));
    }
    closeDialog();
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true,
      width: '100px',
      render: (row: Producto) => <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>,
    },
    {
      key: 'imagenUrl',
      header: 'Imagen',
      width: '60px',
      render: (row: Producto) => (
        <img
          src={row.imagenUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=80&q=80'}
          alt={row.nombre}
          style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--erp-border)' }}
        />
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (row: Producto) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.nombre}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {row.descripcion}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      sortable: true,
      width: '140px',
    },
    {
      key: 'precio',
      header: 'Precio',
      sortable: true,
      align: 'right' as const,
      width: '100px',
      render: (row: Producto) => `S/ ${(row.precio || 0).toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      align: 'center' as const,
      width: '90px',
      render: (row: Producto) => {
        const isLow = (row.stock ?? 0) <= 20;
        return (
          <span style={{
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: isLow ? 'var(--erp-danger-light)' : 'var(--erp-success-light)',
            color: isLow ? 'var(--erp-danger)' : 'var(--erp-success)'
          }}>
            {row.stock}
          </span>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '110px',
      render: (row: Producto) => <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: Producto) => (
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
      {/* Indicators */}
      <div className="erp-indicators-grid">
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
          <div className="erp-indicator-icon warning"><FiAlertTriangle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.bajoStock}</span>
            <span className="erp-indicator-label">Bajo Stock (≤ 20)</span>
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

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código, nombre o descripción..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nuevo Producto"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
            <div className="erp-form-group">
              <label className="erp-form-label">Categoría</label>
              <select
                className="erp-input"
                value={filters.categoria || ''}
                onChange={e => setFilter('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {mockCategorias.map(c => (
                  <option key={c.id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Nivel de Stock</label>
              <select
                className="erp-input"
                value={filters.stockStatus || ''}
                onChange={e => setFilter('stockStatus', e.target.value)}
              >
                <option value="">Todos los niveles</option>
                <option value="BAJO">Stock Crítico (≤ 20)</option>
                <option value="OK">Stock Óptimo (&gt; 20)</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              <select
                className="erp-input"
                value={filters.estado || ''}
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

      {/* Compact Table wrapper */}
      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={processedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          rowKey={(row) => row.id}
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
      </div>

      {/* Reusable Dialog */}
      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={
          dialogState.mode === 'create' ? 'Agregar Producto' :
          dialogState.mode === 'edit' ? 'Editar Producto' :
          dialogState.mode === 'view' ? 'Detalle de Producto' : 'Eliminar Producto'
        }
        size="lg"
      >
        <div className="erp-form-grid">
          <div className="erp-form-group">
            <label className="erp-form-label">Código de Producto</label>
            <input
              type="text"
              className="erp-input"
              value={formState.codigo || ''}
              onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Ej: PROD-900"
            />
          </div>
          <div className="erp-form-group">
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
            <label className="erp-form-label">Categoría</label>
            <select
              className="erp-input"
              value={formState.idCategoria || 1}
              onChange={e => setFormState(prev => ({ ...prev, idCategoria: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            >
              {mockCategorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Estado</label>
            <select
              className="erp-input"
              value={formState.estado || 'ACTIVO'}
              onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
              disabled={dialogState.mode === 'view'}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Precio Unitario (S/)</label>
            <input
              type="number"
              step="0.01"
              className="erp-input"
              value={formState.precio || 0}
              onChange={e => setFormState(prev => ({ ...prev, precio: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Stock Inicial</label>
            <input
              type="number"
              className="erp-input"
              value={formState.stock || 0}
              onChange={e => setFormState(prev => ({ ...prev, stock: Number(e.target.value) }))}
              disabled={dialogState.mode === 'view'}
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Imagen URL</label>
            <input
              type="text"
              className="erp-input"
              value={formState.imagenUrl || ''}
              onChange={e => setFormState(prev => ({ ...prev, imagenUrl: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <div className="erp-form-group col-span-2">
            <label className="erp-form-label">Descripción</label>
            <textarea
              className="erp-input"
              rows={3}
              value={formState.descripcion || ''}
              onChange={e => setFormState(prev => ({ ...prev, descripcion: e.target.value }))}
              disabled={dialogState.mode === 'view'}
              placeholder="Detalles adicionales del producto..."
            />
          </div>
        </div>
      </CrudDialog>
    </div>
  );
};

export default ProductsSection;
