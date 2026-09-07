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
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import { resolveImageUrl, gestionarImagenAlGuardar } from '../../../../Utils/imageUtils';
import {
  FiFolder,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
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

const categoriaCrudService = {
  getAll: () => CategoriaService.getCategorias(),
  getById: (id: number) => CategoriaService.getCategoriaById(id),
  create: (data: CategoriaInsertDto) => CategoriaService.createCategoria(data),
  update: (data: CategoriaUpdateDto) => CategoriaService.updateCategoria(data),
  delete: (id: number) => CategoriaService.deleteCategoria(id),
};

export const CategoriesSection = () => {
  const { items: categories, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<CategoriaSelectDto, CategoriaInsertDto, CategoriaUpdateDto>(categoriaCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<CategoriaSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<CategoriaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
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

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    originalRutaRef.current = '';
    originalPublicIdRef.current = '';
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: CategoriaSelectDto) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
    originalRutaRef.current = detail.urlImagen || '';
    originalPublicIdRef.current = detail.publicIdImagen || '';
  };

  const handleStartView = async (record: CategoriaSelectDto) => {
    setSelectedId(record.id);
    setFormMode('view');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
    originalRutaRef.current = detail.urlImagen || '';
    originalPublicIdRef.current = detail.publicIdImagen || '';
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;
    setSubmitting(true);
    try {
      const pending = imageUploadRef.current?.getPendingFile();
      const { ruta } = await gestionarImagenAlGuardar({
        pendingFile: pending?.file ?? null,
        rutaFormulario: formState.urlImagen,
        publicIdFormulario: formState.publicIdImagen,
        rutaOriginal: originalRutaRef.current,
        publicIdOriginal: originalPublicIdRef.current,
        esEdicion: formMode === 'edit',
      });

      if (formMode === 'create') {
        await createItem({
          nombre: formState.nombre || '',
          urlImagen: ruta,
        });
      } else if (formMode === 'edit' && selectedId) {
        await updateItem({
          id: selectedId,
          nombre: formState.nombre || '',
          estado: formState.estado !== false,
          urlImagen: ruta,
        });
      }

      imageUploadRef.current?.clearPending();
      setActiveTab('list');
    } catch {
      // error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (dialogState.record) {
      await deleteItem(dialogState.record.id);
      closeDialog();
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
              width: '30px',
              height: '30px',
              objectFit: 'cover',
              borderRadius: '0px',
              border: '1px solid var(--erp-border)',
            }}
          />
        ) : (
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '0px',
              border: '1px solid var(--erp-border)',
              backgroundColor: 'var(--erp-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--erp-text-muted)',
            }}
          >
            <FiFolder size={14} />
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
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: CategoriaSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: CategoriaSelectDto) => (
        <div className="erp-table-actions">
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleStartView(row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleStartEdit(row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => openDelete(row)} />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          className={`erp-btn erp-btn-sm erp-btn-secondary${showDisabled ? ' active' : ''}`}
          onClick={() => setShowDisabled(prev => !prev)}
        >
          {showDisabled ? <FiEyeOff /> : <FiEye />}
          <span>{showDisabled ? 'Ocultar inactivos' : 'Mostrar inactivos'}</span>
        </button>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre de categoría..."
        onNew={handleStartCreate}
        newLabel="Nueva Categoría"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Estado</label>
            <select className="erp-filter-select" value={filters.estado} onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}>
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando categorías...</div>
      ) : (
        <>
          <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron categorías" />
          <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
      <div className="erp-form-section">
        <h3 className="erp-form-section-title">
          {formMode === 'create' && 'Nueva Categoría'}
          {formMode === 'edit' && `Editando Categoría #${selectedId}`}
          {formMode === 'view' && `Detalle de Categoría #${selectedId}`}
        </h3>

        <div className="erp-form-with-photo">
          <div className="erp-form-fields">
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                disabled={formMode === 'view'}
                placeholder="Ej: Lápices y Lapiceros"
                required
              />
            </div>

            {(formMode === 'edit' || formMode === 'view') && (
              <div className="erp-form-group">
                <label className="erp-form-label">Estado</label>
                {formMode === 'view' ? (
                  <div className="erp-form-status-value">
                    <StatusBadge status={formState.estado ? 'ACTIVO' : 'INACTIVO'} showText />
                  </div>
                ) : (
                  <select
                    className="erp-input"
                    value={formState.estado !== false ? 'ACTIVO' : 'INACTIVO'}
                    onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value === 'ACTIVO' }))}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="erp-form-photo-col">
            <label className="erp-form-label">Imagen</label>
            {formMode === 'view' ? (
              resolveImageUrl(formState.urlImagen) ? (
                <div className="erp-form-photo-preview">
                  <img src={resolveImageUrl(formState.urlImagen)!} alt={formState.nombre} />
                </div>
              ) : (
                <div className="erp-form-photo-empty">
                  <FiFolder size={24} />
                  <span>Sin imagen</span>
                </div>
              )
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
            disabled={saving || submitting}
          >
            <FiSave />
            <span>{saving || submitting ? 'Guardando...' : formMode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Categorías de Productos"
        subtitle="Organiza los artículos del inventario en categorías temáticas"
        entityName="Categoría"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formMode={formMode}
        onNew={handleStartCreate}
        listContent={listContent}
        formContent={formContent}
      />

      <CrudDialog
        isOpen={dialogState.isOpen && dialogState.mode === 'delete'}
        mode="delete"
        onClose={closeDialog}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Eliminar Categoría"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la categoría <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      />
    </>
  );
};

export default CategoriesSection;
