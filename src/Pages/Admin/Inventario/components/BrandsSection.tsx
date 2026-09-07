import { useState, useCallback, useMemo, useRef } from 'react';
import { MarcaService } from '../../../../Services/Admin/Inventario/Marca';
import type {
  MarcaSelectDto,
  MarcaInsertDto,
  MarcaUpdateDto,
} from '../../../../Types/Admin/Inventario/Marca';

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
  FiBookmark,
  FiCheckCircle,
  FiMinusCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiSave,
  FiX,
} from 'react-icons/fi';

interface MarcaFilters {
  estado: string;
}

const DEFAULT_FILTERS: MarcaFilters = { estado: '' };

const EMPTY_FORM: Partial<MarcaSelectDto> = {
  nombre: '',
  urlImagen: '',
  publicIdImagen: '',
  estado: true,
};

const marcaCrudService = {
  getAll: () => MarcaService.getMarcas(),
  getById: (id: number) => MarcaService.getMarcaById(id),
  create: (data: MarcaInsertDto) => MarcaService.createMarca(data),
  update: (data: MarcaUpdateDto) => MarcaService.updateMarca(data),
  delete: (id: number) => MarcaService.deleteMarca(id),
};

export const BrandsSection = () => {
  const { items: brands, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<MarcaSelectDto, MarcaInsertDto, MarcaUpdateDto>(marcaCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<MarcaSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<MarcaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [showDisabled, setShowDisabled] = useState(false);
  const [formState, setFormState] = useState<Partial<MarcaSelectDto>>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const originalRutaRef = useRef('');
  const originalPublicIdRef = useRef('');

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (marca: MarcaSelectDto) => {
      if (!showDisabled && !marca.estado) return false;
      if (filters.estado) {
        if (filters.estado === 'ACTIVO' && !marca.estado) return false;
        if (filters.estado === 'INACTIVO' && marca.estado) return false;
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
  } = useDataTable<MarcaSelectDto>({
    data: brands,
    searchKeys: ['nombre'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = brands.length;
    const activos = brands.filter(b => b.estado).length;
    return { total, activos, inactivos: total - activos };
  }, [brands]);

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    originalRutaRef.current = '';
    originalPublicIdRef.current = '';
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: MarcaSelectDto) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
    originalRutaRef.current = detail.urlImagen || '';
    originalPublicIdRef.current = detail.publicIdImagen || '';
  };

  const handleStartView = async (record: MarcaSelectDto) => {
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
          urlImagen: ruta,
          estado: formState.estado !== false,
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
      render: (row: MarcaSelectDto) => `#${row.id}`,
    },
    {
      key: 'logo',
      header: 'Logo',
      width: '60px',
      render: (row: MarcaSelectDto) => {
        const src = resolveImageUrl(row.urlImagen);
        return src ? (
          <div style={{ width: '42px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0px', padding: '2px' }}>
            <img src={src} alt={row.nombre} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          </div>
        ) : (
          <div style={{ width: '42px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--erp-bg-secondary)', border: '1px solid var(--erp-border)', borderRadius: '0px', color: 'var(--erp-text-muted)' }}>
            <FiBookmark size={12} />
          </div>
        );
      },
    },
    {
      key: 'nombre',
      header: 'Marca',
      sortable: true,
      render: (row: MarcaSelectDto) => (
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
      render: (row: MarcaSelectDto) => (
        <StatusBadge status={row.estado ? 'ACTIVO' : 'INACTIVO'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: MarcaSelectDto) => (
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
          <div className="erp-indicator-icon"><FiBookmark /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Marcas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.activos}</span>
            <span className="erp-indicator-label">Marcas Activas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon danger"><FiMinusCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.inactivos}</span>
            <span className="erp-indicator-label">Marcas Inactivas</span>
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
        searchPlaceholder="Buscar por nombre de marca..."
        onNew={handleStartCreate}
        newLabel="Nueva Marca"
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
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando marcas...</div>
      ) : (
        <>
          <DataTable columns={columns} data={processedData} sortConfig={sortConfig} onSort={handleSort} rowKey={row => row.id} emptyMessage="No se encontraron marcas" />
          <Pagination page={pagination.page} totalPages={totalPages} totalItems={totalItems} pageSize={pagination.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
      <div className="erp-form-section">
        <h3 className="erp-form-section-title">
          {formMode === 'create' && 'Nueva Marca'}
          {formMode === 'edit' && `Editando Marca #${selectedId}`}
          {formMode === 'view' && `Detalle de Marca #${selectedId}`}
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
                placeholder="Ej: Faber-Castell"
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
            <label className="erp-form-label">Logo / Imagen</label>
            {formMode === 'view' ? (
              resolveImageUrl(formState.urlImagen) ? (
                <div className="erp-form-photo-preview">
                  <img src={resolveImageUrl(formState.urlImagen)!} alt={formState.nombre} />
                </div>
              ) : (
                <div className="erp-form-photo-empty">
                  <FiBookmark size={24} />
                  <span>Sin logo</span>
                </div>
              )
            ) : (
              <ImageUpload
                ref={imageUploadRef}
                value={formState.urlImagen}
                onChange={urlImagen => setFormState(prev => ({ ...prev, urlImagen }))}
                folder="marcas"
                label="Logo de la marca"
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
            <span>{saving || submitting ? 'Guardando...' : formMode === 'create' ? 'Crear Marca' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Marcas Comerciales"
        subtitle="Administra y clasifica las marcas de los productos comercializados"
        entityName="Marca"
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
        title="Eliminar Marca"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar la marca <strong>{dialogState.record.nombre}</strong>?</>
          ) : undefined
        }
      />
    </>
  );
};

export default BrandsSection;
