import { useState, useCallback, useMemo, useRef } from 'react';

import { CategoriaService } from '../../../../Services/Admin/Inventario/Categoria';
import type {
  CategoriaSelectDto,
  CategoriaInsertDto,
  CategoriaUpdateDto,
} from '../../../../Types/Admin/Inventario/Categoria';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
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
  FiFolder,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
} from 'react-icons/fi';

interface CategoriaFilters {
  estado: string;
}

const DEFAULT_FILTERS: CategoriaFilters = { estado: '' };

const EMPTY_FORM: Partial<CategoriaSelectDto> = {
  nombre: '',
  urlImagen: '',
  publicIdImagen: '',
  estado: true,
};

import { resolveImageUrl, gestionarImagenAlGuardar } from '../../../../Utils/imageUtils';

const categoriaCrudService = {
  getAll: () => CategoriaService.getCategorias(),
  getById: (id: number) => CategoriaService.getCategoriaById(id),
  create: (data: CategoriaInsertDto) => CategoriaService.createCategoria(data),
  update: (data: CategoriaUpdateDto) => CategoriaService.updateCategoria(data),
  delete: (id: number) => CategoriaService.deleteCategoria(id),
};

const CategoriesSection = () => {
  const { items: categories, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<CategoriaSelectDto, CategoriaInsertDto, CategoriaUpdateDto>(categoriaCrudService);

  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } =
    useDialog<CategoriaSelectDto>();

  const [filters, setFilters] = useState<CategoriaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<CategoriaSelectDto>>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const originalRutaRef = useRef('');
  const originalPublicIdRef = useRef('');

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (cat: CategoriaSelectDto) => {
      if (!showDisabled && !cat.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !cat.estado) return false;
        if (filters.estado === 'INACTIVO' && cat.estado) return false;
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
  } = useDataTable<CategoriaSelectDto>({
    data: categories,
    searchKeys: ['nombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = categories.length;
    const activos = categories.filter(c => c.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [categories]);

  const handleOpenDialog = async (mode: typeof dialogState.mode, record?: CategoriaSelectDto) => {
    if (record && (mode === 'view' || mode === 'edit')) {
      const detail = await fetchById(record.id, record);
      setFormState({ ...detail });
      originalRutaRef.current = detail.urlImagen || '';
      originalPublicIdRef.current = detail.publicIdImagen || '';
    } else if (mode === 'delete' && record) {
      setFormState({ ...record });
    } else {
      originalRutaRef.current = '';
      originalPublicIdRef.current = '';
      setFormState({ ...EMPTY_FORM });
    }

    if (mode === 'create') openCreate();
    else if (mode === 'edit') openEdit(record!);
    else if (mode === 'view') openView(record!);
    else if (mode === 'delete') openDelete(record!);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const pending = imageUploadRef.current?.getPendingFile();
      const { ruta } = await gestionarImagenAlGuardar({
        pendingFile: pending?.file ?? null,
        rutaFormulario: formState.urlImagen,
        publicIdFormulario: formState.publicIdImagen,
        rutaOriginal: originalRutaRef.current,
        publicIdOriginal: originalPublicIdRef.current,
        esEdicion: dialogState.mode === 'edit',
      });

      if (dialogState.mode === 'create') {
        await createItem({
          nombre: formState.nombre || '',
          urlImagen: ruta,
        });
      } else if (dialogState.mode === 'edit' && dialogState.record) {
        await updateItem({
          id: dialogState.record.id,
          nombre: formState.nombre || '',
          estado: formState.estado !== false,
          urlImagen: ruta,
        });
      } else if (dialogState.mode === 'delete' && dialogState.record) {
        await deleteItem(dialogState.record.id);
      }

      imageUploadRef.current?.clearPending();
      closeDialog();
    } catch {
      // error via hook
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '60px',
      render: (row: CategoriaSelectDto) => `#${row.id}`,
    },
    {
      key: 'url',
      header: 'Imagen',
      width: '52px',
      render: (row: CategoriaSelectDto) => {
        const src = resolveImageUrl(row.urlImagen);
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
            <FiFolder size={13} />
          </div>
        );
      },
    },
    {
      key: 'nombre',
      header: 'Nombre de Categoría',
      sortable: true,
      render: (row: CategoriaSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.nombre}</strong>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: CategoriaSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '100px',
      render: (row: CategoriaSelectDto) => (
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
          <div className="erp-indicator-icon"><FiFolder /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Categorías</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Categorías Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Categorías Inactivas</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre..."
        onNew={() => handleOpenDialog('create')}
        newLabel="Nueva Categoría"
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
              <label className="erp-form-label">Estado</label>
              <select className="erp-input" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="erp-table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando categorías...</div>
        ) : (
          <>
            <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron categorías" />
            <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>

      <CrudDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={saving || submitting}
        title={
          dialogState.mode === 'create' ? 'Agregar Categoría' :
          dialogState.mode === 'edit' ? 'Editar Categoría' :
          dialogState.mode === 'view' ? 'Detalle de Categoría' : 'Eliminar Categoría'
        }
        size="md"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la categoría <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      >
        {dialogState.mode !== 'delete' && (
          <div className="erp-dialog-split">
            <div className="erp-dialog-split-fields" style={{ gridTemplateColumns: '1fr' }}>
              <div className="erp-form-group">
                <label className="erp-form-label">Nombre de Categoría</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.nombre || ''}
                  onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={dialogState.mode === 'view'}
                  placeholder="Ej: Lápices y Lapiceros"
                />
              </div>
              {(dialogState.mode === 'edit' || dialogState.mode === 'view') && (
                <div className="erp-form-group">
                  <label className="erp-form-label">Estado</label>
                  {dialogState.mode === 'view' ? (
                    <div style={{ paddingTop: '4px' }}><StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} /></div>
                  ) : (
                    <select className="erp-input" value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'} onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}>
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="erp-dialog-split-side">
              {dialogState.mode === 'view' ? (
                <div>
                  <label className="erp-form-label">Imagen</label>
                  {resolveImageUrl(formState.urlImagen) ? (
                    <img
                      src={resolveImageUrl(formState.urlImagen)!}
                      alt={formState.nombre}
                      style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--erp-border)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100px', borderRadius: '8px', border: '1px dashed var(--erp-border)', backgroundColor: 'var(--erp-bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--erp-text-muted)' }}>
                      <FiFolder size={24} />
                      <span style={{ fontSize: '11px' }}>Sin imagen</span>
                    </div>
                  )}
                </div>
              ) : (
                <ImageUpload
                  ref={imageUploadRef}
                  value={formState.urlImagen}
                  onChange={urlImagen => setFormState(prev => ({ ...prev, urlImagen }))}
                  folder="categorias"
                  label="Imagen de la categoría"
                  compact
                />
              )}
            </div>
          </div>
        )}
      </CrudDialog>
    </div>
  );
};

export default CategoriesSection;
